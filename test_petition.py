#!/usr/bin/env python3
"""
Test script for the legal petition classifier.
Loads the trained model and predicts admission decision for petition text.
"""

from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import sys

# Load the saved model and tokenizer
model_path = "./legal_petition_model"
print(f"Loading model from: {model_path}")
tokenizer = AutoTokenizer.from_pretrained(model_path)
model = AutoModelForSequenceClassification.from_pretrained(model_path)
model.eval()  # Set to evaluation mode
print("✅ Model loaded successfully!\n")

MAX_LENGTH = 256

def predict_petition(text):
    """Predict admission decision for a given petition text."""
    # Tokenize the input
    inputs = tokenizer(
        text,
        return_tensors="pt",
        truncation=True,
        padding=True,
        max_length=MAX_LENGTH
    ).to(model.device)
    
    # Make prediction
    with torch.no_grad():
        logits = model(**inputs).logits
        probabilities = torch.softmax(logits, dim=-1)
        pred = torch.argmax(logits, dim=-1).item()
        confidence = probabilities[0][pred].item()
    
    # Format output
    decision = "ACCEPTED" if pred == 1 else "REJECTED"
    confidence_pct = confidence * 100
    
    return decision, confidence_pct, probabilities[0].tolist()

def main():
    print("=" * 60)
    print("LEGAL PETITION CLASSIFIER - TEST MODE")
    print("=" * 60)
    print()
    
    # Check if text provided as command line argument
    if len(sys.argv) > 1:
        # Join all arguments as the petition text
        petition_text = " ".join(sys.argv[1:])
    else:
        # Interactive mode: ask for input
        print("Enter petition text (or press Enter to use example):")
        print("-" * 60)
        petition_text = input().strip()
        
        if not petition_text:
            # Use example if no input provided
            petition_text = "The petitioner provides strong documentary evidence and causes of action. The court may admit the petition for further hearing."
            print(f"\nUsing example petition:\n{petition_text}\n")
    
    # Make prediction
    decision, confidence, probs = predict_petition(petition_text)
    
    # Display results
    print("\n" + "=" * 60)
    print("PREDICTION RESULTS")
    print("=" * 60)
    print(f"Decision: {decision}")
    print(f"Confidence: {confidence:.2f}%")
    print(f"\nProbabilities:")
    print(f"  REJECTED (0): {probs[0]*100:.2f}%")
    print(f"  ACCEPTED (1): {probs[1]*100:.2f}%")
    print("=" * 60)

if __name__ == "__main__":
    main()
