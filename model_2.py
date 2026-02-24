#!pip install -q transformers datasets evaluate torch accelerate


from datasets import load_dataset, Dataset
from transformers import AutoTokenizer, AutoModelForSequenceClassification, TrainingArguments, Trainer
import evaluate
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
import torch


# ================================================================
# Full end-to-end Colab script — no edits required
# Trains a prototype text classifier to predict admission_decision
# Expects CSV with columns: case_id, petition_type, admission_decision, petition_text
# (Your uploaded file admission_dataset_800.csv is used if present)
# ================================================================

# ---------------------------
# 0) Setup & installs
# ---------------------------
#!pip install -q transformers datasets evaluate accelerate sentencepiece

# ---------------------------
# 1) Imports & env check
# ---------------------------
import os, random
import pandas as pd
import numpy as np
import torch

from datasets import Dataset
from sklearn.model_selection import train_test_split
from transformers import (
    AutoTokenizer, AutoModelForSequenceClassification,
    TrainingArguments, Trainer, set_seed
)
import evaluate
print("Torch:", torch.__version__)
print("CUDA available:", torch.cuda.is_available())

# Set deterministic seed
SEED = 42
set_seed(SEED)
random.seed(SEED)
np.random.seed(SEED)
torch.manual_seed(SEED)
if torch.cuda.is_available():
    torch.cuda.manual_seed_all(SEED)
    print("Device: CUDA")
elif torch.backends.mps.is_available():
    torch.mps.manual_seed(SEED)
    print("Device: Apple MPS (Metal)")
else:
    print("Device: CPU")

# ---------------------------
# 2) Load dataset (auto-detect)
# ---------------------------
CSV_PATH = "cjpe_multi_train.csv"

if not os.path.exists(CSV_PATH):
    # If file isn't already in the environment, prompt for upload (works in Colab)
    try:
        from google.colab import files
        print("Please upload your CSV file when prompted (or ensure admission_dataset_800.csv is in the working directory).")
        uploaded = files.upload()
        # save uploaded file if exists
        for name in uploaded.keys():
            if name.endswith(".csv"):
                CSV_PATH = name
                print(f"Using uploaded file: {CSV_PATH}")
                break
    except Exception as e:
        print("Automatic upload not available. Make sure admission_dataset_800.csv is in the working directory.")
        raise e

# Load CSV
df = pd.read_csv(CSV_PATH, encoding="utf-8")
print("Dataset shape:", df.shape)
print("Columns:", list(df.columns))

# ---------------------------
# 3) Column detection & sanity checks
# ---------------------------
# Based on user input: text (text), label (target), ignore expert columns
TEXT_COL = "text"
LABEL_COL = "label"

if TEXT_COL not in df.columns or LABEL_COL not in df.columns:
    raise ValueError(f"Expected columns '{TEXT_COL}' and '{LABEL_COL}' not found. Columns: {list(df.columns)}")

# Ensure no missing values in required columns
df = df[[TEXT_COL, LABEL_COL]].dropna().reset_index(drop=True)
print("After dropping NA rows:", df.shape)

# Ensure labels are ints 0/1 — if textual, convert to binary automatically
if df[LABEL_COL].dtype == object:
    # try mapping common textual labels
    mapping = {}
    unique_labels = df[LABEL_COL].unique().tolist()
    print("Detected textual labels:", unique_labels)
    # map anything containing 'accept' or 'allow' to 1, else 0
    for lab in unique_labels:
        s = str(lab).lower()
        if "accept" in s or "allow" in s or "admit" in s or "granted" in s:
            mapping[lab] = 1
        else:
            mapping[lab] = 0
    df[LABEL_COL] = df[LABEL_COL].map(mapping)
    print("Label mapping applied:", mapping)

# Final ensure labels are integers 0/1
df[LABEL_COL] = df[LABEL_COL].astype(int)
if not set(df[LABEL_COL].unique()).issubset({0,1}):
    raise ValueError("Target labels must be binary 0/1 after conversion. Found: " + str(df[LABEL_COL].unique()))

print("Label distribution:\n", df[LABEL_COL].value_counts())

# ---------------------------
# 4) Train-test split
# ---------------------------
train_df, test_df = train_test_split(df, test_size=0.2, random_state=SEED, stratify=df[LABEL_COL])
train_df = train_df.reset_index(drop=True)
test_df  = test_df.reset_index(drop=True)
print("Train size:", len(train_df), "Test size:", len(test_df))

train_dataset = Dataset.from_pandas(train_df)
test_dataset  = Dataset.from_pandas(test_df)

# ---------------------------
# 5) Tokenizer & tokenization
# ---------------------------
MODEL_NAME = "distilbert-base-uncased"
MAX_LENGTH = 256  # adjust for longer legal texts if necessary

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)

def tokenize_fn(examples):
    return tokenizer(examples[TEXT_COL], truncation=True, padding="max_length", max_length=MAX_LENGTH)

train_tokenized = train_dataset.map(tokenize_fn, batched=True)
test_tokenized  = test_dataset.map(tokenize_fn, batched=True)

