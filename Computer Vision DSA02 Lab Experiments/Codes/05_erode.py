"""
Experiment 5: Read an image in python and Erode an Image using erode function.
"""
import cv2
import numpy as np

IMAGE_PATH = "../images/sample.jpg"

img = cv2.imread(IMAGE_PATH)
kernel = np.ones((5, 5), np.uint8)
eroded = cv2.erode(img, kernel, iterations=1)

cv2.imwrite("../output/05_erode.jpg", eroded)

cv2.imshow("Original", img)
cv2.imshow("Eroded", eroded)
cv2.waitKey(0)
cv2.destroyAllWindows()
