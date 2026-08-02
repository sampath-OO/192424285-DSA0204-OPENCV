"""
Experiment 15: Perform transformation using Direct Linear Transformation (DLT).

The Direct Linear Transformation algorithm solves for the homography matrix H
(the same matrix used in perspective transformation) directly from >=4 point
correspondences by setting up and solving A.h = 0 using SVD -- this is exactly
what cv2.findHomography does internally (method=0). Here we implement DLT
manually to show the underlying math, then apply it with warpPerspective.
"""
import cv2
import numpy as np

IMAGE_PATH = "../images/sample.jpg"


def compute_homography_dlt(src_pts, dst_pts):
    A = []
    for (x, y), (xp, yp) in zip(src_pts, dst_pts):
        A.append([-x, -y, -1, 0, 0, 0, x * xp, y * xp, xp])
        A.append([0, 0, 0, -x, -y, -1, x * yp, y * yp, yp])
    A = np.array(A)
    # Solve using SVD: the solution is the eigenvector with smallest singular value
    _, _, Vt = np.linalg.svd(A)
    H = Vt[-1].reshape(3, 3)
    return H / H[2, 2]


img = cv2.imread(IMAGE_PATH)
(h, w) = img.shape[:2]

src_pts = [(0, 0), (w - 1, 0), (w - 1, h - 1), (0, h - 1)]
dst_pts = [(20, 10), (w - 10, 30), (w - 30, h - 10), (10, h - 30)]

H = compute_homography_dlt(src_pts, dst_pts)
result = cv2.warpPerspective(img, H, (w, h))

cv2.imwrite("../output/15_dlt.jpg", result)

cv2.imshow("Original", img)
cv2.imshow("DLT Result", result)
cv2.waitKey(0)
cv2.destroyAllWindows()
