"""
Experiment 10: Perform moving (translation) of an image from one place to another.
"""
import cv2
import numpy as np

IMAGE_PATH = "../images/sample.jpg"

img = cv2.imread(IMAGE_PATH)
(h, w) = img.shape[:2]

tx, ty = 80, 50   # shift 80 px right, 50 px down
M = np.float32([[1, 0, tx], [0, 1, ty]])
moved = cv2.warpAffine(img, M, (w, h))

cv2.imwrite("../output/10_translated.jpg", moved)

cv2.imshow("Original", img)
cv2.imshow("Translated", moved)
cv2.waitKey(0)
cv2.destroyAllWindows()
