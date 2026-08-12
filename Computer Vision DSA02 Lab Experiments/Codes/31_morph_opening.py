"""
Experiment 31: Morphological operations based on OpenCV using Opening technique.
Opening = Erosion followed by Dilation (removes small noise / thin protrusions).
"""
import cv2
import numpy as np

IMAGE_PATH = "../images/sample.jpg"

img = cv2.imread(IMAGE_PATH)
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
_, binary = cv2.threshold(gray, 127, 255, cv2.THRESH_BINARY)

kernel = np.ones((5, 5), np.uint8)
opening = cv2.morphologyEx(binary, cv2.MORPH_OPEN, kernel)

cv2.imwrite("../output/31_opening.jpg", opening)

cv2.imshow("Binary", binary)
cv2.imshow("Opening", opening)
cv2.waitKey(0)
cv2.destroyAllWindows()
