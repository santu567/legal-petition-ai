from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import os
import torch

from model_4_generative import (
    load_classification_model,
    load_generative_model,
    predict_admission,
    generate_explanation_and_suggestions,
    CLASSIFICATION_MODEL_DIR,
    GENERATIVE_MODEL_NAME
)

# 1. Initialize FastAPI
app = FastAPI(title="Legal AI Petition Analyzer")

# 2. Global Model Variables
clf_tokenizer = None
clf_model = None
gen_tokenizer = None
gen_model = None

# 3. Request Model
class PetitionRequest(BaseModel):
    text: str

# 4. Mount the Static Frontend (HTML, CSS, JS)
# We will create this 'static' directory next
os.makedirs("static", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")


@app.on_event("startup")
async def load_models():
    """Loads massive PyTorch models into RAM/VRAM ONLY ONCE on server startup."""
    global clf_tokenizer, clf_model, gen_tokenizer, gen_model
    print("\n--- INITIALIZING AI MODELS ---")
    
    if not os.path.exists(CLASSIFICATION_MODEL_DIR):
        raise RuntimeError(f"Classification model not found at {CLASSIFICATION_MODEL_DIR}.")
        
    clf_tokenizer, clf_model = load_classification_model(CLASSIFICATION_MODEL_DIR)
    
    # Packaged as a tuple as expected by generate function
    gen_tokenizer, gen_model_instance = load_generative_model(GENERATIVE_MODEL_NAME)
    gen_model = (gen_tokenizer, gen_model_instance)
    
    print("--- MODELS LOADED SUCCESSFULLY ---\n")


@app.post("/api/analyze")
async def analyze_petition_endpoint(request: PetitionRequest):
    """The main API endpoint that the frontend calls."""
    text = request.text.strip()
    
    if not text:
        raise HTTPException(status_code=400, detail="Petition text cannot be empty.")
    
    if not clf_model or not gen_model:
        raise HTTPException(status_code=503, detail="Models are still loading. Please try again in a moment.")
        
    try:
        # Step 1: Classification
        label, confidence = predict_admission(text, clf_tokenizer, clf_model)
        
        # Step 2: Generation
        suggestion_text = generate_explanation_and_suggestions(text, label, gen_model)
        
        # Step 3: Return JSON
        return {
            "prediction": label,
            "confidence": f"{confidence * 100:.2f}%",
            "output": suggestion_text
        }
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

# This ensures that going to http://127.0.0.1:8000/ immediately loads your frontend
from fastapi.responses import RedirectResponse
@app.get("/")
async def redirect_to_index():
    return RedirectResponse(url="/static/index.html")
