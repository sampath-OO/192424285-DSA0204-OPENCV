"""
Experiment 36: Recognise watch from the given image by general Object recognition using OpenCV.

Approach: A watch face is essentially circular, so we use Hough Circle Transform
(a classic general-purpose OpenCV shape/object recognition technique) to detect
the circular watch shape and mark it.
"""
import cv2
import numpy as np

IMAGE_PATH = "../images/sample_watch.jpg"   # <-- location of the input image

img = cv2.imread(IMAGE_PATH)
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
gray_blur = cv2.medianBlur(gray, 5)

circles = cv2.HoughCircles(gray_blur, cv2.HOUGH_GRADIENT, dp=1, minDist=100,
                            param1=100, param2=40, minRadius=50, maxRadius=150)

result = img.copy()
if circles is not None:
    circles = np.uint16(np.around(circles))
    for (x, y, r) in circles[0, :]:
        cv2.circle(result, (x, y), r, (0, 255, 0), 3)          # outer circle -> the watch
        cv2.putText(result, "Watch", (int(x) - 40, int(y) - r - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
        print(f"Watch (circular object) detected at ({x}, {y}) with radius {r}")
else:
    print("No circular object detected.")

cv2.imwrite("../output/36_watch_recognized.jpg", result)

cv2.imshow("Original", img)
cv2.imshow("Recognized Watch", result)
cv2.waitKey(0)
cv2.destroyAllWindows()
