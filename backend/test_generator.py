# backend/test_generator.py

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.generator import generate_explanation

# Test with a REJECTED petition
print("="*50)
print("TEST 1 — REJECTED PETITION")
print("="*50)

rejected_text = """
The petitioner filed this writ petition challenging 
the order of the High Court dated 15th March 2023. 
The petition is time barred as it was filed after 
the limitation period of 90 days. The petitioner 
has failed to establish locus standi. No substantial 
question of law arises in this matter. The respondent 
authorities acted within their jurisdiction.
"""

result = generate_explanation(rejected_text, "REJECTED")
print(result["explanation"])

# Test with an ADMITTED petition
print("\n" + "="*50)
print("TEST 2 — ADMITTED PETITION")
print("="*50)

admitted_text = """
The petitioner challenges the constitutional validity 
of Section 66A of the Information Technology Act 2000 
as being violative of Article 19(1)(a) of the 
Constitution of India. The petitioner has suffered 
direct violation of fundamental rights. The matter 
involves a substantial question of law of public 
importance affecting citizens across India. 
Urgent relief is sought as arrests are being made 
under the impugned provision daily.
"""

result = generate_explanation(admitted_text, "ADMITTED")
print(result["explanation"])

print("\n✅ Generator test complete!")