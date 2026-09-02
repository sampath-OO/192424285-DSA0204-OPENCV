"""
Experiment 13: Perform Perspective Transformation on the Video.
"""
import cv2
import numpy as np

VIDEO_PATH = "../images/sample_video.mp4"   # <-- location of the input video

cap = cv2.VideoCapture(VIDEO_PATH)
ret, frame = cap.read()
if ret:
    h, w = frame.shape[:2]
    src_pts = np.float32([[0, 0], [w - 1, 0], [0, h - 1], [w - 1, h - 1]])
    dst_pts = np.float32([[0, 0], [w - 1, 0], [int(0.2 * w), h - 1], [int(0.8 * w), h - 1]])
    M = cv2.getPerspectiveTransform(src_pts, dst_pts)

    out = cv2.VideoWriter("../output/13_perspective_video.mp4",
                           cv2.VideoWriter_fourcc(*'mp4v'), 20.0, (w, h))
    cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        warped = cv2.warpPerspective(frame, M, (w, h))
        out.write(warped)
        cv2.imshow("Perspective Video", warped)
        if cv2.waitKey(30) & 0xFF == ord('q'):
            break
    out.release()

cap.release()
cv2.destroyAllWindows()
