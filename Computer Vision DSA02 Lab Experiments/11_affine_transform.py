"""
Experiment 11: Perform Affine Transformation on the image.
"""
import cv2
import numpy as np

IMAGE_PATH = "../images/sample.jpg"

img = cv2.imread(IMAGE_PATH)
(h, w) = img.shape[:2]

src_pts = np.float32([[50, 50], [200, 50], [50, 200]])
dst_pts = np.float32([[10, 100], [200, 50], [100, 250]])

M = cv2.getAffineTransform(src_pts, dst_pts)
affine = cv2.warpAffine(img, M, (w, h))

cv2.imwrite("../output/11_affine.jpg", affine)

cv2.imshow("Original", img)
cv2.imshow("Affine Transformed", affine)
cv2.waitKey(0)
cv2.destroyAllWindows()
