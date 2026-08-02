"""
Experiment 8: Scaling an image to its Bigger and Smaller sizes.
"""
import cv2

IMAGE_PATH = "../images/sample.jpg"

img = cv2.imread(IMAGE_PATH)

bigger = cv2.resize(img, None, fx=1.5, fy=1.5, interpolation=cv2.INTER_LINEAR)
smaller = cv2.resize(img, None, fx=0.5, fy=0.5, interpolation=cv2.INTER_AREA)

cv2.imwrite("../output/08_bigger.jpg", bigger)
cv2.imwrite("../output/08_smaller.jpg", smaller)

cv2.imshow("Original", img)
cv2.imshow("Bigger", bigger)
cv2.imshow("Smaller", smaller)
cv2.waitKey(0)
cv2.destroyAllWindows()
