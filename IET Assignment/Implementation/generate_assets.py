"""
Fetch authentic road photographs for testing OpenCV & YOLO road safety analysis.
"""
import urllib.request
import os
import cv2
import numpy as np

os.makedirs("static/samples", exist_ok=True)
os.makedirs("models", exist_ok=True)

# Generate calibration matrix .npz
camera_matrix = np.array([
    [750.0,   0.0, 320.0],
    [  0.0, 750.0, 240.0],
    [  0.0,   0.0,   1.0]
], dtype=np.float64)
dist_coeffs = np.array([-0.05, 0.01, 0.001, -0.001, 0.0], dtype=np.float64)
np.savez("models/calibration_params.npz", camera_matrix=camera_matrix, dist_coeffs=dist_coeffs)
print("Saved models/calibration_params.npz")

# Real road sample image URLs
sample_urls = {
    "sample1_urban_traffic.jpg": "https://raw.githubusercontent.com/ultralytics/ultralytics/main/ultralytics/assets/bus.jpg",
    "sample2_pedestrians.jpg": "https://raw.githubusercontent.com/ultralytics/ultralytics/main/ultralytics/assets/zidane.jpg"
}

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

for fname, url in sample_urls.items():
    dest = os.path.join("static/samples", fname)
    if not os.path.exists(dest):
        try:
            print(f"Downloading {fname} from {url}...")
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=10) as response, open(dest, 'wb') as out_file:
                out_file.write(response.read())
            print(f"Successfully saved {fname}")
        except Exception as e:
            print(f"Failed downloading {fname}: {e}")

print("Asset preparation complete.")
