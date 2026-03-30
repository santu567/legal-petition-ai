import os
import torch
import pandas as pd
import numpy as np
from datasets import Dataset
from transformers import (
    AutoTokenizer, 
    AutoModelForSequenceClassification,
    TrainingArguments, 
    Trainer
)
import evaluate
from torch import nn

# 1. Configuration
MODEL_NAME = "law-ai/InLegalBERT"  # Make sure this is InLegalBERT!
DATA_PATH = "ml/data/processed/train.csv" # Point this to your new combined dataset
OUTPUT_DIR = "./results_inlegalbert"
MAX_LENGTH = 512

print("Loading dataset from", DATA_PATH)
df = pd.read_csv(DATA_PATH)

# Auto-detect column names
TEXT_COL = next((col for col in df.columns if 'text' in col.lower() or 'petition' in col.lower()), "text")
LABEL_COL = next((col for col in df.columns if 'label' in col.lower() or 'target' in col.lower() or 'outcome' in col.lower()), "label")

print(f"Using '{TEXT_COL}' for text and '{LABEL_COL}' for labels.")

# Clean out any empty rows
df = df[[TEXT_COL, LABEL_COL]].dropna().reset_index(drop=True)
df[LABEL_COL] = df[LABEL_COL].astype(int)

# 2. Extract Head & Tail Feature (CRITICAL FIX)
print("Applying Head + Tail text extraction...")
def extract_critical_text(text):
    words = str(text).split()
    if len(words) > 400:
        # First 150 words + Last 250 words
        words = words[:150] + words[-250:]
    return ' '.join(words)

df[TEXT_COL] = df[TEXT_COL].apply(extract_critical_text)


# 3. Calculate Class Weights (CRITICAL FIX)
# We calculate how imbalanced your dataset is
count_rejected = len(df[df[LABEL_COL] == 0])
count_admitted = len(df[df[LABEL_COL] == 1])
total = count_rejected + count_admitted

print(f"\nDataset Distribution:")
print(f"Rejected: {count_rejected}")
print(f"Admitted: {count_admitted}")

# Weight = Total / (Number of classes * class_count)
weight_rejected = total / (2.0 * count_rejected)
weight_admitted = total / (2.0 * count_admitted)
class_weights = torch.tensor([weight_rejected, weight_admitted], dtype=torch.float32)

if torch.cuda.is_available():
    class_weights = class_weights.to("cuda")

print(f"Assigned Class Weights -> Rejected: {weight_rejected:.2f}, Admitted: {weight_admitted:.2f}\n")


# 4. Tokenization & Setup
print("Tokenizing data...")
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)

hf_dataset = Dataset.from_pandas(df)
# Hugging Face requires the label column to be formally explicitly cast as a 'ClassLabel' before it can stratify
hf_dataset = hf_dataset.class_encode_column(LABEL_COL)
hf_dataset = hf_dataset.train_test_split(test_size=0.1, stratify_by_column=LABEL_COL, seed=42)

def tokenize_function(examples):
    return tokenizer(examples[TEXT_COL], truncation=True, padding="max_length", max_length=MAX_LENGTH)

tokenized_datasets = hf_dataset.map(tokenize_function, batched=True)
tokenized_datasets = tokenized_datasets.rename_column(LABEL_COL, "labels")
tokenized_datasets.set_format("torch", columns=["input_ids", "attention_mask", "labels"])


# 5. Define Custom Trainer with Class Weights
class WeightedTrainer(Trainer):
    def compute_loss(self, model, inputs, return_outputs=False, num_items_in_batch=None):
        labels = inputs.pop("labels")
        outputs = model(**inputs)
        logits = outputs.logits
        
        # Apply the class weights to the loss function
        loss_fct = nn.CrossEntropyLoss(weight=class_weights)
        loss = loss_fct(logits.view(-1, self.model.config.num_labels), labels.view(-1))
        
        return (loss, outputs) if return_outputs else loss


# 6. Evaluation Metrics
accuracy_metric = evaluate.load("accuracy")
f1_metric = evaluate.load("f1")

def compute_metrics(eval_pred):
    logits, labels = eval_pred
    preds = np.argmax(logits, axis=-1)
    return {
        "accuracy": float(accuracy_metric.compute(predictions=preds, references=labels)["accuracy"]),
        "f1": float(f1_metric.compute(predictions=preds, references=labels, average="binary")["f1"])
    }


# 7. Start Training
print("Loading model...")
model = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME, num_labels=2)

training_args = TrainingArguments(
    output_dir=OUTPUT_DIR,
    num_train_epochs=3,                     
    per_device_train_batch_size=4,          # Lowered batch size to fit strictly inside 4GB RTX 3050
    gradient_accumulation_steps=2,          # Keeps the math the same by combining 2 small batches!
    per_device_eval_batch_size=8,
    fp16=True,                              # CRITICAL: Slices GPU memory size in half!
    evaluation_strategy="epoch",
    save_strategy="epoch",
    learning_rate=2e-5,                     # Keep LR small to prevent catastrophic forgetting
    weight_decay=0.01,
    logging_steps=100,
    load_best_model_at_end=True,
    metric_for_best_model="f1",
)

trainer = WeightedTrainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_datasets["train"],
    eval_dataset=tokenized_datasets["test"],
    tokenizer=tokenizer,
    compute_metrics=compute_metrics,
)

print("\nStarting Training with Class Weights...")
trainer.train()

# 8. Save Model
SAVE_DIR = "ml/models/inlegalbert-finetuned-v2"
os.makedirs(SAVE_DIR, exist_ok=True)
model.save_pretrained(SAVE_DIR)
tokenizer.save_pretrained(SAVE_DIR)
print(f"\n✅ Retraining Complete! Weighted model saved to {SAVE_DIR}")
