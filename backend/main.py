import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, HTTPException, UploadFile, File, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import datetime

from services.classifier import predict, load_model as load_classifier
from services.auth import (
    create_user, authenticate_user, create_token,
    decode_token, get_user_by_email, check_usage_limit,
    hash_password
)
from database.models import create_tables, get_db, User, Analysis

# ── App Setup ─────────────────────────────────────────────────────
app = FastAPI(title="LegalAI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Request Models ────────────────────────────────────────────────
class RegisterRequest(BaseModel):
    name    : str
    email   : str
    password: str

class LoginRequest(BaseModel):
    email   : str
    password: str

class PetitionRequest(BaseModel):
    text                : str
    generate_explanation: bool = True


# ── Confidence Band ───────────────────────────────────────────────
def get_band(prediction: str, confidence: float) -> dict:
    if prediction == "REJECTED":
        if confidence >= 75:
            return {
                "band"       : "HIGH RISK",
                "band_message": "This petition has very strong grounds for rejection. Significant changes needed before filing.",
                "urgency"    : "critical"
            }
        elif confidence >= 60:
            return {
                "band"       : "MEDIUM RISK",
                "band_message": "This petition may be rejected. Consider strengthening key legal arguments before filing.",
                "urgency"    : "warning"
            }
        else:
            return {
                "band"       : "BORDERLINE",
                "band_message": "This petition could go either way. Minor improvements recommended.",
                "urgency"    : "caution"
            }
    else:
        if confidence >= 75:
            return {
                "band"       : "HIGH CHANCE",
                "band_message": "This petition has very strong grounds for admission.",
                "urgency"    : "good"
            }
        else:
            return {
                "band"       : "LOOKS GOOD",
                "band_message": "This petition shows reasonable grounds for admission.",
                "urgency"    : "good"
            }


# ── Auth Helper ───────────────────────────────────────────────────
def get_current_user(
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """Extract user from JWT token — optional auth."""
    if not authorization:
        return None
    try:
        token   = authorization.replace("Bearer ", "")
        payload = decode_token(token)
        if not payload:
            return None
        email = payload.get("sub")
        return get_user_by_email(db, email)
    except Exception:
        return None


# ── Startup ───────────────────────────────────────────────────────
@app.on_event("startup")
async def startup():
    create_tables()
    print("\n--- LOADING AI MODELS ---")
    load_classifier()
    print("--- MODELS READY ---\n")


# ── Auth Routes ───────────────────────────────────────────────────
@app.get("/health")
async def health():
    return {"status": "ok", "message": "LegalAI API is running"}


@app.post("/api/auth/register")
async def register(req: RegisterRequest, db: Session = Depends(get_db)):
    try:
        if len(req.password) < 6:
            raise HTTPException(400, "Password must be at least 6 characters.")

        existing = get_user_by_email(db, req.email)
        if existing:
            raise HTTPException(400, "Email already registered.")

        user  = create_user(db, req.name, req.email, req.password)
        token = create_token({"sub": user.email})

        return {
            "token": token,
            "user" : {
                "id"   : user.id,
                "name" : user.name,
                "email": user.email,
                "plan" : user.plan
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print("REGISTER ERROR:", traceback.format_exc())
        raise HTTPException(500, f"Registration failed: {str(e)}")


@app.post("/api/auth/login")
async def login(req: LoginRequest, db: Session = Depends(get_db)):
    try:
        user = authenticate_user(db, req.email, req.password)
        if not user:
            raise HTTPException(401, "Invalid email or password.")

        token = create_token({"sub": user.email})
        usage = check_usage_limit(user)

        return {
            "token": token,
            "user" : {
                "id"       : user.id,
                "name"     : user.name,
                "email"    : user.email,
                "plan"     : user.plan,
                "used"     : usage["used"],
                "limit"    : usage["limit"],
                "remaining": usage["remaining"]
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print("LOGIN ERROR:", traceback.format_exc())
        raise HTTPException(500, f"Login failed: {str(e)}")


@app.get("/api/auth/me")
async def get_me(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user:
        raise HTTPException(401, "Not authenticated.")
    usage = check_usage_limit(current_user)
    return {
        "id"       : current_user.id,
        "name"     : current_user.name,
        "email"    : current_user.email,
        "plan"     : current_user.plan,
        "used"     : usage["used"],
        "limit"    : usage["limit"],
        "remaining": usage["remaining"]
    }


@app.get("/api/history")
async def get_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user:
        raise HTTPException(401, "Please login to view history.")

    analyses = db.query(Analysis)\
        .filter(Analysis.user_id == current_user.id)\
        .order_by(Analysis.created_at.desc())\
        .limit(20)\
        .all()

    return [
        {
            "id"        : a.id,
            "prediction": a.prediction,
            "confidence": a.confidence,
            "band"      : a.band,
            "excerpt"   : a.petition_text[:150] + "...",
            "date"      : a.created_at.strftime("%d %b %Y, %I:%M %p")
        }
        for a in analyses
    ]


# ── PDF Extraction ────────────────────────────────────────────────
@app.post("/api/extract-pdf")
async def extract_pdf(file: UploadFile = File(...)):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(400, "Only PDF files are supported.")

    try:
        import fitz
        import re

        contents    = await file.read()
        pdf         = fitz.open(stream=contents, filetype="pdf")
        full_text   = ""

        for page_num in range(min(len(pdf), 10)):
            full_text += pdf[page_num].get_text() + "\n"

        total_pages = len(pdf)
        pdf.close()

        full_text = re.sub(r'\s+', ' ', full_text).strip()

        if len(full_text) < 50:
            raise HTTPException(
                400,
                "Could not extract enough text. Please paste manually."
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


# ── Main Analysis ─────────────────────────────────────────────────
@app.post("/api/analyze")
async def analyze(
    request: PetitionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    text = request.text.strip()
    if not text or len(text) < 50:
        raise HTTPException(400, "Petition text too short.")

    # Check usage limit if logged in
    if current_user:
        usage = check_usage_limit(current_user)
        if not usage["allowed"]:
            raise HTTPException(
                429,
                f"Monthly limit reached ({usage['limit']} analyses). "
                f"Please upgrade your plan."
            )

    try:
        # Step 1 — Classify
        result = predict(text)

        # Step 2 — Confidence band
        band = get_band(result["prediction"], result["confidence"])

        # Step 3 — Explanation
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

        # Step 5 — Save to history if logged in
        if current_user:
            analysis = Analysis(
                user_id      = current_user.id,
                petition_text= text[:500],
                prediction   = result["prediction"],
                confidence   = result["confidence"],
                admit_prob   = result["admit_prob"],
                reject_prob  = result["reject_prob"],
                band         = band["band"],
                explanation  = explanation[:1000] if explanation else ""
            )
            db.add(analysis)
            current_user.analyses_used += 1
            db.commit()

        return {
            "prediction"   : result["prediction"],
            "confidence"   : result["confidence"],
            "admit_prob"   : result["admit_prob"],
            "reject_prob"  : result["reject_prob"],
            "band"         : band["band"],
            "band_message" : band["band_message"],
            "urgency"      : band["urgency"],
            "explanation"  : explanation,
            "similar_cases": similar
        }

    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(500, f"Analysis failed: {str(e)}")