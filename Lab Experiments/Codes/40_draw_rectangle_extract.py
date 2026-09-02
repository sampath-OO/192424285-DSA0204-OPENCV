"""
Experiment 40: Draw Rectangular shape and extract objects.
Detects distinct objects (via contours) in the image, draws bounding rectangles
around them, and extracts (crops) each detected object into a separate file.
"""
import cv2
import os

IMAGE_PATH = "../images/sample.jpg"   # <-- location of the input image

img = cv2.imread(IMAGE_PATH)
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
blurred = cv2.GaussianBlur(gray, (5, 5), 0)
edges = cv2.Canny(blurred, 50, 150)
edges = cv2.dilate(edges, None, iterations=1)

contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

result = img.copy()
os.makedirs("../output/40_extracted_objects", exist_ok=True)

count = 0
for i, cnt in enumerate(contours):
    x, y, w, h = cv2.boundingRect(cnt)
    if w * h < 500:          # ignore tiny noise contours
        continue
    cv2.rectangle(result, (x, y), (x + w, y + h), (0, 255, 0), 2)
    extracted = img[y:y + h, x:x + w]
    cv2.imwrite(f"../output/40_extracted_objects/object_{count}.jpg", extracted)
    count += 1

print(f"Objects detected and extracted: {count}")

cv2.imwrite("../output/40_rectangles_drawn.jpg", result)

cv2.imshow("Original", img)
cv2.imshow("Rectangles Drawn", result)
cv2.waitKey(0)
cv2.destroyAllWindows()
