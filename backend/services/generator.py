# backend/services/generator.py

import torch
from transformers import AutoTokenizer, AutoModelForCausalLM

DEVICE = "cpu"
MODEL_NAME = "Qwen/Qwen2.5-1.5B-Instruct"

# Global — loaded once
_tokenizer = None
_model     = None


def load_model():
    """Load Qwen generative model once on startup."""
    global _tokenizer, _model

    if _model is not None:
        return

    print(f"Loading Qwen model ({MODEL_NAME})...")
    print("First run downloads ~3GB — please wait...")

    _tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    _model = AutoModelForCausalLM.from_pretrained(
        MODEL_NAME,
        torch_dtype=torch.float16 if DEVICE == "cuda" else torch.float32,
        low_cpu_mem_usage=True
    )
    _model.to(DEVICE)
    _model.eval()
    print(f"Qwen loaded on {DEVICE.upper()}!")


def generate_explanation(text: str, prediction: str) -> dict:
    """
    Generate legal explanation and improvement suggestions.
    prediction: 'ADMITTED' or 'REJECTED'
    Returns dict with 'explanation' key.
    """
    load_model()

    # Truncate long texts
    if len(text) > 2000:
        text = text[:2000] + "... [truncated]"

    system_prompt = (
        "You are an expert Indian legal assistant specializing "
        "in Supreme Court and High Court petition analysis. "
        "You provide professional, structured legal reasoning."
    )

    if prediction == "ADMITTED":
        user_prompt = f"""
The following legal petition was ADMITTED by the court.

Petition Text:
\"\"\"{text}\"\"\"

Provide your response in EXACTLY this format:

REASON FOR ADMISSION:
[Write 2-3 sentences explaining why this petition meets admission criteria]

KEY STRENGTHS:
1. [Strength 1]
2. [Strength 2]
3. [Strength 3]
"""
    else:
        user_prompt = f"""
The following legal petition was REJECTED by the court.

Petition Text:
\"\"\"{text}\"\"\"

Provide your response in EXACTLY this format:

REASON FOR REJECTION:
[Write 2-3 sentences explaining why this petition was rejected]

REQUIRED IMPROVEMENTS TO REAPPLY:
1. [Specific improvement 1]
2. [Specific improvement 2]
3. [Specific improvement 3]

LEGAL GROUNDS TO STRENGTHEN:
[One sentence on the strongest legal argument to develop]
"""

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user",   "content": user_prompt}
    ]

    text_input = _tokenizer.apply_chat_template(
        messages,
        tokenize=False,
        add_generation_prompt=True
    )

    model_inputs = _tokenizer(
        [text_input],
        return_tensors="pt"
    ).to(DEVICE)

    with torch.no_grad():
        generated_ids = _model.generate(
            **model_inputs,
            max_new_tokens=400,
            temperature=0.2,
            top_p=0.9,
            do_sample=True,
            pad_token_id=_tokenizer.eos_token_id
        )

    prompt_length    = model_inputs.input_ids.shape[1]
    generated_tokens = generated_ids[0][prompt_length:]
    output = _tokenizer.decode(
        generated_tokens,
        skip_special_tokens=True
    ).strip()

    return {"explanation": output}


# ── Quick test ───────────────────────────────────────────────────
if __name__ == "__main__":
    sample = """
    The petitioner filed this writ petition challenging
    the order of the High Court. The petition is time
    barred and lacks locus standi. No substantial
    question of law arises in this matter.
    """

    print("Testing generator...")
    result = generate_explanation(sample, "REJECTED")
    print("\nGenerated explanation:")
    print(result["explanation"])