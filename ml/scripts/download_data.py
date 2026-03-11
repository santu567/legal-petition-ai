from datasets import load_dataset
import pandas as pd
import os

print("Downloading ILDC dataset from HuggingFace...")

# Create directories if they don't exist
os.makedirs('data/raw', exist_ok=True)

# Download the dataset
dataset = load_dataset('law-ai/ILDC', 'ILDC_single')

# Save to CSV files
dataset['train'].to_csv('data/raw/train.csv', index=False)
dataset['validation'].to_csv('data/raw/val.csv', index=False)
dataset['test'].to_csv('data/raw/test.csv', index=False)

print(f"Training samples:   {len(dataset['train'])}")
print(f"Validation samples: {len(dataset['validation'])}")
print(f"Test samples:       {len(dataset['test'])}")
print("Dataset saved to data/raw/ successfully!")