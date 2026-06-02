# Use an optimized Python runtime
FROM python:3.10-slim

# Set the working directory
WORKDIR /app

# Install system dependencies (FAISS and PyMuPDF often require these)
RUN apt-get update && apt-get install -y \
    libgomp1 \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Fix to ensure huggingface hub token and models can be cached securely in Spaces
RUN mkdir -p /app/.cache/huggingface \
    && chmod -R 777 /app/.cache

# Copy requirements first (for Docker caching)
COPY requirements.txt .

# Install PyTorch for CPU explicitly first to keep the image lightweight (since HF Spaces free tier is CPU)
RUN pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu

# Install the rest of the project dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Install missing dependencies that were likely installed locally via conda
RUN pip install --no-cache-dir PyMuPDF PyJWT passlib bcrypt

# Copy the entire backend folder into /app/backend
COPY backend /app/backend

# Copy the pre-built FAISS index and JSON metadata into the container
COPY ml/data/embeddings /app/ml/data/embeddings

# Set huggingface specific environment variables
ENV TRANSFORMERS_CACHE="/app/.cache/huggingface"
ENV HF_HOME="/app/.cache/huggingface"

# Hugging Face Spaces requires the app to listen on port 7860
EXPOSE 7860

# Start the FastAPI server on port 7860
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "7860"]
