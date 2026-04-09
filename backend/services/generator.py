# backend/services/generator.py

import torch
from transformers import AutoTokenizer, AutoModelForCausalLM

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
MODEL_NAME = "Qwen/Qwen2.5-0.5B-Instruct"

# Global — loaded once
_tokenizer = None
_model     = None


def translate_to_judgment_format(text: str) -> str:
    """
    Use Qwen to translate a lawyer's draft petition into the academic
    style of a final Supreme Court Judgment so InLegalBERT can recognize it.
    """
    load_model()
    
    if len(text) > 2000:
        text = text[:2000] + "..."

    system_prompt = (
        "You are an AI legal assistant that converts lawyer draft petitions into the academic style of a final Supreme Court Judgment."
    )
    
    user_prompt = f"""
    Please rewrite the core legal facts and cited articles of the following draft petition as if it were a Supreme Court Judgment summary. 
    Use phrases like 'The appellant contends', 'It is undisputed that', etc. Do not include lawyer formatting like 'MOST RESPECTFULLY SHOWETH'. 
    Strictly summarize the legal arguments in one dense paragraph.
    
    Draft Petition:
    {text}
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
    
    model_inputs = _tokenizer([text_input], return_tensors="pt").to(DEVICE)
    
    with torch.no_grad():
        generated_ids = _model.generate(
            **model_inputs,
            max_new_tokens=150,  # Keep it short and fast (~10s)
            temperature=0.1,     # Very factual, low creativity
            do_sample=True,
            top_p=0.9,
            pad_token_id=_tokenizer.eos_token_id
        )
        
    prompt_length = model_inputs.input_ids.shape[1]
    output = _tokenizer.decode(
        generated_ids[0][prompt_length:],
        skip_special_tokens=True
    ).strip()
    
    return output


def load_model():
    """Load Qwen generative model once on startup."""
    global _tokenizer, _model

    if _model is not None:
        return

    print(f"Loading Ultra-Fast 0.5B Model ({MODEL_NAME}) on {DEVICE.upper()}...")
    
    _tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    _model = AutoModelForCausalLM.from_pretrained(
        MODEL_NAME,
        torch_dtype=torch.float16 if DEVICE == "cuda" else torch.float32,
        low_cpu_mem_usage=True
    ).to(DEVICE)
    _model.eval()
    print(f"Qwen 0.5B ready!")


def generate_explanation(text: str, prediction: str) -> dict:
    """
    Generate in-depth legal analysis and improvement suggestions.
    prediction: 'ADMITTED' or 'REJECTED'
    Returns dict with 'explanation' key.
    """
    load_model()

    # Truncate text for context while maintaining high depth
    if len(text) > 3000:
        text = text[:3000] + "..."

    system_prompt = (
        "You are a senior Indian legal advocate specializing in Supreme Court and High Court litigation. "
        "Provide a comprehensive, authoritative, and multi-faceted legal analysis. Be elaborate and detailed."
    )

    if prediction == "ADMITTED":
        user_prompt = f"""
The following petition was ADMITTED based on initial classification. Provide a deep structural analysis using EXACTLY these 4 headers:
1. REASON FOR ADMISSION: [Elaborate extensively on the core constitutional or legal grounds that justify admission. Detail why current laws and precedents favor this matter.]
2. KEY STRENGTHS: [Identify and explain 3-4 major strengths in the petition's logic, factual background, or legal framing.]
3. LEGAL GROUNDS TO STRENGTHEN: [Even as an admitted case, provide a detailed recommendation on which legal precedents or constitutional articles should be reinforced to ensure final victory.]
4. EXPLANATION OF ADMISSION (SUMMARY): [A detailed 4-5 sentence summary of the overall analysis.]

Petition: {text}
"""
    else:
        user_prompt = f"""
The following petition was REJECTED based on initial classification. Provide a deep structural analysis using EXACTLY these 4 headers:
1. REASON FOR REJECTION: [Provide an exhaustive legal explanation for the rejection. Cite potential jurisdictional overlaps, lack of locus standi, or procedural non-compliance in detail. Do not be brief.]
2. REQUIRED IMPROVEMENTS TO REAPPLY: [List 4-5 highly detailed and specific legal/procedural improvements required to make this petition fit for filing. Describe how to implement each improvement.]
3. LEGAL GROUNDS TO STRENGTHEN: [Analyze and detail specific legal grounds—statutes, articles, or previous judgments—that were weak and need thorough research and reinforcement.]
4. EXPLANATION OF REJECTION (SUMMARY): [A detailed 4-5 sentence summary of why this petition was deemed insufficient and what the core strategy should be moving forward.]

Petition: {text}
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

    model_inputs = _tokenizer([text_input], return_tensors="pt").to(DEVICE)

    with torch.no_grad():
        generated_ids = _model.generate(
            **model_inputs,
            max_new_tokens=450, # Significantly increased for elaboration
            temperature=0.2, 
            do_sample=True,
            top_p=0.9,
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