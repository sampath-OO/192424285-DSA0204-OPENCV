"""
Experiment 33: Morphological operations based on OpenCV using Morphological Gradient technique.
Gradient = Dilation - Erosion (outlines the boundary of objects).
"""
import cv2
import numpy as np

IMAGE_PATH = "../images/sample.jpg"

img = cv2.imread(IMAGE_PATH)
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
_, binary = cv2.threshold(gray, 127, 255, cv2.THRESH_BINARY)

kernel = np.ones((5, 5), np.uint8)
gradient = cv2.morphologyEx(binary, cv2.MORPH_GRADIENT, kernel)

cv2.imwrite("../output/33_morph_gradient.jpg", gradient)

cv2.imshow("Binary", binary)
cv2.imshow("Morphological Gradient", gradient)
cv2.waitKey(0)
cv2.destroyAllWindows()
