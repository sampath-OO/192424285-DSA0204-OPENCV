"""
Experiment 19: Perform Edge detection using Sobel Matrix along XY axis
"""
import cv2

IMAGE_PATH = "../images/sample.jpg"

img = cv2.imread(IMAGE_PATH)
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

sobel_x = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
sobel_y = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
sobel_xy = cv2.magnitude(sobel_x, sobel_y)
sobel_xy = cv2.convertScaleAbs(sobel_xy)

cv2.imwrite("../output/19_sobel_xy.jpg", sobel_xy)

cv2.imshow("Original", img)
cv2.imshow("Sobel XY", sobel_xy)
cv2.waitKey(0)
cv2.destroyAllWindows()
