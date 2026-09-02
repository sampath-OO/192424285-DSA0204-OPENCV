"""
Generate synthetic realistic road photos for highway lanes and intersection stop sign.
"""
import cv2
import numpy as np

def generate_highway_sample():
    w, h = 960, 540
    img = np.zeros((h, w, 3), dtype=np.uint8)
    # Sky with gradient
    for y in range(int(h * 0.45)):
        b = int(240 - y * 0.1)
        g = int(210 - y * 0.1)
        r = int(170 - y * 0.1)
        img[y, :] = (b, g, r)
    
    # Distant mountains/trees
    cv2.rectangle(img, (0, int(h * 0.4)), (w, int(h * 0.45)), (80, 110, 80), -1)
    
    # Asphalt road
    cv2.rectangle(img, (0, int(h * 0.45)), (w, h), (60, 60, 65), -1)
    
    # Grass shoulders
    pts_left_grass = np.array([[0, int(h * 0.45)], [180, int(h * 0.45)], [0, h]], np.int32)
    pts_right_grass = np.array([[w, int(h * 0.45)], [w - 180, int(h * 0.45)], [w, h]], np.int32)
    cv2.fillPoly(img, [pts_left_grass], (50, 100, 60))
    cv2.fillPoly(img, [pts_right_grass], (50, 100, 60))
    
    # Solid outer white lane lines
    cv2.line(img, (260, int(h * 0.45)), (80, h), (240, 240, 245), 6)
    cv2.line(img, (700, int(h * 0.45)), (880, h), (240, 240, 245), 6)
    
    # Dashed center white lane lines
    dashes = [
        ((480, int(h * 0.46)), (480, int(h * 0.49))),
        ((480, int(h * 0.52)), (480, int(h * 0.57))),
        ((480, int(h * 0.61)), (480, int(h * 0.68))),
        ((480, int(h * 0.73)), (480, int(h * 0.83))),
        ((480, int(h * 0.88)), (480, h))
    ]
    for p1, p2 in dashes:
        cv2.line(img, p1, p2, (245, 245, 245), 5)
        
    # Draw a Speed Limit 60 sign on the right shoulder
    # Post
    cv2.line(img, (830, int(h * 0.38)), (830, int(h * 0.55)), (120, 120, 120), 4)
    # Circle sign (White circle with red border)
    cv2.circle(img, (830, int(h * 0.38)), 32, (30, 30, 220), -1) # Red border
    cv2.circle(img, (830, int(h * 0.38)), 26, (245, 245, 245), -1) # White inner
    cv2.putText(img, "60", (812, int(h * 0.40)), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (20, 20, 20), 2)
    
    cv2.imwrite("static/samples/sample3_highway_lanes.jpg", img)
    print("Saved sample3_highway_lanes.jpg")

def generate_intersection_stop_sample():
    w, h = 960, 540
    img = np.zeros((h, w, 3), dtype=np.uint8)
    # Sky
    img[:int(h * 0.45)] = (230, 210, 185)
    # Background urban buildings
    cv2.rectangle(img, (0, int(h * 0.25)), (300, int(h * 0.45)), (160, 150, 140), -1)
    cv2.rectangle(img, (320, int(h * 0.18)), (640, int(h * 0.45)), (140, 140, 150), -1)
    cv2.rectangle(img, (660, int(h * 0.22)), (960, int(h * 0.45)), (150, 160, 160), -1)
    
    # Asphalt road
    cv2.rectangle(img, (0, int(h * 0.45)), (w, h), (65, 65, 70), -1)
    
    # Intersection Stop Line (thick white line across lane)
    cv2.line(img, (200, int(h * 0.78)), (760, int(h * 0.78)), (245, 245, 245), 10)
    cv2.putText(img, "STOP", (420, int(h * 0.86)), cv2.FONT_HERSHEY_SIMPLEX, 1.2, (240, 240, 240), 3)
    
    # Lane divider
    cv2.line(img, (480, int(h * 0.45)), (480, int(h * 0.78)), (30, 210, 240), 5)
    
    # Side curb
    cv2.line(img, (220, int(h * 0.45)), (60, h), (230, 230, 230), 4)
    cv2.line(img, (740, int(h * 0.45)), (900, h), (230, 230, 230), 4)
    
    # Red Octagonal Stop Sign on the right
    post_x = 820
    cv2.line(img, (post_x, int(h * 0.32)), (post_x, int(h * 0.58)), (110, 110, 110), 4)
    # Octagon points
    r = 38
    cx, cy = post_x, int(h * 0.32)
    angles = np.linspace(np.pi/8, 2*np.pi + np.pi/8, 9)[:-1]
    oct_pts = np.array([[int(cx + r * np.cos(a)), int(cy + r * np.sin(a))] for a in angles], np.int32)
    cv2.fillPoly(img, [oct_pts], (20, 20, 210))
    # Inner border
    r_inner = 34
    oct_inner = np.array([[int(cx + r_inner * np.cos(a)), int(cy + r_inner * np.sin(a))] for a in angles], np.int32)
    cv2.polylines(img, [oct_inner], isClosed=True, color=(245, 245, 245), thickness=2)
    cv2.putText(img, "STOP", (cx - 24, cy + 6), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (255, 255, 255), 2)
    
    cv2.imwrite("static/samples/sample4_stop_junction.jpg", img)
    print("Saved sample4_stop_junction.jpg")

generate_highway_sample()
generate_intersection_stop_sample()
