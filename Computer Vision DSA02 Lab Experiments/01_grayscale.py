"""
Experiment 1: Perform basic Image Handling and processing operations on the image.
Read an image in python and Convert an Image to Grayscale
"""
import cv2

IMAGE_PATH = "../images/sample.jpg"   # <-- location of the input image

img = cv2.imread(IMAGE_PATH)
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

cv2.imwrite("../output/01_grayscale.jpg", gray)

cv2.imshow("Original", img)
cv2.imshow("Grayscale", gray)
cv2.waitKey(0)
cv2.destroyAllWindows()
