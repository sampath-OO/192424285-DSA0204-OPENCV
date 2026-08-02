"""
Experiment 7: Capture video from web Camera and Display the video, in slow motion and in fast motion.
NOTE: requires a webcam (device index 0). Replace 0 with your camera index if needed.
"""
import cv2

cap = cv2.VideoCapture(0)   # <-- 0 = default webcam

if not cap.isOpened():
    print("Could not open webcam.")
else:
    print("Press 's' for slow motion view, 'f' for fast motion view, 'q' to quit.")
    delay = 30
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        cv2.imshow("Webcam", frame)
        key = cv2.waitKey(delay) & 0xFF
        if key == ord('s'):
            delay = 150   # slow motion
        elif key == ord('f'):
            delay = 5     # fast motion
        elif key == ord('q'):
            break
    cap.release()
cv2.destroyAllWindows()
