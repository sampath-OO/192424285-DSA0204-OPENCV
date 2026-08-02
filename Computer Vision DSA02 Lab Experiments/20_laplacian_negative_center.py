"""
Experiment 20: Perform Sharpening of Image using Laplacian mask with negative center coefficient.
Mask:
 0  1  0
 1 -4  1
 0  1  0
"""
import cv2
import numpy as np

IMAGE_PATH = "../images/sample.jpg"

img = cv2.imread(IMAGE_PATH)
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

kernel = np.array([[0,  1, 0],
                    [1, -4, 1],
                    [0,  1, 0]], dtype=np.float32)

laplacian = cv2.filter2D(gray, cv2.CV_64F, kernel)
sharpened = gray.astype(np.float32) - laplacian
sharpened = np.clip(sharpened, 0, 255).astype(np.uint8)

cv2.imwrite("../output/20_laplacian_negative_center.jpg", sharpened)

cv2.imshow("Original", gray)
cv2.imshow("Sharpened (Laplacian neg. center)", sharpened)
cv2.waitKey(0)
cv2.destroyAllWindows()