# Set format for Trainer (remove unused columns)
cols_to_return = ["input_ids", "attention_mask", LABEL_COL]
train_tokenized = train_tokenized.remove_columns([c for c in train_tokenized.column_names if c not in cols_to_return])
test_tokenized  = test_tokenized.remove_columns([c for c in test_tokenized.column_names if c not in cols_to_return])

# Rename label column to "labels" (expected by Trainer)
train_tokenized = train_tokenized.rename_column(LABEL_COL, "labels")
test_tokenized  = test_tokenized.rename_column(LABEL_COL, "labels")

train_tokenized.set_format(type="torch")
test_tokenized.set_format(type="torch")

# ---------------------------
# 6) Model init
# ---------------------------
model = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME, num_labels=2)

# ---------------------------
# 7) Metrics
# ---------------------------
accuracy = evaluate.load("accuracy")
f1 = evaluate.load("f1")

def compute_metrics(eval_pred):
    logits, labels = eval_pred
    preds = np.argmax(logits, axis=-1)
    return {
        "accuracy": float(accuracy.compute(predictions=preds, references=labels)["accuracy"]),
        "f1": float(f1.compute(predictions=preds, references=labels, average="binary")["f1"])
    }

# ---------------------------
# 8) Training arguments
# ---------------------------
output_dir = "./results_distilbert_petition"
training_args = TrainingArguments(
    output_dir=output_dir,
    num_train_epochs=3,
    per_device_train_batch_size=16, # Increased since you have an M4 with 16GB RAM
    per_device_eval_batch_size=32,
    eval_strategy="epoch",
    save_strategy="epoch",
    learning_rate=2e-5,
    weight_decay=0.01,
    logging_steps=50,
    load_best_model_at_end=True,
    metric_for_best_model="f1",
    greater_is_better=True,
)

# ---------------------------
# 9) Trainer
# ---------------------------
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_tokenized,
    eval_dataset=test_tokenized,
    processing_class=tokenizer,
    compute_metrics=compute_metrics,
)

# ---------------------------
# 10) Train!
# ---------------------------
trainer.train()

# ---------------------------
# 11) Evaluate & show results
# ---------------------------
metrics = trainer.evaluate()
print("\n=== FINAL EVAL METRICS ===")
for k, v in metrics.items():
    print(f"{k}: {v:.4f}")

# Show confusion-style counts quickly
preds_output = trainer.predict(test_tokenized)
preds = np.argmax(preds_output.predictions, axis=-1)
labels = preds_output.label_ids
from sklearn.metrics import classification_report, confusion_matrix
print("\nClassification report:\n", classification_report(labels, preds, digits=4))
print("Confusion matrix:\n", confusion_matrix(labels, preds))

# ---------------------------
# 12) Test on new sample texts (examples)
# ---------------------------
sample_texts = [
    "The petitioner provides strong documentary evidence and causes of action. The court may admit the petition for further hearing.",
    "The filing is belated and lacking any credible ground; dismiss the petition for want of cause."
]
inputs = tokenizer(sample_texts, truncation=True, padding=True, max_length=MAX_LENGTH, return_tensors="pt").to(model.device)
with torch.no_grad():
    out = model(**inputs)
    sample_preds = torch.argmax(out.logits, dim=-1).cpu().numpy()
for t, p in zip(sample_texts, sample_preds):
    print("\nTEXT:", t)
    print("PREDICTED:", "ACCEPTED (1)" if int(p)==1 else "REJECTED (0)")

# ---------------------------
# 13) Save model & tokenizer locally (and optionally to Google Drive)
# ---------------------------
save_dir = "./legal_petition_model"
os.makedirs(save_dir, exist_ok=True)
model.save_pretrained(save_dir)
tokenizer.save_pretrained(save_dir)
print(f"\n✅ Model and tokenizer saved locally at: {save_dir}")

# Optional: save to Google Drive (uncomment if you want automatic backup)
"""
from google.colab import drive
drive.mount('/content/drive')
drive_save_dir = "/content/drive/MyDrive/legal_petition_model"
model.save_pretrained(drive_save_dir)
tokenizer.save_pretrained(drive_save_dir)
print(f"✅ Model and tokenizer also saved to Google Drive at: {drive_save_dir}")
"""

# ---------------------------
# 14) Example: Load model later for inference
# ---------------------------
# You can re-load it anytime like this:
"""
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch

model_path = "./legal_petition_model"
tokenizer = AutoTokenizer.from_pretrained(model_path)
model = AutoModelForSequenceClassification.from_pretrained(model_path)

text = "After reviewing the evidence, the court finds grounds to admit the petition."
inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=256).to(model.device)
with torch.no_grad():
    logits = model(**inputs).logits
    pred = torch.argmax(logits, dim=-1).item()
print("Prediction:", "ACCEPTED (1)" if pred == 1 else "REJECTED (0)")
"""

# ---------------------------
# 15) Summary of completion
# ---------------------------
print("\n====================================================")
print("🎯 TRAINING COMPLETE — LEGAL PETITION CLASSIFIER READY")
print("====================================================")
print(f"Model directory: {save_dir}")
print("Use the above model for downstream inference or API integration.")
