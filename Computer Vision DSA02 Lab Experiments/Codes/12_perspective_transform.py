"""
Experiment 12: Perform Perspective Transformation on the image.
"""
import cv2
import numpy as np

IMAGE_PATH = "../images/sample.jpg"

img = cv2.imread(IMAGE_PATH)
(h, w) = img.shape[:2]

src_pts = np.float32([[0, 0], [w - 1, 0], [0, h - 1], [w - 1, h - 1]])
dst_pts = np.float32([[0, 0], [w - 1, 0], [int(0.25 * w), h - 1], [int(0.75 * w), h - 1]])

M = cv2.getPerspectiveTransform(src_pts, dst_pts)
warped = cv2.warpPerspective(img, M, (w, h))

cv2.imwrite("../output/12_perspective.jpg", warped)

cv2.imshow("Original", img)
cv2.imshow("Perspective Transformed", warped)
cv2.waitKey(0)
cv2.destroyAllWindows()
