"""
Experiment 25: Perform Sharpening of Image using Gradient masking.
Uses Sobel-style gradient masks (X and Y directions) and combines the magnitude
with the original image to sharpen edges.
"""
import cv2
import numpy as np

IMAGE_PATH = "../images/sample.jpg"

img = cv2.imread(IMAGE_PATH)
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float32)

gx_kernel = np.array([[-1, -2, -1],
                       [ 0,  0,  0],
                       [ 1,  2,  1]], dtype=np.float32)

gy_kernel = np.array([[-1, 0, 1],
                       [-2, 0, 2],
                       [-1, 0, 1]], dtype=np.float32)

gx = cv2.filter2D(gray, -1, gx_kernel)
gy = cv2.filter2D(gray, -1, gy_kernel)
gradient_magnitude = cv2.magnitude(gx, gy)

sharpened = gray + gradient_magnitude
sharpened = np.clip(sharpened, 0, 255).astype(np.uint8)

cv2.imwrite("../output/25_gradient_masking.jpg", sharpened)

cv2.imshow("Original", gray.astype(np.uint8))
cv2.imshow("Gradient Sharpened", sharpened)
cv2.waitKey(0)
cv2.destroyAllWindows()
