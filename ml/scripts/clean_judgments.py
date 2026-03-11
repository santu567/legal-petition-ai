# scripts/clean_judgments.py

import pandas as pd
import re
import os


def fix_ocr_errors(text: str) -> str:
    """Fix common OCR errors in Indian legal documents."""
    replacements = {
        'companypany'     : 'company',
        'companyrt'       : 'court',
        'companytract'    : 'contract',
        'numberice'       : 'notice',
        'numbermal'       : 'normal',
        'numbere'         : 'none',
        'companyld'       : 'could',
        'companynt'       : 'count',
        'companyntry'     : 'country',
        'companycern'     : 'concern',
        'companyclusion'  : 'conclusion',
        'companytrol'     : 'control',
        'companystitution': 'constitution',
        'companyduct'     : 'conduct',
        'companysidered'  : 'considered',
        'companymittee'   : 'committee',
        'numberified'     : 'notified',
        'numberification' : 'notification',
        'companynsel'     : 'counsel',
        'companysiderable': 'considerable',
        'companysequently': 'consequently',
        'companypetent'   : 'competent',
        'companyplaint'   : 'complaint',
        'companymission'  : 'commission',
        'companyrect'     : 'correct',
        'companyplied'    : 'complied',
        'companymon'      : 'common',
        'numberder'       : 'order',
    }
    for wrong, correct in replacements.items():
        text = text.replace(wrong, correct)
    return text


def remove_digital_signatures(text: str) -> str:
    """
    Remove digital signature metadata that appears in
    scanned Supreme Court documents — pure noise.
    """
    # Remove patterns like "Digitally signed by NAME Date 2019.03.11"
    text = re.sub(
        r'Digitally signed by.*?Reason',
        '', text, flags=re.IGNORECASE | re.DOTALL
    )
    # Remove "Signature Not Verified" watermarks
    text = re.sub(
        r'Signature Not Verified',
        '', text, flags=re.IGNORECASE
    )
    # Remove date-time stamps like "2019.03.11 173359 IST"
    text = re.sub(
        r'\d{4}\.\d{2}\.\d{2}\s+\d{6}\s+IST',
        '', text, flags=re.IGNORECASE
    )
    return text


def remove_outcome_phrases(text: str) -> str:
    """Remove phrases that directly reveal the court outcome."""
    patterns = [
        r'leave\s+granted',
        r'leave\s+refused',
        r'appeal\s+allowed',
        r'appeal\s+dismissed',
        r'petition\s+allowed',
        r'petition\s+dismissed',
        r'we\s+allow\s+the\s+appeal',
        r'we\s+dismiss\s+the\s+appeal',
        r'appeal\s+is\s+allowed',
        r'appeal\s+is\s+dismissed',
        r'hereby\s+allowed',
        r'hereby\s+dismissed',
        r'order\s+is\s+set\s+aside',
        r'we\s+set\s+aside',
        r'find\s+no\s+merit',
        r'no\s+merit\s+in\s+this',
        r'dismissed\s+with\s+costs',
        r'allowed\s+with\s+costs',
        r'rule\s+made\s+absolute',
        r'writ\s+is\s+issued',
    ]
    for pattern in patterns:
        text = re.sub(pattern, '', text, flags=re.IGNORECASE)

    # Clean up extra spaces left behind
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def remove_header(text: str) -> str:
    """
    Remove the case header — judge names, case numbers,
    lawyer names, dates. These appear before the actual
    facts and add noise without legal meaning.
    Skip first 30 words (header) and take next 250 words (facts).
    """
    words = text.split()
    fact_words = words[30:280]
    return ' '.join(fact_words)


def clean_text(text: str) -> str:
    """Full cleaning pipeline for one case."""
    if not isinstance(text, str):
        return ""

    # Step 1 — fix OCR errors
    text = fix_ocr_errors(text)

    # Step 1.5 — remove digital signature noise
    text = remove_digital_signatures(text)

    # Step 2 — remove outcome phrases
    text = remove_outcome_phrases(text)

    # Step 3 — skip header, take facts section
    text = remove_header(text)

    # Step 4 — final cleanup
    text = re.sub(r'\s+', ' ', text).strip()

    return text


def clean_dataset(input_path, output_path):
    print(f"\nCleaning {input_path}...")
    df = pd.read_csv(input_path)
    original_len = len(df)

    # Apply full cleaning pipeline
    df['text'] = df['text'].apply(clean_text)

    # Remove rows where text is too short after cleaning
    df = df[df['text'].str.len() > 50]
    cleaned_len = len(df)

    print(f"Rows before : {original_len}")
    print(f"Rows after  : {cleaned_len}")
    print(f"Removed     : {original_len - cleaned_len}")
    print(f"Label dist  :")
    print(df['label'].value_counts())

    df.to_csv(output_path, index=False)
    print(f"Saved to    : {output_path}")


# ── Run cleaning on all datasets ─────────────────────────────────
os.makedirs('data/cleaned', exist_ok=True)

clean_dataset('data/processed/train.csv', 'data/cleaned/train.csv')
clean_dataset('data/processed/val.csv',   'data/cleaned/val.csv')
clean_dataset('data/processed/test.csv',  'data/cleaned/test.csv')

# ── Verify result ─────────────────────────────────────────────────
print("\n" + "="*50)
print("VERIFICATION — First 3 cleaned training cases:")
print("="*50)

df = pd.read_csv('data/cleaned/train.csv')
for i in range(3):
    print(f"\nCase {i+1} (Label: {df['label'].iloc[i]}):")
    print(df['text'].iloc[i][:300])
    print("-"*50)

print("\nDone! All cleaned files saved to data/cleaned/")