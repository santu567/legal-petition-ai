# src/training/config.py

class TrainingConfig:

    # ── MODEL ────────────────────────────────────────────────
    MODEL_NAME   = 'law-ai/InLegalBERT'
    NUM_LABELS   = 2
    MAX_LENGTH   = 256      # reduced from 512 — facts only

    # ── DATA PATHS ───────────────────────────────────────────
    TRAIN_DATA = 'data/cleaned/train.csv'
    VAL_DATA   = 'data/cleaned/val.csv'
    TEST_DATA  = 'data/cleaned/test.csv'
    OUTPUT_DIR   = 'models/inlegalbert-finetuned-v2'

    # ── TRAINING SETTINGS (retuned for better accuracy) ──────
    BATCH_SIZE             = 16   # increased — 256 tokens uses less VRAM
    GRADIENT_ACCUM_STEPS   = 2    # effective batch = 32
    EPOCHS                 = 8    # more epochs for better learning
    LEARNING_RATE          = 1e-5 # lower than before — more stable
    WARMUP_RATIO           = 0.15 # more warmup — helps early stability
    WEIGHT_DECAY           = 0.01

    # ── MEMORY OPTIMIZATION ──────────────────────────────────
    FP16                   = True
    GRADIENT_CHECKPOINTING = True

    # ── CLASS WEIGHTS (fix imbalance) ────────────────────────
    # REJECT: 18920, ADMIT: 13385
    # Weight = total / (2 * class_count)
    CLASS_WEIGHT_ADMIT     = 1.41
    CLASS_WEIGHT_REJECT    = 1.0