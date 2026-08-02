"""
Experiment 6: Read captured video in python and display the video, in slow motion and in fast motion.
"""
import cv2

VIDEO_PATH = "../images/sample_video.mp4"   # <-- location of the input video

def play_video(path, delay):
    cap = cv2.VideoCapture(path)
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        cv2.imshow("Video", frame)
        if cv2.waitKey(delay) & 0xFF == ord('q'):
            break
    cap.release()

print("Playing in SLOW motion...")
play_video(VIDEO_PATH, delay=100)   # bigger delay -> slower playback

print("Playing in FAST motion...")
play_video(VIDEO_PATH, delay=5)     # smaller delay -> faster playback

cv2.destroyAllWindows()
