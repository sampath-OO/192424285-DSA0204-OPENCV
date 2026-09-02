"""
Experiment 3: Read an image in python and Convert an Image to show outline using Canny function.
"""
import cv2

IMAGE_PATH = "../images/sample.jpg"

img = cv2.imread(IMAGE_PATH)
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
edges = cv2.Canny(gray, 100, 200)

cv2.imwrite("../output/03_canny_outline.jpg", edges)

cv2.imshow("Original", img)
cv2.imshow("Canny Outline", edges)
cv2.waitKey(0)
cv2.destroyAllWindows()
