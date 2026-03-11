# src/training/trainer.py

import sys
import os

# Add project root to path so imports work
sys.path.append(os.path.dirname(os.path.dirname(
    os.path.dirname(os.path.abspath(__file__)))))

import torch
import numpy as np
from transformers import (
    AutoModelForSequenceClassification,
    TrainingArguments,
    Trainer,
    EarlyStoppingCallback
)
from sklearn.metrics import (
    accuracy_score,
    f1_score
)

from src.data.preprocessor import LegalTextPreprocessor
from src.data.dataset import LegalPetitionDataset
from src.training.config import TrainingConfig


def compute_metrics(eval_pred):
    """
    Called automatically after each epoch.
    Calculates accuracy and F1 score on validation set.
    """
    logits, labels = eval_pred
    predictions = np.argmax(logits, axis=-1)
    accuracy = accuracy_score(labels, predictions)
    f1 = f1_score(labels, predictions, average='weighted')
    print(f"\nAccuracy: {accuracy:.4f} | F1: {f1:.4f}")
    return {
        'accuracy': accuracy,
        'f1': f1
    }


def train():
    cfg = TrainingConfig()

    print("=" * 50)
    print("  InLegalBERT Fine-tuning v2")
    print("=" * 50)
    print(f"Model      : {cfg.MODEL_NAME}")
    print(f"Epochs     : {cfg.EPOCHS}")
    print(f"Batch size : {cfg.BATCH_SIZE}")
    print(f"Max length : {cfg.MAX_LENGTH}")
    print(f"FP16       : {cfg.FP16}")
    print("=" * 50)

    # ── CHECK GPU ────────────────────────────────────────────
    device = 'cuda' if torch.cuda.is_available() else 'cpu'
    print(f"\nDevice: {device.upper()}")
    if device == 'cuda':
        print(f"GPU : {torch.cuda.get_device_name(0)}")
        print(f"VRAM: {torch.cuda.get_device_properties(0).total_memory / 1e9:.1f} GB")

    # ── LOAD PREPROCESSOR ────────────────────────────────────
    print("\nLoading preprocessor...")
    preprocessor = LegalTextPreprocessor(
        model_name=cfg.MODEL_NAME,
        max_length=cfg.MAX_LENGTH
    )

    # ── LOAD DATASETS ────────────────────────────────────────
    print("\nLoading datasets...")
    train_dataset = LegalPetitionDataset(cfg.TRAIN_DATA, preprocessor)
    val_dataset = LegalPetitionDataset(cfg.VAL_DATA, preprocessor)
    print(f"Train: {len(train_dataset)} | Val: {len(val_dataset)}")

    # ── LOAD MODEL ───────────────────────────────────────────
    print("\nLoading InLegalBERT model...")
    model = AutoModelForSequenceClassification.from_pretrained(
        cfg.MODEL_NAME,
        num_labels=cfg.NUM_LABELS
    )

    # Enable gradient checkpointing to save VRAM on RTX 3050
    if cfg.GRADIENT_CHECKPOINTING:
        model.gradient_checkpointing_enable()
        print("Gradient checkpointing enabled")

    # ── TRAINING ARGUMENTS ───────────────────────────────────
    os.makedirs(cfg.OUTPUT_DIR, exist_ok=True)

    training_args = TrainingArguments(
        output_dir=cfg.OUTPUT_DIR,
        num_train_epochs=cfg.EPOCHS,
        per_device_train_batch_size=cfg.BATCH_SIZE,
        per_device_eval_batch_size=cfg.BATCH_SIZE,
        gradient_accumulation_steps=cfg.GRADIENT_ACCUM_STEPS,
        warmup_ratio=cfg.WARMUP_RATIO,
        weight_decay=cfg.WEIGHT_DECAY,
        learning_rate=cfg.LEARNING_RATE,
        fp16=cfg.FP16,
        evaluation_strategy='epoch',
        save_strategy='epoch',
        load_best_model_at_end=True,
        metric_for_best_model='f1',
        logging_dir='./logs',
        logging_steps=100,
        save_total_limit=2,
        report_to='none'
    )

    # ── WEIGHTED TRAINER (fixes class imbalance) ─────────────
    # REJECT: 18920 cases, ADMIT: 13385 cases
    # WeightedTrainer gives more importance to ADMIT
    # so model doesn't just predict REJECT for everything

    class WeightedTrainer(Trainer):
        def compute_loss(self, model, inputs,
                         return_outputs=False, **kwargs):
            labels = inputs.get('labels')
            outputs = model(**inputs)
            logits = outputs.get('logits')

            # Class weights — ADMIT gets higher weight
            weights = torch.tensor(
                [cfg.CLASS_WEIGHT_REJECT,
                 cfg.CLASS_WEIGHT_ADMIT]
            ).to(logits.device)

            loss_fn = torch.nn.CrossEntropyLoss(weight=weights)
            loss = loss_fn(logits, labels)

            return (loss, outputs) if return_outputs else loss

    # ── BUILD TRAINER ────────────────────────────────────────
    trainer = WeightedTrainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        eval_dataset=val_dataset,
        compute_metrics=compute_metrics,
        callbacks=[EarlyStoppingCallback(
            early_stopping_patience=3)]
    )

    # ── START TRAINING ───────────────────────────────────────
    print("\nStarting training...")
    print("Expected time: 1-2 hours on RTX 3050")
    print("Watch the loss go down each epoch!\n")

    trainer.train()

    # ── SAVE FINAL MODEL ─────────────────────────────────────
    print("\nSaving final model...")
    trainer.save_model(cfg.OUTPUT_DIR)
    preprocessor.tokenizer.save_pretrained(cfg.OUTPUT_DIR)
    print(f"Model saved to {cfg.OUTPUT_DIR}")

    # ── FINAL EVALUATION ─────────────────────────────────────
    print("\nRunning final evaluation on validation set...")
    results = trainer.evaluate()
    print(f"\nFinal Results:")
    print(f"Accuracy : {results['eval_accuracy']:.4f}")
    print(f"F1 Score : {results['eval_f1']:.4f}")

    return trainer, model


if __name__ == '__main__':
    train()