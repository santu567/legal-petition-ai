#Building dataset class to load the data and preprocess it for training and evaluation

# src/data/dataset.py

import torch
from torch.utils.data import Dataset
import pandas as pd
from src.data.preprocessor import LegalTextPreprocessor


class LegalPetitionDataset(Dataset):
    def __init__(self, csv_path: str, preprocessor: LegalTextPreprocessor):
        """
        Load the CSV and store it in memory.
        csv_path    → path to train.csv / val.csv / test.csv
        preprocessor → our LegalTextPreprocessor instance
        """
        print(f"Loading dataset from {csv_path}...")
        self.data = pd.read_csv(csv_path)
        self.preprocessor = preprocessor
        print(f"Dataset loaded → {len(self.data)} cases")

    def __len__(self):
        """
        Returns total number of cases in the dataset.
        PyTorch calls this automatically to know dataset size.
        """
        return len(self.data)

    def __getitem__(self, idx):
        """
        Returns ONE case at a given index.
        PyTorch calls this automatically during training
        to fetch cases one by one or in batches.

        idx → the row number PyTorch wants (0, 1, 2, ...)
        """
        # Get the row at position idx
        row = self.data.iloc[idx]

        # Get the petition text
        text = str(row['text'])

        # Get the label (0=REJECT, 1=ADMIT)
        label = int(row['label'])

        # Tokenize the text using our preprocessor
        tokens = self.preprocessor.tokenize(text)

        return {
            # input_ids → token numbers InLegalBERT reads
            # .squeeze() removes extra dimension [1,512] → [512]
            'input_ids': tokens['input_ids'].squeeze(),

            # attention_mask → tells BERT which tokens are real
            # vs which are just padding
            'attention_mask': tokens['attention_mask'].squeeze(),

            # label → 0 or 1 for this case
            'labels': torch.tensor(label, dtype=torch.long)
        }


# ── Quick test ───────────────────────────────────────────────────
if __name__ == '__main__':
    from preprocessor import LegalTextPreprocessor

    # Initialize preprocessor
    preprocessor = LegalTextPreprocessor()

    # Load training dataset
    dataset = LegalPetitionDataset(
       csv_path='../../data/processed/train.csv',
        preprocessor=preprocessor
    )

    # Check total size
    print(f"\nTotal cases in dataset : {len(dataset)}")

    # Fetch the very first case
    first_case = dataset[0]

    print(f"\nFirst case breakdown:")
    print(f"input_ids shape     : {first_case['input_ids'].shape}")
    print(f"attention_mask shape: {first_case['attention_mask'].shape}")
    print(f"label               : {first_case['labels'].item()} "
          f"({'ADMIT' if first_case['labels'].item() == 1 else 'REJECT'})")

    # Fetch a random batch of 4 cases
    from torch.utils.data import DataLoader
    loader = DataLoader(dataset, batch_size=4, shuffle=True)
    batch  = next(iter(loader))

    print(f"\nBatch of 4 cases:")
    print(f"input_ids shape     : {batch['input_ids'].shape}")
    print(f"attention_mask shape: {batch['attention_mask'].shape}")
    print(f"labels              : {batch['labels']}")


