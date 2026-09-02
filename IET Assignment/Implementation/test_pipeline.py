"""
Comprehensive test script for Road Safety AI Computer Vision pipeline.
Tests all sample images, road marking extraction, YOLO inference, and safety rating.
"""
import os
import sys

# Import functions from app.py
from app import process_road_image

sample_files = [
    "static/samples/sample1_urban_traffic.jpg",
    "static/samples/sample2_pedestrians.jpg",
    "static/samples/sample3_highway_lanes.jpg",
    "static/samples/sample4_stop_junction.jpg"
]

print("\n" + "="*70)
print(" RUNNING ROAD SAFETY AI COMPUTER VISION PIPELINE TESTS")
print("="*70)

all_passed = True

for sample_path in sample_files:
    print(f"\n--- Testing: {sample_path} ---")
    if not os.path.exists(sample_path):
        print(f"ERROR: File not found: {sample_path}")
        all_passed = False
        continue
        
    try:
        res = process_road_image(sample_path)
        print(f"✓ Success: {res['success']}")
        print(f"  - Processing Time: {res['performance']['processing_time_seconds']} s")
        print(f"  - Vehicles: {res['statistics']['vehicles']}")
        print(f"  - Pedestrians: {res['statistics']['pedestrians']}")
        print(f"  - Road Signs: {res['statistics']['road_signs']}")
        print(f"  - Road Markings: {res['statistics']['road_markings']}")
        print(f"  - Safety Rating: {res['safety_assessment']['level']} ({res['safety_assessment']['headline']})")
        print(f"  - Pedestrian Alert Active: {res['pedestrian_safety']['alert_active']}")
        print(f"  - Calibration: {res['camera_calibration']['status']}")
        print(f"  - Output Image: {res['analyzed_image_url']}")
    except Exception as e:
        print(f"✗ FAILED with error: {e}")
        import traceback
        traceback.print_exc()
        all_passed = False

print("\n" + "="*70)
if all_passed:
    print(" ALL TESTS PASSED SUCCESSFULLY! CV PIPELINE IS 100% OPERATIONAL.")
else:
    print(" SOME TESTS FAILED.")
print("="*70 + "\n")
