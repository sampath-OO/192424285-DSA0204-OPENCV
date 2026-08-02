"""
Experiment 14: Perform transformation using Homography matrix.
"""
import cv2
import numpy as np

IMAGE_PATH = "../images/sample.jpg"

img = cv2.imread(IMAGE_PATH)
(h, w) = img.shape[:2]

src_pts = np.float32([[0, 0], [w - 1, 0], [w - 1, h - 1], [0, h - 1]])
dst_pts = np.float32([[10, 20], [w - 30, 5], [w - 10, h - 15], [30, h - 5]])

# findHomography computes the Homography (perspective) matrix using a set of point pairs
H, status = cv2.findHomography(src_pts, dst_pts)
result = cv2.warpPerspective(img, H, (w, h))

cv2.imwrite("../output/14_homography.jpg", result)

cv2.imshow("Original", img)
cv2.imshow("Homography Result", result)
cv2.waitKey(0)
cv2.destroyAllWindows()
