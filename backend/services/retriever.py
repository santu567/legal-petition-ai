# backend/services/retriever.py

import numpy as np
import pandas as pd
import torch
import os
import pickle
from transformers import AutoTokenizer, AutoModel
import faiss


DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
MODEL_PATH = "chnitu/legal-petition-v1"
DATA_PATH  = os.path.join(
    os.path.dirname(__file__),
    "../../ml/data/cleaned/train.csv"
)
INDEX_PATH = os.path.join(
    os.path.dirname(__file__),
    "../../ml/data/embeddings/faiss_index.bin"
)
META_PATH  = os.path.join(
    os.path.dirname(__file__),
    "../../ml/data/embeddings/metadata.json"
)

# Global
_tokenizer = None
_model     = None
_index     = None
_metadata  = None


def load_model():
    """Load InLegalBERT for generating embeddings."""
    global _tokenizer, _model
    if _model is not None:
        return
    print("Loading InLegalBERT for FAISS embeddings...")
    _tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
    _model     = AutoModel.from_pretrained(MODEL_PATH)
    _model.to(DEVICE)
    _model.eval()
    print("Embedding model ready!")


def get_embedding(text: str) -> np.ndarray:
    """
    Convert text to a 768-dimensional vector using InLegalBERT.
    This is the mathematical representation of the petition's meaning.
    """
    load_model()

    words     = text.split()
    text      = ' '.join(words[:200])

    inputs = _tokenizer(
        text,
        return_tensors="pt",
        truncation=True,
        max_length=256,
        padding=True
    ).to(DEVICE)

    with torch.no_grad():
        outputs = _model(**inputs)
        # Use CLS token as sentence embedding
        embedding = outputs.last_hidden_state[:, 0, :]

    return embedding.cpu().numpy().astype('float32')


def build_index():
    """
    Build FAISS index from training data.
    Run this ONCE to create the searchable database.
    This converts all 32,302 cases into vectors.
    """
    load_model()

    print("Building FAISS index from training data...")
    print("This takes ~30 minutes — run once only!")

    if not os.path.exists(DATA_PATH):
        if os.path.exists(META_PATH):
            print(f"DATA_PATH ({DATA_PATH}) not found. Attempting to rebuild FAISS index from metadata.json...")
            import json
            with open(META_PATH, 'r', encoding='utf-8') as f:
                metadata = json.load(f)
            df = pd.DataFrame(metadata)
        else:
            raise FileNotFoundError(f"Neither training data ({DATA_PATH}) nor metadata ({META_PATH}) found. Cannot build FAISS index.")
    else:
        df = pd.read_csv(DATA_PATH)
        df = df.dropna(subset=['text'])

    # Use subset for faster building — 5000 cases
    # Still gives excellent similar case retrieval
    df = df.sample(n=min(5000, len(df)), random_state=42)
    df = df.reset_index(drop=True)

    print(f"Building index from {len(df)} cases...")

    embeddings = []
    for i, row in df.iterrows():
        if i % 100 == 0:
            print(f"Processing {i}/{len(df)}...")
        emb = get_embedding(str(row['text']))
        embeddings.append(emb[0])

    embeddings = np.array(embeddings).astype('float32')

    # Normalize for cosine similarity
    faiss.normalize_L2(embeddings)

    # Build FAISS index
    dimension = embeddings.shape[1]  # 768
    index     = faiss.IndexFlatIP(dimension)  # Inner product = cosine similarity
    index.add(embeddings)

    # Save index
    os.makedirs(os.path.dirname(INDEX_PATH), exist_ok=True)
    faiss.write_index(index, INDEX_PATH)

    # Save metadata
    import json
    metadata = df[['text', 'label']].to_dict('records')
    with open(META_PATH, 'w', encoding='utf-8') as f:
        json.dump(metadata, f, ensure_ascii=False, indent=2)

    print(f"FAISS index built! {index.ntotal} cases indexed.")
    return index, metadata


def load_index():
    """Load pre-built FAISS index from disk."""
    global _index, _metadata

    if _index is not None:
        return _index, _metadata

    if not os.path.exists(INDEX_PATH):
        print("Index not found — building now...")
        _index, _metadata = build_index()
        return _index, _metadata

    print("Loading FAISS index...")
    _index = faiss.read_index(INDEX_PATH)
    import json
    with open(META_PATH, 'r', encoding='utf-8') as f:
        _metadata = json.load(f)
    print(f"FAISS index loaded! {_index.ntotal} cases.")
    return _index, _metadata


def find_similar_cases(text: str, top_k: int = 3) -> list:
    """
    Find top_k most similar cases to the given petition.
    Returns list of similar cases with their outcomes.
    """
    index, metadata = load_index()

    # Get embedding for query
    query_embedding = get_embedding(text)
    faiss.normalize_L2(query_embedding)

    # Search index
    distances, indices = index.search(query_embedding, top_k)

    results = []
    for i, (dist, idx) in enumerate(
            zip(distances[0], indices[0])):
        if idx == -1:
            continue
        case = metadata[idx]
        results.append({
            "rank"      : i + 1,
            "similarity": round(float(dist) * 100, 1),
            "outcome"   : "ADMITTED" if case['label'] == 1
                          else "REJECTED",
            "excerpt"   : str(case['text'])[:300] + "...",
        })

    return results


# ── Build index on first run ─────────────────────────────────────
if __name__ == "__main__":
    print("Building FAISS index...")
    build_index()
    print("\nTesting similar case search...")

    sample = """
    The petitioner challenges the constitutional validity
    of Section 66A of the Information Technology Act 2000
    as being violative of Article 19(1)(a) of the
    Constitution of India. Fundamental rights violated.
    """

    results = find_similar_cases(sample, top_k=3)

    print(f"\nTop {len(results)} similar cases:")
    for r in results:
        print(f"\nRank {r['rank']} "
              f"(Similarity: {r['similarity']}%)")
        print(f"Outcome  : {r['outcome']}")
        print(f"Excerpt  : {r['excerpt'][:150]}...")


