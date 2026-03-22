# backend/services/explainer.py

import torch
import numpy as np
import shap
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import os
import re

DEVICE = "cpu"
MODEL_PATH = os.path.join(
    os.path.dirname(__file__),
    "../../ml/models/inlegalbert-finetuned"
)

# Global — loaded once
_tokenizer = None
_model     = None
_explainer = None


def load_model():
    """Load model for SHAP analysis."""
    global _tokenizer, _model
    if _model is not None:
        return
    print("Loading InLegalBERT for SHAP...")
    _tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
    _model = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH)
    _model.to(DEVICE)
    _model.eval()
    print("SHAP model ready!")


def predict_proba(texts):
    """
    Takes a list of texts, returns probability array.
    This is what SHAP calls internally to understand
    how each word affects the prediction.
    Shape: (n_samples, n_classes) → [[reject_prob, admit_prob], ...]
    """
    load_model()

    # Handle numpy array input from SHAP
    if isinstance(texts, np.ndarray):
        texts = texts.tolist()

    all_probs = []

    for text in texts:
        if not isinstance(text, str) or len(text.strip()) == 0:
            all_probs.append([0.5, 0.5])
            continue

        inputs = _tokenizer(
            text,
            return_tensors="pt",
            truncation=True,
            max_length=256,
            padding=True
        ).to(DEVICE)

        with torch.no_grad():
            logits = _model(**inputs).logits
            probs  = torch.softmax(logits, dim=-1).squeeze()

        all_probs.append([
            float(probs[0]),  # REJECT probability
            float(probs[1])   # ADMIT probability
        ])

    return np.array(all_probs)


def get_shap_explanation(text: str, prediction: str) -> dict:
    """
    Run SHAP on the petition text.
    Returns top words that pushed toward ADMIT or REJECT.
    """
    load_model()

    # Clean and truncate text
    text = re.sub(r'\s+', ' ', text).strip()
    words = text.split()
    text  = ' '.join(words[:200])

    # Use SHAP's text explainer
    # masker tells SHAP how to mask words during analysis
    masker   = shap.maskers.Text(tokenizer=r"\W+")
    explainer = shap.Explainer(
        predict_proba,
        masker,
        output_names=["REJECTED", "ADMITTED"]
    )

    # Calculate SHAP values
    # This runs predict_proba many times with different
    # word combinations to understand each word's impact
    print("Calculating SHAP values...")
    shap_values = explainer([text])

    # ── Extract top words ────────────────────────────────────
    # Get the class index we care about
    class_idx = 1 if prediction == "ADMITTED" else 0

    # Get words and their SHAP scores
    words_list  = shap_values.data[0]
    shap_scores = shap_values.values[0][:, class_idx]

    # Pair words with scores
    word_scores = list(zip(words_list, shap_scores))

    # Sort by absolute impact
    word_scores.sort(key=lambda x: abs(x[1]), reverse=True)

    # Separate positive and negative influences
    # Common words to ignore — not meaningful for lawyers
STOP_WORDS = {
    'the', 'a', 'an', 'is', 'in', 'of', 'to', 'and', 'or',
    'this', 'that', 'it', 'its', 'for', 'on', 'at', 'by',
    'was', 'were', 'has', 'have', 'had', 'be', 'been',
    'filed', 'writ', 'petition', 'court', 'order', 'case',
    'respondent', 'petitioner', 'appellant', 'high', 'the'
}

pushing_toward_admit = [
    {"word": w.strip(), "score": round(float(s), 4)}
    for w, s in word_scores
    if s > 0.01
    and len(w.strip()) > 3
    and w.strip().lower() not in STOP_WORDS
][:5]

pushing_toward_reject = [
    {"word": w.strip(), "score": round(float(s), 4)}
    for w, s in word_scores
    if s < -0.01
    and len(w.strip()) > 3
    and w.strip().lower() not in STOP_WORDS
][:5]

    # ── Generate human readable summary ──────────────────────
    summary = build_summary(
        prediction,
        pushing_toward_admit,
        pushing_toward_reject
    )

    return {
        "prediction"            : prediction,
        "pushing_toward_admit"  : pushing_toward_admit,
        "pushing_toward_reject" : pushing_toward_reject,
        "summary"               : summary,
        "top_words"             : word_scores[:10]
    }


def build_summary(prediction: str,
                  admit_words: list,
                  reject_words: list) -> str:
    """
    Build a human-readable explanation from SHAP scores.
    This is what lawyers will read.
    """
    lines = []

    if prediction == "REJECTED":
        lines.append(
            "Your petition was flagged for rejection based on "
            "the following analysis:"
        )
        lines.append("")

        if reject_words:
            lines.append("❌ PHRASES HURTING YOUR PETITION:")
            for item in reject_words:
                lines.append(f"   • '{item['word']}' "
                             f"(impact: {abs(item['score']):.3f})")

        lines.append("")

        if admit_words:
            lines.append("✅ PHRASES SUPPORTING YOUR PETITION:")
            for item in admit_words:
                lines.append(f"   • '{item['word']}' "
                             f"(impact: {item['score']:.3f})")

        lines.append("")
        lines.append("💡 TO IMPROVE YOUR PETITION:")
        lines.append(
            "   Focus on strengthening the legal grounds "
            "and removing procedural weaknesses identified above."
        )

    else:  # ADMITTED
        lines.append(
            "Your petition shows strong grounds for admission "
            "based on the following analysis:"
        )
        lines.append("")

        if admit_words:
            lines.append("✅ STRONG PHRASES IN YOUR PETITION:")
            for item in admit_words:
                lines.append(f"   • '{item['word']}' "
                             f"(impact: {item['score']:.3f})")

        if reject_words:
            lines.append("")
            lines.append("⚠️  AREAS TO WATCH:")
            for item in reject_words:
                lines.append(f"   • '{item['word']}' "
                             f"(impact: {abs(item['score']):.3f})")

    return "\n".join(lines)


# ── Quick test ───────────────────────────────────────────────────
if __name__ == "__main__":
    sample = """
    The petitioner filed this writ petition challenging the order
    of the High Court. The petition is time barred and lacks
    locus standi. No substantial question of law arises.
    The petitioner has constitutional rights under Article 21
    which have been violated by the respondent authorities.
    """

    print("Running SHAP explanation...")
    result = get_shap_explanation(sample, "REJECTED")

    print("\n" + "="*50)
    print("SHAP SUMMARY:")
    print("="*50)
    print(result["summary"])
    print("\nTop words:")
    for word, score in result["top_words"][:5]:
        print(f"  {word:20} → {score:+.4f}")
    