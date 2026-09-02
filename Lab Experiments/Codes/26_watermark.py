"""
Experiment 26: Insert water marking to the image using OpenCV.
"""
import cv2

IMAGE_PATH = "../images/sample.jpg"   # <-- base image

img = cv2.imread(IMAGE_PATH)
h, w = img.shape[:2]
watermarked = img.copy()

text = "SAMPLE WATERMARK"
font = cv2.FONT_HERSHEY_SIMPLEX
font_scale = 1.0
thickness = 2

(text_w, text_h), _ = cv2.getTextSize(text, font, font_scale, thickness)
position = (w - text_w - 20, h - 20)   # bottom-right corner

overlay = watermarked.copy()
cv2.putText(overlay, text, position, font, font_scale, (255, 255, 255), thickness, cv2.LINE_AA)
alpha = 0.5   # transparency of the watermark
watermarked = cv2.addWeighted(overlay, alpha, watermarked, 1 - alpha, 0)

cv2.imwrite("../output/26_watermarked.jpg", watermarked)

cv2.imshow("Original", img)
cv2.imshow("Watermarked", watermarked)
cv2.waitKey(0)
cv2.destroyAllWindows()
