"""
Experiment 22: Perform Sharpening of Image using Laplacian mask with positive center coefficient.
g(x,y) = 5f(x,y) - [f(x+1,y)+f(x-1,y)+f(x,y+1)+f(x,y-1)]
Mask:
 0 -1  0
-1  5 -1
 0 -1  0
"""
import cv2
import numpy as np

IMAGE_PATH = "../images/sample.jpg"

img = cv2.imread(IMAGE_PATH)
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

kernel = np.array([[ 0, -1,  0],
                    [-1,  5, -1],
                    [ 0, -1,  0]], dtype=np.float32)

sharpened = cv2.filter2D(gray, -1, kernel)

cv2.imwrite("../output/22_laplacian_positive_center.jpg", sharpened)

cv2.imshow("Original", gray)
cv2.imshow("Sharpened (Laplacian pos. center)", sharpened)
cv2.waitKey(0)
cv2.destroyAllWindows()
