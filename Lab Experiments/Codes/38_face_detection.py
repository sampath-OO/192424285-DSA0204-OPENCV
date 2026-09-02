"""
Experiment 38: Face Detection using OpenCV.
Uses OpenCV's built-in Haar Cascade classifier (shipped with the cv2 package).
"""
import cv2

IMAGE_PATH = "../images/sample_face.jpg"   # <-- location of the input image

face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml")

img = cv2.imread(IMAGE_PATH)
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))

result = img.copy()
for (x, y, w, h) in faces:
    cv2.rectangle(result, (x, y), (x + w, y + h), (0, 255, 0), 2)

print(f"Faces detected: {len(faces)}")
# NOTE: the synthetic cartoon face bundled with this lab may not always be picked up
# by the Haar cascade (which is trained on real photographs). Run this script on a
# real photograph with a visible face (e.g. images/sample_face.jpg replaced with a photo)
# for a reliable detection.

cv2.imwrite("../output/38_face_detected.jpg", result)

cv2.imshow("Original", img)
cv2.imshow("Face Detection", result)
cv2.waitKey(0)
cv2.destroyAllWindows()
