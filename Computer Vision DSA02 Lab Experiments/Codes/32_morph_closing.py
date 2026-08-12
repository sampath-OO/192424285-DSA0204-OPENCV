"""
Experiment 32: Morphological operations based on OpenCV using Closing technique.
Closing = Dilation followed by Erosion (fills small holes / gaps).
"""
import cv2
import numpy as np

IMAGE_PATH = "../images/sample.jpg"

img = cv2.imread(IMAGE_PATH)
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
_, binary = cv2.threshold(gray, 127, 255, cv2.THRESH_BINARY)

kernel = np.ones((5, 5), np.uint8)
closing = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, kernel)

cv2.imwrite("../output/32_closing.jpg", closing)

cv2.imshow("Binary", binary)
cv2.imshow("Closing", closing)
cv2.waitKey(0)
cv2.destroyAllWindows()
