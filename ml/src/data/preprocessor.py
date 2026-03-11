# src/data/preprocessor.py

import re
from transformers import AutoTokenizer


class LegalTextPreprocessor:
    def __init__(self, model_name='law-ai/InLegalBERT', max_length=256):
        """
        Load InLegalBERT tokenizer.
        max_length=256 captures facts before court conclusion.
        """
        print(f"Loading tokenizer from {model_name}...")
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.max_length = max_length
        print("Tokenizer loaded successfully!")

    def clean(self, text: str) -> str:
        """
        Clean raw legal text before tokenizing.
        Removes noise while preserving legal meaning.
        """
        if not isinstance(text, str):
            return ""

        # Remove extra whitespace and newlines
        text = re.sub(r'\s+', ' ', text).strip()

        # Remove special characters but keep legal punctuation
        text = re.sub(r'[^\w\s\.\,\;\:\(\)\-\/]', ' ', text)

        # Fix common OCR errors in scanned legal documents
        text = text.replace('|', 'I')
        text = text.replace('companypany', 'company')
        text = text.replace('companyrt', 'court')
        text = text.replace('numbere', 'none')
        text = text.replace('numberice', 'notice')
        text = text.replace('companytract', 'contract')
        text = text.replace('numbermal', 'normal')

        # Remove outcome phrases that cause data leakage
        outcome_phrases = [
            r'leave granted',
            r'leave refused',
            r'appeal allowed',
            r'appeal dismissed',
            r'petition allowed',
            r'petition dismissed',
            r'we allow the appeal',
            r'we dismiss the appeal',
            r'appeal is allowed',
            r'appeal is dismissed',
            r'hereby allowed',
            r'hereby dismissed',
            r'order is set aside',
            r'we set aside',
            r'find no merit',
        ]
        for phrase in outcome_phrases:
            text = re.sub(phrase, '', text, flags=re.IGNORECASE)

        # Clean up extra whitespace again
        text = re.sub(r'\s+', ' ', text).strip()

        return text

    def truncate_to_facts(self, text: str, max_words: int = 200) -> str:
        """
        Keep only the first 200 words of the petition.
        This captures facts and background BEFORE
        the court reveals its decision.
        """
        words = text.split()
        return ' '.join(words[:max_words])

    def tokenize(self, text: str) -> dict:
        """
        Convert text into token IDs for InLegalBERT.
        Cleans and truncates first to avoid leakage.
        """
        # Step 1 — clean the text
        cleaned = self.clean(text)

        # Step 2 — truncate to first 200 words (facts only)
        truncated = self.truncate_to_facts(cleaned)

        # Step 3 — tokenize
        return self.tokenizer(
            truncated,
            max_length=self.max_length,
            truncation=True,
            padding='max_length',
            return_tensors='pt'
        )

    def tokenize_batch(self, texts: list) -> dict:
        """
        Tokenize multiple texts at once.
        Used during training for processing batches.
        """
        cleaned = [self.truncate_to_facts(
                   self.clean(t)) for t in texts]

        return self.tokenizer(
            cleaned,
            max_length=self.max_length,
            truncation=True,
            padding='max_length',
            return_tensors='pt'
        )


# ── Quick test ───────────────────────────────────────────────────
if __name__ == '__main__':
    preprocessor = LegalTextPreprocessor()

    sample = """Leave granted. F. NARIMAN, J. In 2008, the Punjab
    State Water Supply Sewerage Board issued numberice inviting
    tender for extension of water supply scheme. The companyrt held
    that locus standi was not established. Appeal dismissed."""

    print("\n--- ORIGINAL ---")
    print(sample)

    print("\n--- CLEANED ---")
    cleaned = preprocessor.clean(sample)
    print(cleaned)

    print("\n--- TRUNCATED ---")
    truncated = preprocessor.truncate_to_facts(cleaned)
    print(truncated)

    print("\n--- TOKENIZED ---")
    tokens = preprocessor.tokenize(sample)
    print(f"input_ids shape    : {tokens['input_ids'].shape}")
    print(f"attention_mask     : {tokens['attention_mask'].shape}")