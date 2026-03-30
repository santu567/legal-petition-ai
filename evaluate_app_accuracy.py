import os
import sys
import pandas as pd
from tqdm import tqdm

# Allow importing the backend services
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend'))
from services.classifier import predict, load_model

def evaluate_new_accuracy(csv_path="ml/data/processed/test.csv", sample_size=500):
    """
    Evaluates the real-world application accuracy post our preprocessing
    and thresholding patches.
    """
    print(f"Loading test dataset from {csv_path}...")
    try:
        df = pd.read_csv(csv_path)
    except Exception as e:
        print(f"Failed to load dataset: {e}")
        return

    # Autodetect column names
    text_col = next((col for col in df.columns if 'text' in col.lower() or 'petition' in col.lower()), None)
    label_col = next((col for col in df.columns if 'label' in col.lower() or 'target' in col.lower() or 'outcome' in col.lower()), None)

    if not text_col or not label_col:
        print(f"Could not automatically find text and label columns. Columns found: {df.columns.tolist()}")
        return

    # Quick sample so you don't have to wait hours for CPU inference
    if len(df) > sample_size:
        print(f"Dataset has {len(df)} rows. Sampling {sample_size} for a quick evaluation.")
        df = df.sample(n=sample_size, random_state=42).reset_index(drop=True)
        
    print("Warming up classifier model...")
    load_model()
    
    correct = 0
    false_negatives = 0
    false_positives = 0
    true_admitted = 0
    true_rejected = 0

    print("\nRunning inference with new thresholds and parsing logic...")
    for idx, row in tqdm(df.iterrows(), total=len(df), desc="Evaluating"):
        text = str(row[text_col])
        true_label = int(row[label_col]) # Assume 1 = ADMITTED, 0 = REJECTED
        
        # 0 = REJECTED, 1 = ADMITTED
        truth_str = "ADMITTED" if true_label == 1 else "REJECTED"
        if true_label == 1:
            true_admitted += 1
        else:
            true_rejected += 1
        
        try:
            result = predict(text)
            pred_str = result["prediction"]
            
            if pred_str == truth_str:
                correct += 1
            else:
                if truth_str == "ADMITTED" and pred_str == "REJECTED":
                    false_negatives += 1
                elif truth_str == "REJECTED" and pred_str == "ADMITTED":
                    false_positives += 1
        except Exception as e:
            continue

    total_evaluated = true_admitted + true_rejected
    accuracy = (correct / total_evaluated) * 100

    print("\n" + "="*50)
    print(" APPLICATION ACCURACY REPORT ".center(50, "="))
    print("="*50)
    print(f"Total Evaluated: {total_evaluated}")
    print(f"Correct Predictions: {correct}")
    print(f"\nNEW EXACT ACCURACY: {accuracy:.2f}%\n")
    
    print(f"False Negatives (Admitted, but predicted Rejected): {false_negatives}")
    print(f"False Positives (Rejected, but predicted Admitted): {false_positives}")
    
    print("\nNext Steps:")
    if false_negatives > false_positives:
        print("Model is slightly biased toward rejection. You can slightly adjust the ADMIT_THRESHOLD in classifier.py to balance the ratio.")
    else:
        print("The threshold balance between False Positives and False Negatives is healthy!")

if __name__ == "__main__":
    evaluate_new_accuracy()
