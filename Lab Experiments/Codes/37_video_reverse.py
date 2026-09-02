"""
Experiment 37: Using OpenCV play Video in Reverse mode.
"""
import cv2

VIDEO_PATH = "../images/sample_video.mp4"   # <-- location of the input video

cap = cv2.VideoCapture(VIDEO_PATH)
frames = []
while True:
    ret, frame = cap.read()
    if not ret:
        break
    frames.append(frame)
cap.release()

print(f"Read {len(frames)} frames. Playing in reverse...")

# Save the reversed video
if frames:
    h, w = frames[0].shape[:2]
    out = cv2.VideoWriter("../output/37_reversed_video.mp4",
                           cv2.VideoWriter_fourcc(*'mp4v'), 20.0, (w, h))
    for frame in reversed(frames):
        out.write(frame)
        cv2.imshow("Reversed Video", frame)
        if cv2.waitKey(30) & 0xFF == ord('q'):
            break
    out.release()

cv2.destroyAllWindows()
