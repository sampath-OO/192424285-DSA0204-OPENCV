"""
Experiment 23: Perform Sharpening of Image using unsharp masking.
sharpened image = original image - blurred image (added back to enhance edges)
fs(x,y) = f(x,y) - f_bar(x,y)
"""
import cv2
import numpy as np

IMAGE_PATH = "../images/sample.jpg"

img = cv2.imread(IMAGE_PATH)
blurred = cv2.GaussianBlur(img, (9, 9), 10)

mask = cv2.subtract(img, blurred)                 # unsharp mask = original - blurred
sharpened = cv2.addWeighted(img, 1.0, mask, 1.0, 0)  # add mask back to original

cv2.imwrite("../output/23_unsharp_mask.jpg", mask)
cv2.imwrite("../output/23_unsharp_masking_result.jpg", sharpened)

cv2.imshow("Original", img)
cv2.imshow("Unsharp Mask", mask)
cv2.imshow("Sharpened", sharpened)
cv2.waitKey(0)
cv2.destroyAllWindows()
