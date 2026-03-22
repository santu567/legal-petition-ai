# backend/main.py

import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from services.classifier import predict, load_model as load_classifier

app = FastAPI(title="LegalAI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class PetitionRequest(BaseModel):
    text: str
    generate_explanation: bool = True

@app.on_event("startup")
async def startup():
    print("\n--- LOADING AI MODELS ---")
    load_classifier()
    print("--- MODELS READY ---\n")

@app.get("/health")
async def health():
    return {"status": "ok", "message": "LegalAI API is running"}

@app.post("/api/analyze")
async def analyze(request: PetitionRequest):
    text = request.text.strip()
    if not text or len(text) < 50:
        raise HTTPException(400, "Petition text too short.")
    try:
        result = predict(text)
        explanation = ""
        if request.generate_explanation:
            from services.generator import generate_explanation
            gen = generate_explanation(text, result["prediction"])
            explanation = gen["explanation"]
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
            "explanation"  : explanation,
            "similar_cases": similar
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(500, f"Analysis failed: {str(e)}")