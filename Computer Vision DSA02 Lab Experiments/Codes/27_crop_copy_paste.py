"""
Experiment 27: Do Cropping, Copying and pasting image inside another image using OpenCV.
"""
import cv2

IMAGE_PATH = "../images/sample.jpg"    # <-- base ("outer") image
PATCH_PATH = "../images/sample2.jpg"   # <-- image to paste inside the base image

img = cv2.imread(IMAGE_PATH)

# ---- Cropping ----
crop = img[150:350, 200:450]   # y1:y2, x1:x2
cv2.imwrite("../output/27_cropped.jpg", crop)

# ---- Copying a region and pasting elsewhere in the SAME image ----
region = img[0:100, 0:100].copy()
pasted_same = img.copy()
pasted_same[300:400, 500:600] = cv2.resize(region, (100, 100))
cv2.imwrite("../output/27_copy_paste_same_image.jpg", pasted_same)

# ---- Pasting a DIFFERENT image inside the base image ----
patch = cv2.imread(PATCH_PATH)
patch_resized = cv2.resize(patch, (120, 120))
pasted_other = img.copy()
x_off, y_off = 20, 20
pasted_other[y_off:y_off + 120, x_off:x_off + 120] = patch_resized
cv2.imwrite("../output/27_pasted_other_image.jpg", pasted_other)

cv2.imshow("Original", img)
cv2.imshow("Cropped", crop)
cv2.imshow("Copy-Paste (same image)", pasted_same)
cv2.imshow("Pasted (other image)", pasted_other)
cv2.waitKey(0)
cv2.destroyAllWindows()
