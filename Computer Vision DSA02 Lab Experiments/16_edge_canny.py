"""
Experiment 16: Perform Edge detection using canny method
"""
import cv2

IMAGE_PATH = "../images/sample.jpg"

img = cv2.imread(IMAGE_PATH)
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
edges = cv2.Canny(gray, 100, 200)

cv2.imwrite("../output/16_canny_edges.jpg", edges)

cv2.imshow("Original", img)
cv2.imshow("Canny Edges", edges)
cv2.waitKey(0)
cv2.destroyAllWindows()
