# backend/main.py

import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from services.classifier import predict, load_model as load_classifier

# ── App Setup ─────────────────────────────────────────────────────
app = FastAPI(title="LegalAI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Request Model ─────────────────────────────────────────────────
class PetitionRequest(BaseModel):
    text: str
    generate_explanation: bool = True


# ── Confidence Band Logic ─────────────────────────────────────────
def get_band(prediction: str, confidence: float) -> dict:
    if prediction == "REJECTED":
        if confidence >= 75:
            return {
                "band"       : "HIGH RISK",
                "band_emoji" : "🔴",
                "band_message": "This petition has very strong grounds for rejection. Significant changes needed before filing.",
                "urgency"    : "critical"
            }
        elif confidence >= 60:
            return {
                "band"       : "MEDIUM RISK",
                "band_emoji" : "🟡",
                "band_message": "This petition may be rejected. Consider strengthening key legal arguments before filing.",
                "urgency"    : "warning"
            }
        else:
            return {
                "band"       : "BORDERLINE",
                "band_emoji" : "🟠",
                "band_message": "This petition could go either way. Minor improvements recommended before filing.",
                "urgency"    : "caution"
            }
    else:
        if confidence >= 75:
            return {
                "band"       : "HIGH CHANCE",
                "band_emoji" : "🟢",
                "band_message": "This petition has very strong grounds for admission. Well-structured legal arguments.",
                "urgency"    : "good"
            }
        else:
            return {
                "band"       : "LOOKS GOOD",
                "band_emoji" : "🟢",
                "band_message": "This petition shows reasonable grounds for admission. A few improvements could strengthen it further.",
                "urgency"    : "good"
            }


# ── Startup ───────────────────────────────────────────────────────
@app.on_event("startup")
async def startup():
    print("\n--- LOADING AI MODELS ---")
    load_classifier()
    print("--- MODELS READY ---\n")


# ── Routes ────────────────────────────────────────────────────────
@app.get("/health")
async def health():
    return {"status": "ok", "message": "LegalAI API is running"}


@app.post("/api/extract-pdf")
async def extract_pdf(file: UploadFile = File(...)):
    """Extract text from uploaded PDF file."""
    if not file.filename.endswith('.pdf'):
        raise HTTPException(400, "Only PDF files are supported.")

    try:
        import fitz
        import re

        contents = await file.read()
        pdf      = fitz.open(stream=contents, filetype="pdf")

        full_text = ""
        for page_num in range(min(len(pdf), 10)):
            page       = pdf[page_num]
            full_text += page.get_text() + "\n"

        total_pages = len(pdf)
        pdf.close()

        full_text = re.sub(r'\s+', ' ', full_text).strip()

        if len(full_text) < 50:
            raise HTTPException(
                400,
                "Could not extract enough text from PDF. "
                "Please paste the text manually."
            )

        return {
            "text"      : full_text,
            "characters": len(full_text),
            "pages"     : min(total_pages, 10)
        }

    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(500, f"PDF extraction failed: {str(e)}")


@app.post("/api/analyze")
async def analyze(request: PetitionRequest):
    """Main analysis endpoint."""
    text = request.text.strip()

    if not text or len(text) < 50:
        raise HTTPException(400, "Petition text too short.")

    try:
        # Step 1 — Classify
        result = predict(text)

        # Step 2 — Get confidence band
        band = get_band(result["prediction"], result["confidence"])

        # Step 3 — Generate explanation
        explanation = ""
        if request.generate_explanation:
            from services.generator import generate_explanation
            gen         = generate_explanation(text, result["prediction"])
            explanation = gen["explanation"]

        # Step 4 — Similar cases
        similar = []
        try:
            from services.retriever import find_similar_cases
            similar = find_similar_cases(text, top_k=3)
        except Exception:
            pass

        return {
            "prediction"   : result["prediction"],
            "confidence"   : result["confidence"],
            "admit_prob"   : result["admit_prob"],
            "reject_prob"  : result["reject_prob"],
            "band"         : band["band"],
            "band_emoji"   : band["band_emoji"],
            "band_message" : band["band_message"],
            "urgency"      : band["urgency"],
            "explanation"  : explanation,
            "similar_cases": similar
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(500, f"Analysis failed: {str(e)}")