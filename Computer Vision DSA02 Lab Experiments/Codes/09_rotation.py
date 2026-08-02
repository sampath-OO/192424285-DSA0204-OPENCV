"""
Experiment 9: Perform Rotation of an image to clockwise and counter clockwise direction.
"""
import cv2

IMAGE_PATH = "../images/sample.jpg"

img = cv2.imread(IMAGE_PATH)
(h, w) = img.shape[:2]
center = (w // 2, h // 2)

# clockwise (negative angle in OpenCV's convention rotates clockwise)
M_cw = cv2.getRotationMatrix2D(center, -45, 1.0)
clockwise = cv2.warpAffine(img, M_cw, (w, h))

# counter-clockwise
M_ccw = cv2.getRotationMatrix2D(center, 45, 1.0)
counter_clockwise = cv2.warpAffine(img, M_ccw, (w, h))

cv2.imwrite("../output/09_clockwise.jpg", clockwise)
cv2.imwrite("../output/09_counter_clockwise.jpg", counter_clockwise)

cv2.imshow("Original", img)
cv2.imshow("Clockwise", clockwise)
cv2.imshow("Counter Clockwise", counter_clockwise)
cv2.waitKey(0)
cv2.destroyAllWindows()
