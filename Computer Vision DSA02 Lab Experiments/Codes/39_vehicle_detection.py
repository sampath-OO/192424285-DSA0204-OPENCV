"""
Experiment 39: Vehicle Detection in a Video frame using OpenCV.
Uses a pre-trained Haar Cascade classifier for cars (cascades/cars.xml).
"""
import cv2

IMAGE_PATH = "../images/sample_vehicles.jpg"   # <-- image / video frame to test on
CASCADE_PATH = "../cascades/cars.xml"          # <-- pre-trained car Haar cascade

car_cascade = cv2.CascadeClassifier(CASCADE_PATH)

img = cv2.imread(IMAGE_PATH)
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

cars = car_cascade.detectMultiScale(gray, scaleFactor=1.05, minNeighbors=3, minSize=(40, 40))

result = img.copy()
for (x, y, w, h) in cars:
    cv2.rectangle(result, (x, y), (x + w, y + h), (0, 0, 255), 2)
    cv2.putText(result, "Vehicle", (x, y - 8), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)

print(f"Vehicles detected: {len(cars)}")
# NOTE: works best on real road/traffic video frames. To use on a live video, loop
# cv2.VideoCapture() frames through car_cascade.detectMultiScale() the same way.

cv2.imwrite("../output/39_vehicle_detected.jpg", result)

cv2.imshow("Original", img)
cv2.imshow("Vehicle Detection", result)
cv2.waitKey(0)
cv2.destroyAllWindows()
