"""
Experiment 21: Perform Sharpening of Image using Laplacian mask implemented with an
extension of diagonal neighbors.
Mask:
 1  1  1
 1 -8  1
 1  1  1
"""
import cv2
import numpy as np

IMAGE_PATH = "../images/sample.jpg"

img = cv2.imread(IMAGE_PATH)
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

kernel = np.array([[1,  1, 1],
                    [1, -8, 1],
                    [1,  1, 1]], dtype=np.float32)

laplacian = cv2.filter2D(gray, cv2.CV_64F, kernel)
sharpened = gray.astype(np.float32) - laplacian
sharpened = np.clip(sharpened, 0, 255).astype(np.uint8)

cv2.imwrite("../output/21_laplacian_diagonal.jpg", sharpened)

cv2.imshow("Original", gray)
cv2.imshow("Sharpened (Laplacian diagonal)", sharpened)
cv2.waitKey(0)
cv2.destroyAllWindows()
