"""
Experiment 28: Find the boundary of the image using Convolution kernel for the given image.
"""
import cv2
import numpy as np

IMAGE_PATH = "../images/sample.jpg"

img = cv2.imread(IMAGE_PATH)
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# boundary/edge extraction kernel (Laplacian-like)
kernel = np.array([[-1, -1, -1],
                    [-1,  8, -1],
                    [-1, -1, -1]], dtype=np.float32)

boundary = cv2.filter2D(gray, -1, kernel)

cv2.imwrite("../output/28_boundary.jpg", boundary)

cv2.imshow("Original", gray)
cv2.imshow("Boundary (Convolution)", boundary)
cv2.waitKey(0)
cv2.destroyAllWindows()
