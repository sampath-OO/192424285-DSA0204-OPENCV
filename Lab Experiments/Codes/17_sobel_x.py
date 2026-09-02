"""
Experiment 17: Perform Edge detection using Sobel Matrix along X axis
"""
import cv2
import numpy as np

IMAGE_PATH = "../images/sample.jpg"

img = cv2.imread(IMAGE_PATH)
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

sobel_x = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
sobel_x = cv2.convertScaleAbs(sobel_x)

cv2.imwrite("../output/17_sobel_x.jpg", sobel_x)

cv2.imshow("Original", img)
cv2.imshow("Sobel X", sobel_x)
cv2.waitKey(0)
cv2.destroyAllWindows()
