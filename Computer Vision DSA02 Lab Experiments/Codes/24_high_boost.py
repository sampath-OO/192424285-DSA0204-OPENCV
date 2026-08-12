"""
Experiment 24: Perform Sharpening of Image using High-Boost Masks.
High-boost mask (4-neighbor): A>=1, A+4 at center; if A=1 becomes standard Laplacian sharpening.
 0 -1  0
-1 A+4 -1
 0 -1  0
"""
import cv2
import numpy as np

IMAGE_PATH = "../images/sample.jpg"

img = cv2.imread(IMAGE_PATH)
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

A = 2  # boost factor, A >= 1
kernel = np.array([[ 0, -1,      0],
                    [-1, A + 4, -1],
                    [ 0, -1,      0]], dtype=np.float32)

high_boost = cv2.filter2D(gray, -1, kernel)

cv2.imwrite("../output/24_high_boost.jpg", high_boost)

cv2.imshow("Original", gray)
cv2.imshow(f"High-Boost (A={A})", high_boost)
cv2.waitKey(0)
cv2.destroyAllWindows()
