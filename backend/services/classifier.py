# backend/services/classifier.py

import os

# Physically block Windows from confusing the terminals by forcing it exactly to the RTX 3050 BEFORE PyTorch wakes up.
os.environ["CUDA_VISIBLE_DEVICES"] = "0"

import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import re

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
MODEL_PATH = "chnitu/legal-petition-v2"

# Global — loaded once
_tokenizer = None
_model     = None


def load_model():
    """Load InLegalBERT model into memory once."""
    global _tokenizer, _model
    if _model is not None:
        return
    print(f"Loading InLegalBERT from {MODEL_PATH}...")
    _tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
    _model = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH)
    _model.to(DEVICE)
    if DEVICE == "cuda":
        _model.half() # 2x faster, 50% less VRAM
    _model.eval()
    print(f"InLegalBERT Optimized on {DEVICE.upper()}")


def clean_text(text: str) -> str:
    """Clean petition text by removing lawyer boilerplate formatting."""
    if not isinstance(text, str):
        return ""
        
    # Remove common petition structural headers
    boilerplate = [
        "IN THE SUPREME COURT OF INDIA", "IN THE HIGH COURT", 
        "IN THE MATTER OF:", "BETWEEN:", "VERSUS", 
        "MOST RESPECTFULLY SHOWETH:", "PRAYER", "PETITIONER", "RESPONDENT"
    ]
    
    for b in boilerplate:
        text = re.sub(b, "", text, flags=re.IGNORECASE)
        
    text = re.sub(r'\s+', ' ', text).strip()
    words = text.split()
    
    # After stripping headers, the front of the text is still 
    # usually names and addresses (e.g. "Mr. Aman Sharma, S/o...").
    # The true legal facts are deeply embedded.
    if len(words) > 400:
        # Instead of taking the very beginning, we skip the first 50 words
        # to jump straight into the legal grounds, taking up to 400 words
        words = words[50:450]
        
    return ' '.join(words)


def predict(text: str) -> dict:
    load_model()
    cleaned = clean_text(text)
    
    inputs = _tokenizer(
        cleaned,
        return_tensors="pt",
        truncation=True,
        max_length=512,
        padding=True
    ).to(DEVICE)

    with torch.no_grad():
        logits = _model(**inputs).logits
        probs  = torch.softmax(logits, dim=-1).squeeze()

    admit_prob  = float(probs[1])
    reject_prob = float(probs[0])

    # ── HYBRID EXPERT SYSTEM LAYER ──
    # To counter the ILDC Judgment format bias, we mathematically boost
    # petitions that contain extremely strong, undeniable legal merits.
    text_lower = text.lower()
    strong_keywords = [
        "article 32", "article 21", "article 14", "fundamental right",
        "habeas corpus", "public interest litigation", 
        "substantial question of law", "manifestly arbitrary"
    ]
    
    merit_count = sum(1 for kw in strong_keywords if kw in text_lower)
    if merit_count >= 2:
        # Massive mathematical boost for flawless petitions!
        admit_prob = min(admit_prob * 10.0 + 0.60, 0.98)
        reject_prob = 1.0 - admit_prob

    
    # Lower admission threshold to 0.35 to balance false negatives and positives
    # This compensates for severe class imbalance in the training data
    ADMIT_THRESHOLD = 0.35
    prediction = "ADMITTED" if admit_prob > ADMIT_THRESHOLD else "REJECTED"
    
    # Calibrate confidence based on the threshold adjustment
    if prediction == "ADMITTED":
        confidence = round(admit_prob * 100, 2)
    else:
        confidence = round(reject_prob * 100, 2)

    # Get confidence band
    band = get_confidence_band(prediction, confidence)

    return {
        "prediction"  : prediction,
        "confidence"  : confidence,
        "admit_prob"  : round(admit_prob * 100, 2),
        "reject_prob" : round(reject_prob * 100, 2),
        "band"        : band["band"],
        "band_color"  : band["color"],
        "band_emoji"  : band["emoji"],
        "band_message": band["message"],
        "urgency"     : band["urgency"],
    }

def get_confidence_band(prediction: str, confidence: float) -> dict:
    """
    Convert raw confidence % into meaningful bands for lawyers.
    Much more useful than raw numbers.
    """
    if prediction == "REJECTED":
        if confidence >= 75:
            return {
                "band"   : "HIGH RISK",
                "color"  : "red",
                "emoji"  : "🔴",
                "message": "This petition has very strong grounds for rejection. Significant changes needed before filing.",
                "urgency": "critical"
            }
        elif confidence >= 60:
            return {
                "band"   : "MEDIUM RISK",
                "color"  : "orange",
                "emoji"  : "🟡",
                "message": "This petition may be rejected. Consider strengthening key legal arguments before filing.",
                "urgency": "warning"
            }
        else:
            return {
                "band"   : "BORDERLINE",
                "color"  : "yellow",
                "emoji"  : "🟠",
                "message": "This petition could go either way. Minor improvements recommended before filing.",
                "urgency": "caution"
            }
    else:  # ADMITTED
        if confidence >= 75:
            return {
                "band"   : "HIGH CHANCE",
                "color"  : "green",
                "emoji"  : "🟢",
                "message": "This petition has very strong grounds for admission. Well-structured legal arguments.",
                "urgency": "good"
            }
        else:
            return {
                "band"   : "LOOKS GOOD",
                "color"  : "teal",
                "emoji"  : "🟢",
                "message": "This petition shows reasonable grounds for admission. A few improvements could strengthen it further.",
                "urgency": "good"
            }


# ── Quick test ───────────────────────────────────────────────────
if __name__ == "__main__":
    sample = """
    The petitioner challenges the constitutional validity
    of Section 66A of the Information Technology Act 2000
    as being violative of Article 19(1)(a) of the
    Constitution of India. Fundamental rights violated.
    """
    result = predict(sample)
    print(f"Prediction : {result['prediction']}")
    print(f"Confidence : {result['confidence']}%")
    print(f"Admit prob : {result['admit_prob']}%")
    print(f"Reject prob: {result['reject_prob']}%")