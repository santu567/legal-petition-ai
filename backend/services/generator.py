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
                    val = data[alias]
                    if isinstance(val, list):
                        val = ", ".join([str(x).strip() for x in val if str(x).strip()])
                    else:
                        val = str(val).strip()
                    if val:
                        extracted[target] = val
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
            
            # Ignore it if it's just another header or empty
            if content and not content.startswith("#") and not re.match(r'^\d+\.', content):
                sections[key] = content

        return sections


def _count_points(text: str) -> int:
    """Count the number of distinct points/sentences in a text."""
    import re
    # Split by bullet markers, numbered lists, or sentence-ending punctuation
    points = re.split(r'[;\.\n•\-]\s*', text.strip())
    return len([p for p in points if len(p.strip()) > 10])


def enrich_sections(sections: dict, prediction: str) -> dict:
    """
    Guarantee at least 3 points per section by supplementing short model
    outputs with context-aware template suggestions based on prediction type.
    """
    # Template pools keyed by prediction type
    templates = {
        "REJECTED": {
            "reason": [
                "The petition may be barred by laches or limitation due to unexplained delay in filing.",
                "The petitioner has not established locus standi or a direct cause of action against the respondent.",
                "No substantial question of law or constitutional violation has been demonstrated in the pleadings.",
                "The petition bypasses the proper appellate or revisional forum available under the governing statute.",
                "The facts and grounds stated are insufficient to invoke the extraordinary writ jurisdiction of the court."
            ],
            "improvements": [
                "File a formal condonation of delay application with a detailed affidavit explaining the reasons for late filing.",
                "Annex all relevant documentary evidence including certified copies, official records, and supporting affidavits.",
                "Exhaust all alternative statutory remedies (appeals, tribunals, or departmental forums) before approaching the High Court or Supreme Court.",
                "Clearly articulate the specific fundamental right violated and cite the relevant constitutional provisions (e.g. Article 14, 19, or 21).",
                "Engage a domain-specific legal expert to strengthen the pleadings with precise factual and legal arguments."
            ],
            "grounds": [
                "Article 226 of the Constitution (writ jurisdiction of High Courts) and its limitations when alternative remedies exist.",
                "The Limitation Act, 1963, particularly Section 5 regarding condonation of delay and sufficient cause.",
                "Article 14 (right to equality) and Article 19 (freedom of speech/profession) of the Constitution of India.",
                "Supreme Court precedent in State of M.P. v. Bhailal Bhai regarding unexplained delay in writ petitions.",
                "Section 64 of the relevant governing statute regarding statutory appeals and reference mechanisms."
            ],
            "summary": [
                "The petition is procedurally deficient due to delay, lack of evidence, and failure to exhaust alternative remedies.",
                "The recommended strategy is to first approach the appropriate statutory forum or appellate authority before invoking writ jurisdiction.",
                "Strengthen the petition by providing comprehensive documentary evidence, explaining any delay, and framing specific constitutional grounds."
            ]
        },
        "ADMITTED": {
            "reason": [
                "The petition raises a substantial question of law involving interpretation of constitutional provisions.",
                "The petitioner has demonstrated a direct and personal violation of fundamental rights under Part III of the Constitution.",
                "The matter involves significant public interest and affects a large section of citizens, warranting judicial intervention.",
                "The petition is supported by strong documentary evidence and well-articulated legal arguments.",
                "The impugned order or statute prima facie appears to violate the principles of natural justice or constitutional safeguards."
            ],
            "improvements": [
                "Strengthen the constitutional challenge by citing additional Supreme Court precedents on similar fundamental rights violations.",
                "Include comparative legal analysis from other jurisdictions to support the constitutional argument.",
                "Provide expert affidavits or technical reports to substantiate the factual claims made in the petition.",
                "Ensure all procedural requirements including proper party impleadment and court fees are meticulously complied with.",
                "Prepare detailed written submissions addressing potential counter-arguments from the respondent."
            ],
            "grounds": [
                "Article 32 of the Constitution (right to approach the Supreme Court for enforcement of fundamental rights).",
                "Article 21 (right to life and personal liberty) as interpreted expansively by the Supreme Court.",
                "Article 14 (right to equality before law) and the doctrine of reasonable classification.",
                "The principles of natural justice (audi alteram partem and nemo judex in causa sua).",
                "Relevant provisions of the governing statute and associated rules/regulations."
            ],
            "summary": [
                "The petition has strong constitutional merit and is well-positioned for admission on fundamental rights grounds.",
                "Continue to build the evidentiary record and prepare for detailed hearings on the merits of the constitutional challenge.",
                "Engage with amicus curiae or interveners if the matter has broader public interest implications."
            ]
        }
    }

    pool = templates.get(prediction, templates["REJECTED"])
    enriched = {}

    for key in ["reason", "improvements", "grounds", "summary"]:
        current = sections.get(key, "").strip()
        num_points = _count_points(current)

        if num_points >= 3:
            # Already has enough points
            enriched[key] = current
        else:
            # Need to add more points from the template pool
            points_needed = 3 - num_points
            available = pool.get(key, [])

            # Filter out templates that are too similar to existing content
            existing_lower = current.lower()
            fresh = [t for t in available if t.lower()[:30] not in existing_lower]

            supplements = fresh[:points_needed]
            if current and not current.endswith((".", "!", "?")):
                current += "."

            if current:
                enriched[key] = current + " " + " ".join(supplements)
            else:
                enriched[key] = " ".join(supplements[:3])

    return enriched


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
        "Analyze the petition and return a JSON object with exactly the keys: \"reason\", \"improvements\", \"grounds\", \"summary\".\n"
        "Fill in the keys based on these instructions:\n"
        "- \"reason\": Give 3 distinct points explaining why the petition was rejected or admitted. Cover jurisdiction, procedural issues, and substantive merit.\n"
        "- \"improvements\": Give 3 concrete, actionable suggestions to improve the petition (e.g. 'File a condonation of delay application', 'Provide documentary evidence', 'Exhaust alternative statutory remedies').\n"
        "- \"grounds\": Give 3 specific legal provisions, constitutional articles, or statutes to strengthen (e.g. 'Article 226', 'Article 14', 'Limitation Act Section 5').\n"
        "- \"summary\": Give 3 sentences summarizing the overall analysis and recommended legal strategy.\n"
        "Output ONLY raw JSON. Do not include markdown code blocks or any conversational text outside the JSON. Ensure every field has at least 3 points."
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
            max_new_tokens=600,  # Increased to allow 3+ points per field
            temperature=0.3,     # Slightly higher for more diverse content
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

    # Enrich sections to guarantee at least 3 points per field
    parsed_sections = enrich_sections(parsed_sections, prediction)

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