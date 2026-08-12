"""
Experiment 35: Morphological operations based on OpenCV using Black hat technique.
Black Hat = Closing - Original (highlights dark details smaller than the kernel).
"""
import cv2
import numpy as np

IMAGE_PATH = "../images/sample.jpg"

img = cv2.imread(IMAGE_PATH)
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

kernel = np.ones((9, 9), np.uint8)
blackhat = cv2.morphologyEx(gray, cv2.MORPH_BLACKHAT, kernel)

cv2.imwrite("../output/35_blackhat.jpg", blackhat)

cv2.imshow("Grayscale", gray)
cv2.imshow("Black Hat", blackhat)
cv2.waitKey(0)
cv2.destroyAllWindows()
