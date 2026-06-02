---
title: Legal API
emoji: ⚖️
colorFrom: blue
colorTo: indigo
sdk: docker
pinned: false
---

# ⚖️ LegalAI — Court Petition Admission Predictor

> AI-powered platform that predicts whether an Indian Supreme Court or High Court 
> petition will be **admitted or rejected** — with explainable reasoning and 
> actionable improvement suggestions.

---

## 🎯 What It Does

Lawyers and legal firms submit petition text → Our AI predicts the outcome in seconds.

| Feature | Description |
|---|---|
| 🔮 **Admission Prediction** | Predicts ADMIT or REJECT with confidence score |
| 🧠 **AI Explanation** | Tells you *why* the petition was rejected |
| 📋 **Improvement Suggestions** | Gives 3 specific actions to strengthen a rejected petition |
| 📚 **Similar Case Retrieval** | Finds real Supreme Court precedents matching your petition |
| 👩‍⚖️ **Built for Lawyers** | Clean dashboard designed for legal professionals |

---

## 🏗️ Tech Stack
```
ML & NLP          → InLegalBERT (fine-tuned on 32,000+ Supreme Court cases)
Explainability    → SHAP (highlights rejection phrases in petition text)
Case Retrieval    → FAISS vector similarity search
Generative AI     → Qwen 2.5 1.5B (generates legal reasoning & suggestions)
Backend           → FastAPI (Python)
Frontend          → React 18 + Tailwind CSS
Database          → PostgreSQL
Deployment        → Docker + Docker Compose
```

---

## 📊 Dataset

- **Source:** ILDC (Indian Legal Documents Corpus) — real Supreme Court judgments
- **Size:** 32,302 cases across train / validation / test splits
- **Labels:** ADMIT (1) / REJECT (0)
- **Preprocessing:** OCR error correction, digital signature removal,
  outcome phrase removal to prevent data leakage

---

## 🧠 Model Architecture
```
Input Petition Text
        ↓
   Text Cleaning
   (OCR fix + leakage removal)
        ↓
  InLegalBERT Encoder
  (109M parameters, fine-tuned on Indian legal text)
        ↓
  Classification Head
        ↓
  ADMIT / REJECT + Confidence %
        ↓
  Qwen 1.5B Generative Model
        ↓
  Legal Reasoning + 3 Improvement Steps
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- CUDA-compatible GPU (recommended)
- Node.js 18+
- PostgreSQL 15

### Installation
```bash
# Clone the repository
git clone https://github.com/EktaC06/legal-petition-ai.git
cd legal-petition-ai

# Install ML dependencies
conda create -n legal-ai python=3.10
conda activate legal-ai
pip install -r requirements.txt

# Start the backend
cd backend
uvicorn main:app --reload

# Start the frontend
cd frontend
npm install
npm start
```

### Run with Docker
```bash
docker-compose up --build
```

---

## 📁 Project Structure
```
legal-petition-ai/
├── ml/                          # ML Pipeline
│   ├── data/                    # Raw, processed & cleaned datasets
│   ├── src/
│   │   ├── data/                # Preprocessor & Dataset classes
│   │   └── training/            # Trainer, config, WeightedTrainer
│   ├── scripts/                 # Data merging & cleaning scripts
│   └── models/                  # Fine-tuned InLegalBERT weights
├── backend/                     # FastAPI Backend
│   ├── services/
│   │   ├── classifier.py        # InLegalBERT inference
│   │   ├── generator.py         # Qwen explanation generation
│   │   ├── explainer.py         # SHAP explainability
│   │   └── retriever.py         # FAISS case retrieval
│   └── main.py                  # API routes
├── frontend/                    # React Frontend
│   └── src/
│       ├── pages/               # Landing, Dashboard, Results
│       └── components/          # Reusable UI components
└── docker-compose.yml
```

---

## 💡 Key Technical Highlights

- **Data Leakage Prevention** — Removed outcome phrases ("leave granted",
  "appeal dismissed") from training data to ensure the model learns
  legal arguments, not judgment conclusions
- **Class Imbalance Handling** — Custom `WeightedTrainer` with class weights
  (ADMIT: 1.41x, REJECT: 1.0x) to handle 41/59 class split
- **GPU Optimized** — FP16 mixed precision + gradient checkpointing
  for training on consumer GPUs (RTX 3050 4GB)
- **OCR Noise Removal** — Custom regex pipeline to fix 20+ common
  OCR errors in scanned Indian court documents

---

## 👥 Target Users

| User | Use Case |
|---|---|
| 🧑‍⚖️ **Individual Lawyers** | Quick petition viability check before filing |
| 🏢 **Law Firms** | Bulk petition screening for large caseloads |
| 📚 **Law Students** | Learn what makes a strong petition |
| 🏛️ **Legal Aid NGOs** | Screen petitions for under-resourced clients |

---

## 💰 Subscription Model

| Plan | Price | Features |
|---|---|---|
| **Free** | ₹0 | 3 analyses/month |
| **Professional** | ₹2,999/month | 50 analyses + full explanation |
| **Firm** | ₹9,999/month | Unlimited + bulk upload + API access |

---

## 🔬 Research Context

This project is built on the **ILDC (Indian Legal Documents Corpus)**,
a benchmark dataset for Indian legal NLP research. Our fine-tuned
InLegalBERT model serves as a strong baseline for petition outcome
prediction — a challenging task with published accuracy benchmarks
of 63-72%.

---

## ⚠️ Disclaimer

> This tool is an **advisory system only**. Predictions are AI-generated
> and do not constitute legal advice. Always consult a qualified legal
> professional before making filing decisions.

---

## 👩‍💻 Built By

**Ekta**, **Santu** — Final Year B.Tech Project  
Focus: NLP • Legal AI • Full Stack Development

[![GitHub](https://img.shields.io/badge/GitHub-EktaC06-black?logo=github)](https://github.com/EktaC06)
[![GitHub](https://img.shields.io/badge/GitHub-santu567-black?logo=github)]((https://github.com/santu567))

---

## 📄 License

MIT License — feel free to use, modify and distribute with attribution.
