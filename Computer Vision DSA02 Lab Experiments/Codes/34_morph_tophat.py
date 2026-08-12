"""
Experiment 34: Morphological operations based on OpenCV using Top hat technique.
Top Hat = Original - Opening (highlights bright details smaller than the kernel).
"""
import cv2
import numpy as np

IMAGE_PATH = "../images/sample.jpg"

img = cv2.imread(IMAGE_PATH)
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

kernel = np.ones((9, 9), np.uint8)
tophat = cv2.morphologyEx(gray, cv2.MORPH_TOPHAT, kernel)

cv2.imwrite("../output/34_tophat.jpg", tophat)

cv2.imshow("Grayscale", gray)
cv2.imshow("Top Hat", tophat)
cv2.waitKey(0)
cv2.destroyAllWindows()
