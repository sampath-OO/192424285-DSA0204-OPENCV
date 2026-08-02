"""
Experiment 18: Perform Edge detection using Sobel Matrix along Y axis
"""
import cv2

IMAGE_PATH = "../images/sample.jpg"

img = cv2.imread(IMAGE_PATH)
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

sobel_y = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
sobel_y = cv2.convertScaleAbs(sobel_y)

cv2.imwrite("../output/18_sobel_y.jpg", sobel_y)

cv2.imshow("Original", img)
cv2.imshow("Sobel Y", sobel_y)
cv2.waitKey(0)
cv2.destroyAllWindows()
