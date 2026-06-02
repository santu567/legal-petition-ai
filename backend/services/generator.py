import torch
from transformers import AutoTokenizer, AutoModelForCausalLM

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
if DEVICE == "cpu":
    torch.set_num_threads(2)
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


def parse_explanation_text(text: str) -> dict:
    """Robustly parse Qwen's output into structured sections."""
    # Initialize default structure
    sections = {
        "reason": "Information pending classification...",
        "improvements": "No specific improvements listed.",
        "grounds": "Statutory grounds pending reinforcement.",
        "summary": "Summary analysis pending."
    }

    # Clean the output from markdown blocks if Qwen used them
    cleaned_text = text.strip()
    if cleaned_text.startswith("```json"):
        cleaned_text = cleaned_text[7:]
    elif cleaned_text.startswith("```"):
        cleaned_text = cleaned_text[3:]
    if cleaned_text.endswith("```"):
        cleaned_text = cleaned_text[:-3]
    cleaned_text = cleaned_text.strip()

    try:
        import json
        data = json.loads(cleaned_text)
        # Standardize keys to match the ones we need
        mapping = {
            "reason": ["reason", "reason for rejection", "reason for admission"],
            "improvements": ["improvements", "required improvements", "key strengths", "improvements to reapply"],
            "grounds": ["grounds", "legal grounds", "legal grounds to strengthen"],
            "summary": ["summary", "explanation summary", "explanation of rejection (summary)", "explanation of admission (summary)"]
        }
        extracted = {}
        for target, aliases in mapping.items():
            for alias in aliases:
                if alias in data:
                    extracted[target] = str(data[alias]).strip()
                    break
            if target not in extracted:
                extracted[target] = sections[target]
        return extracted
    except Exception:
        # Fallback keyword-based parser for raw text if JSON parsing fails
        text_lower = text.lower()
        
        def get_min_idx(patterns):
            idxs = [text_lower.find(p) for p in patterns if text_lower.find(p) != -1]
            return min(idxs) if idxs else -1

        idx_reason = get_min_idx(["reason for rejection", "reason for admission", "1. reason", '"reason"'])
        idx_improvements = get_min_idx(["required improvements", "key strengths", "2. required", "2. key", '"improvements"'])
        idx_grounds = get_min_idx(["legal grounds", "3. legal", '"grounds"'])
        idx_summary = get_min_idx(["explanation of", "4. explanation", "summary", '"summary"'])

        indices = [
            ("reason", idx_reason),
            ("improvements", idx_improvements),
            ("grounds", idx_grounds),
            ("summary", idx_summary)
        ]
        found = sorted([item for item in indices if item[1] != -1], key=lambda x: x[1])

        import re
        for i, (key, start_idx) in enumerate(found):
            end_idx = found[i+1][1] if i + 1 < len(found) else len(text)
            content = text[start_idx:end_idx].strip()
            
            # Strip header prefix/JSON keys
            first_colon = content.find(":")
            if first_colon != -1 and first_colon < 60:
                content = content[first_colon+1:].strip()
                
            # Clean up quotes, commas, braces, brackets, asterisks
            content = re.sub(r'^[\s"\'\-:,\{\}\[\]\*]+', '', content)
            content = re.sub(r'[\s"\'\-:,\{\}\[\]\*]+$', '', content)
            
            # Clean escaping
            content = content.replace('\\"', '"').replace('\\n', '\n').strip()
            
            if content:
                sections[key] = content

        return sections


def generate_explanation(text: str, prediction: str) -> dict:
    """
    Generate in-depth legal analysis and improvement suggestions.
    prediction: 'ADMITTED' or 'REJECTED'
    Returns dict with 'explanation' and 'sections' keys.
    """
    load_model()

    if len(text) > 3000:
        text = text[:3000] + "..."

    system_prompt = (
        "You are a senior Indian legal advocate specializing in Supreme Court and High Court litigation. "
        "Analyze the petition and return a JSON object with exactly the following keys:\n"
        "{\n"
        "  \"reason\": \"A brief 1-2 sentence explanation of the legal/jurisdictional grounds for the outcome.\",\n"
        "  \"improvements\": \"2-3 concise strengths or required improvements (1 short sentence each).\",\n"
        "  \"grounds\": \"1-2 specific statutes, articles, or precedents to reinforce (1 short sentence).\",\n"
        "  \"summary\": \"A short 1-2 sentence summary of the main reason and recommended strategy.\"\n"
        "}\n"
        "Output ONLY raw JSON. Do not include markdown code blocks or any conversational text outside the JSON. Keep descriptions very concise."
    )

    if prediction == "ADMITTED":
        user_prompt = f"""
The following petition was ADMITTED based on initial classification. Analyze it and output the JSON response.
Petition: {text}
"""
    else:
        user_prompt = f"""
The following petition was REJECTED based on initial classification. Analyze it and output the JSON response.
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
            max_new_tokens=400, # Increased to prevent truncation while prompt formatting keeps it fast
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

    parsed_sections = parse_explanation_text(output)

    # Reconstruct human-readable text from sections as a fallback/compatibility value for raw text field
    formatted_explanation = f"### Legal Analysis Matrix\n\n"
    formatted_explanation += f"#### 1. REASON FOR {'ADMISSION' if prediction == 'ADMITTED' else 'REJECTION'}\n{parsed_sections['reason']}\n\n"
    formatted_explanation += f"#### 2. {'KEY STRENGTHS' if prediction == 'ADMITTED' else 'REQUIRED IMPROVEMENTS TO REAPPLY'}\n{parsed_sections['improvements']}\n\n"
    formatted_explanation += f"#### 3. LEGAL GROUNDS TO STRENGTHEN\n{parsed_sections['grounds']}\n\n"
    formatted_explanation += f"#### 4. SUMMARY OF {'ADMISSION' if prediction == 'ADMITTED' else 'REJECTION'}\n{parsed_sections['summary']}"

    return {
        "explanation": formatted_explanation,
        "sections": parsed_sections
    }


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