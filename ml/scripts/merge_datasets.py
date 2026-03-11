import pandas as pd
import os

os.makedirs('data/processed', exist_ok=True)

def load_and_clean(filepath):
    """Load a CSV and keep only id, text, label columns."""
    df = pd.read_csv(filepath)
    df = df[['id', 'text', 'label']]
    df = df.dropna(subset=['text', 'label'])
    df['label'] = df['label'].astype(int)
    print(f"✅ Loaded {filepath} → {len(df)} rows")
    return df

# ── TRAINING DATA (merge single + multi train) ──────────────────
print("\n📂 Building TRAIN set...")
train_single = load_and_clean('data/raw/cjpe_single_train.csv')
train_multi  = load_and_clean('data/raw/cjpe_multi_train.csv')

train = pd.concat([train_single, train_multi], ignore_index=True)
train = train.drop_duplicates(subset=['id'])
train.to_csv('data/processed/train.csv', index=False)
print(f"✅ Train set saved → {len(train)} total cases")

# ── VALIDATION DATA (merge single + multi dev) ───────────────────
print("\n📂 Building VALIDATION set...")
val_single = load_and_clean('data/raw/cjpe_single_dev.csv')
val_multi  = load_and_clean('data/raw/cjpe_multi_dev.csv')

val = pd.concat([val_single, val_multi], ignore_index=True)
val = val.drop_duplicates(subset=['id'])
val.to_csv('data/processed/val.csv', index=False)
print(f"✅ Validation set saved → {len(val)} total cases")

# ── TEST DATA (keep separate — do not touch until training done) ──
print("\n📂 Building TEST set...")
test = load_and_clean('data/raw/cjpe_test.csv')
test.to_csv('data/processed/test.csv', index=False)
print(f"✅ Test set saved → {len(test)} total cases")

# ── EXPERT DATA (for explainability evaluation only) ─────────────
print("\n📂 Building EXPERT EVAL set...")
expert = load_and_clean('data/raw/cjpe_expert.csv')
expert.to_csv('data/processed/expert_eval.csv', index=False)
print(f"✅ Expert eval set saved → {len(expert)} total cases")

# ── FINAL SUMMARY ─────────────────────────────────────────────────
print("\n" + "="*45)
print("📊 FINAL DATASET SUMMARY")
print("="*45)
for name, df in [("Train", train), ("Validation", val),
                 ("Test", test), ("Expert Eval", expert)]:
    admit  = len(df[df['label'] == 1])
    reject = len(df[df['label'] == 0])
    print(f"{name:15} → {len(df):5} cases "
          f"| ADMIT: {admit} | REJECT: {reject}")
print("="*45)
print("\n✅ All files saved to data/processed/")
print("⚠️  Do NOT use test.csv until training is complete!")