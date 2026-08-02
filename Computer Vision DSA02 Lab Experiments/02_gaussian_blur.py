"""
Experiment 2: Read an image in python and Convert an Image to Blur using GaussianBlur.
"""
import cv2

IMAGE_PATH = "../images/sample.jpg"

img = cv2.imread(IMAGE_PATH)
blur = cv2.GaussianBlur(img, (15, 15), 0)

cv2.imwrite("../output/02_gaussian_blur.jpg", blur)

cv2.imshow("Original", img)
cv2.imshow("Gaussian Blur", blur)
cv2.waitKey(0)
cv2.destroyAllWindows()
