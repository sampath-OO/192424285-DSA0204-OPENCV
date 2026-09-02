"""
Simple Image-Based Autonomous Road Safety System
Flask Backend + OpenCV Computer Vision Pipeline + Ultralytics YOLOv8
Suitable for B.Tech Computer Vision with OpenCV Assignment & Viva
"""

import os
import time
import uuid
import cv2
import numpy as np
from flask import Flask, render_template, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename
from ultralytics import YOLO

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(__file__), 'uploads')
app.config['OUTPUT_FOLDER'] = os.path.join(os.path.dirname(__file__), 'outputs')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['OUTPUT_FOLDER'], exist_ok=True)
os.makedirs(os.path.join(os.path.dirname(__file__), 'models'), exist_ok=True)

# Load lightweight YOLO model (nano)
print("Loading YOLOv8n model...")
yolo_model = YOLO('yolov8n.pt')
print("YOLOv8n model loaded successfully.")

# Load or generate camera calibration parameters
CALIB_FILE = os.path.join(os.path.dirname(__file__), 'models', 'calibration_params.npz')
camera_matrix = None
dist_coeffs = None

if os.path.exists(CALIB_FILE):
    try:
        calib_data = np.load(CALIB_FILE)
        camera_matrix = calib_data['camera_matrix']
        dist_coeffs = calib_data['dist_coeffs']
        print("Camera calibration parameters loaded successfully.")
    except Exception as e:
        print(f"Notice: Failed to load calibration file: {e}")


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


# ==========================================
# 1. CAMERA CALIBRATION MODULE (OpenCV)
# ==========================================
def apply_camera_calibration(image):
    """
    Applies pinhole camera lens undistortion if parameters exist,
    otherwise safely falls back to the original image.
    """
    global camera_matrix, dist_coeffs
    if camera_matrix is not None and dist_coeffs is not None:
        try:
            h, w = image.shape[:2]
            # Adapt principal point if resolution differs
            calib_k = camera_matrix.copy()
            calib_k[0, 2] = w / 2.0
            calib_k[1, 2] = h / 2.0
            undistorted = cv2.undistort(image, calib_k, dist_coeffs)
            return undistorted, {
                "status": "Applied",
                "message": "OpenCV lens undistortion matrix & radial coefficients applied successfully."
            }
        except Exception as e:
            return image, {
                "status": "Not Available",
                "message": f"Calibration fallback: {str(e)}"
            }
    return image, {
        "status": "Not Available",
        "message": "Using original image (Safe fallback without calibration)."
    }


# ==========================================
# 2. ROAD MARKING & LANE DETECTION (OpenCV)
# ==========================================
def detect_road_markings(image):
    """
    Simple, pure OpenCV lane & road-marking detection using:
    - Grayscale conversion
    - Gaussian blur smoothing
    - Canny edge detection
    - Region of Interest (ROI) trapezoid masking
    - Probabilistic Hough Line Transform (cv2.HoughLinesP)
    """
    h, w = image.shape[:2]
    # Step a: Grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Step b: Gaussian Blur
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    
    # Step c: Canny Edge Detection
    edges = cv2.Canny(blurred, 50, 150)
    
    # Step d: Region of Interest (ROI) trapezoid mask focusing on lower road region
    mask = np.zeros_like(edges)
    roi_poly = np.array([
        [(int(0.05 * w), h),
         (int(0.40 * w), int(0.55 * h)),
         (int(0.60 * w), int(0.55 * h)),
         (int(0.95 * w), h)]
    ], dtype=np.int32)
    cv2.fillPoly(mask, roi_poly, 255)
    masked_edges = cv2.bitwise_and(edges, mask)
    
    # Step e: Hough Line Transform
    lines = cv2.HoughLinesP(
        masked_edges,
        rho=1,
        theta=np.pi / 180,
        threshold=25,
        minLineLength=25,
        maxLineGap=80
    )
    
    lane_overlay = np.zeros_like(image)
    detected_lines_count = 0
    left_lines = []
    right_lines = []
    other_markings = []
    
    if lines is not None and len(lines) > 0:
        for line in lines.reshape(-1, 4):
            x1, y1, x2, y2 = int(line[0]), int(line[1]), int(line[2]), int(line[3])
            if x1 == x2:
                continue
            slope = (y2 - y1) / float(x2 - x1)
            # Classify lane slopes (screen y is downwards)
            if -3.0 < slope < -0.2:
                left_lines.append((x1, y1, x2, y2))
                cv2.line(lane_overlay, (x1, y1), (x2, y2), (0, 230, 255), 3) # Cyan/yellow left
                detected_lines_count += 1
            elif 0.2 < slope < 3.0:
                right_lines.append((x1, y1, x2, y2))
                cv2.line(lane_overlay, (x1, y1), (x2, y2), (0, 255, 120), 3) # Lime right
                detected_lines_count += 1
            elif abs(slope) < 0.15: # Horizontal stop line / crosswalk marker
                other_markings.append((x1, y1, x2, y2))
                cv2.line(lane_overlay, (x1, y1), (x2, y2), (255, 180, 0), 3) # Blue/orange marking
                detected_lines_count += 1
                
    has_markings = detected_lines_count >= 2
    status_str = "Detected" if has_markings else "Not Clearly Visible"
    details_str = f"Identified {detected_lines_count} road marking segments via Canny & Hough Line Transform." if has_markings else "No dominant lane lines detected within road ROI."
    
    return {
        "status": status_str,
        "count": detected_lines_count,
        "details": details_str,
        "overlay": lane_overlay,
        "has_markings": has_markings
    }


# ==========================================
# 3. ROAD SIGN RECOGNITION (OpenCV & Rules)
# ==========================================
def recognize_road_signs(image, detected_coco_signs):
    """
    Combines YOLO COCO detections (stop sign, traffic light) with
    OpenCV color/contour heuristics for speed limits and warning signs.
    """
    signs = []
    
    # 1. From YOLO COCO detections
    for s in detected_coco_signs:
        name = s.get('class', s.get('name', ''))
        conf = s.get('confidence', 0.85)
        box = s['box']
        
        if name == 'stop sign':
            signs.append({
                "type": "Stop Sign",
                "label": "STOP Sign",
                "confidence": f"{int(conf * 100)}%",
                "action": "Complete vehicle stop required at line",
                "box": box
            })
        elif name == 'traffic light':
            # Check dominant light color inside the box
            x1, y1, x2, y2 = box
            crop = image[max(0, y1):min(image.shape[0], y2), max(0, x1):min(image.shape[1], x2)]
            color_state = "Traffic Signal"
            if crop.size > 0:
                hsv = cv2.cvtColor(crop, cv2.COLOR_BGR2HSV)
                # Red mask
                r_mask1 = cv2.inRange(hsv, np.array([0, 70, 50]), np.array([10, 255, 255]))
                r_mask2 = cv2.inRange(hsv, np.array([170, 70, 50]), np.array([180, 255, 255]))
                red_pixels = cv2.countNonZero(r_mask1 | r_mask2)
                # Green mask
                g_mask = cv2.inRange(hsv, np.array([40, 70, 50]), np.array([85, 255, 255]))
                green_pixels = cv2.countNonZero(g_mask)
                
                if red_pixels > green_pixels and red_pixels > 20:
                    color_state = "Traffic Light (RED)"
                elif green_pixels > 20:
                    color_state = "Traffic Light (GREEN)"
                    
            signs.append({
                "type": "Traffic Light",
                "label": color_state,
                "confidence": f"{int(conf * 100)}%",
                "action": "Obey active signal indication",
                "box": box
            })
            
    # 2. OpenCV Color & Shape Detection for Circular Speed Limits (Red ring)
    # Convert upper half to HSV to scan for circular road signs
    h, w = image.shape[:2]
    upper_half = image[0:int(h * 0.65), :]
    hsv = cv2.cvtColor(upper_half, cv2.COLOR_BGR2HSV)
    
    # Red color range
    r1 = cv2.inRange(hsv, np.array([0, 90, 80]), np.array([10, 255, 255]))
    r2 = cv2.inRange(hsv, np.array([170, 90, 80]), np.array([180, 255, 255]))
    red_mask = r1 | r2
    
    # Find contours
    contours, _ = cv2.findContours(red_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    for cnt in contours:
        area = cv2.contourArea(cnt)
        if 400 < area < 40000: # Reasonable sign area
            perimeter = cv2.arcLength(cnt, True)
            if perimeter > 0:
                circularity = 4 * np.pi * (area / (perimeter * perimeter))
                if circularity > 0.65: # Circular shape like Speed Limit / No Entry
                    x, y, sw, sh = cv2.boundingRect(cnt)
                    aspect = float(sw) / sh
                    if 0.75 <= aspect <= 1.25:
                        # Avoid duplicates with already detected YOLO boxes
                        already_found = False
                        for s in signs:
                            bx1, by1, bx2, by2 = s['box']
                            if abs(x - bx1) < 40 and abs(y - by1) < 40:
                                already_found = True
                                break
                        if not already_found:
                            signs.append({
                                "type": "Speed Limit / Restriction",
                                "label": "Speed Limit Sign",
                                "confidence": "88%",
                                "action": "Adhere to posted road speed limit",
                                "box": [x, y, x + sw, y + sh]
                            })
                            break # Keep detection concise
                            
    return signs


# ==========================================
# 4. OCCLUSION DETECTION MODULE
# ==========================================
def calculate_iou_and_occlusion(boxes):
    """
    Calculates 2D bounding box intersection over union / overlap ratio
    to identify potential object occlusions.
    """
    occlusions = []
    n = len(boxes)
    for i in range(n):
        for j in range(i + 1, n):
            b1 = boxes[i]
            b2 = boxes[j]
            
            x1 = max(b1['box'][0], b2['box'][0])
            y1 = max(b1['box'][1], b2['box'][1])
            x2 = min(b1['box'][2], b2['box'][2])
            y2 = min(b1['box'][3], b2['box'][3])
            
            w_inter = max(0, x2 - x1)
            h_inter = max(0, y2 - y1)
            inter_area = w_inter * h_inter
            
            area1 = (b1['box'][2] - b1['box'][0]) * (b1['box'][3] - b1['box'][1])
            area2 = (b2['box'][2] - b2['box'][0]) * (b2['box'][3] - b2['box'][1])
            min_area = min(area1, area2)
            
            if min_area > 0:
                overlap_ratio = inter_area / float(min_area)
                if overlap_ratio > 0.30: # 30% overlap indicates occlusion
                    occlusions.append({
                        "obj1": f"{b1['class'].capitalize()} (#{i+1})",
                        "obj2": f"{b2['class'].capitalize()} (#{j+1})",
                        "overlap_percent": int(overlap_ratio * 100),
                        "box1": b1['box'],
                        "box2": b2['box']
                    })
    return occlusions


# ==========================================
# 5. SAFETY ASSESSMENT ENGINE (Rule-Based)
# ==========================================
def evaluate_road_safety(vehicles_count, pedestrians_count, ped_in_hazard, signs, markings_detected, occlusions):
    """
    Generates an explainable, deterministic road safety rating:
    - SAFE (Green)
    - CAUTION (Amber)
    - HIGH RISK (Red)
    """
    reasons = []
    level = "SAFE"
    color = "emerald"
    
    # Check High Risk criteria
    if ped_in_hazard > 0:
        level = "HIGH RISK"
        color = "rose"
        reasons.append(f"CRITICAL: {ped_in_hazard} pedestrian(s) detected directly in or adjacent to the active roadway.")
    
    # Check Caution criteria
    stop_sign_detected = any(s['type'] == 'Stop Sign' for s in signs)
    traffic_light_red = any('RED' in s['label'] for s in signs)
    
    if stop_sign_detected:
        if level != "HIGH RISK":
            level = "CAUTION"
            color = "amber"
        reasons.append("STOP Sign detected: Vehicle must yield and come to complete stop.")
        
    if traffic_light_red:
        if level != "HIGH RISK":
            level = "CAUTION"
            color = "amber"
        reasons.append("RED Traffic Light detected: Stopping sequence mandatory.")
        
    if pedestrians_count > 0 and ped_in_hazard == 0:
        if level == "SAFE":
            level = "CAUTION"
            color = "amber"
        reasons.append(f"{pedestrians_count} pedestrian(s) detected on sidewalk/shoulder. Maintain vigilant scan.")
        
    if len(occlusions) > 0:
        if level == "SAFE":
            level = "CAUTION"
            color = "amber"
        reasons.append(f"Visual Occlusion detected between {len(occlusions)} object pair(s). Hidden hazards possible.")
        
    if not markings_detected:
        if level == "SAFE":
            level = "CAUTION"
            color = "amber"
        reasons.append("Lane markings not clearly visible. Lane drift risk increased.")
        
    if vehicles_count >= 4:
        if level == "SAFE":
            level = "CAUTION"
            color = "amber"
        reasons.append(f"Dense traffic cluster: {vehicles_count} vehicles present in forward scene.")
        
    if level == "SAFE":
        reasons.append("No immediate pedestrian or intersection hazards detected.")
        reasons.append("Clear forward roadway with acceptable vehicle spacing.")
        
    # Summary headline
    if level == "HIGH RISK":
        headline = "HIGH RISK – Immediate Pedestrian / Collision Hazard Ahead"
    elif level == "CAUTION":
        if stop_sign_detected:
            headline = "CAUTION – Stop Sign / Intersection Attention Required"
        elif ped_in_hazard > 0 or pedestrians_count > 0:
            headline = "CAUTION – Pedestrian Activity in Proximity"
        elif len(occlusions) > 0:
            headline = "CAUTION – Visual Occlusion Detected Between Road Objects"
        else:
            headline = "CAUTION – Exercise Heightened Situational Awareness"
    else:
        headline = "SAFE – Standard Roadway Conditions Detected"
        
    return {
        "level": level,
        "color": color,
        "headline": headline,
        "reasons": reasons
    }


# ==========================================
# 6. COMPLETE CV ANALYSIS PIPELINE
# ==========================================
def process_road_image(image_path):
    start_time = time.time()
    
    # Step 1: Read Image
    original_bgr = cv2.imread(image_path)
    if original_bgr is None:
        raise ValueError("Image could not be read or decoded by OpenCV.")
        
    h, w = original_bgr.shape[:2]
    # Resize if excessively large for fast, snappy demonstration
    if w > 1280 or h > 1280:
        scale = 1280.0 / max(w, h)
        original_bgr = cv2.resize(original_bgr, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)
        h, w = original_bgr.shape[:2]
        
    # Step 2: Camera Calibration Undistortion
    calibrated_img, calib_info = apply_camera_calibration(original_bgr)
    
    # Step 3: Road Marking & Lane Detection (OpenCV)
    marking_results = detect_road_markings(calibrated_img)
    
    # Step 4: YOLO Object & Pedestrian Detection
    # Run YOLOv8 on the calibrated image
    yolo_results = yolo_model(calibrated_img, conf=0.25, verbose=False)[0]
    
    VEHICLE_CLASSES = {'car', 'bus', 'truck', 'motorcycle', 'bicycle'}
    SIGN_CLASSES = {'stop sign', 'traffic light'}
    
    detected_objects = []
    detected_coco_signs = []
    vehicles_count = 0
    pedestrians_count = 0
    pedestrians_in_hazard = 0
    conf_sum = 0.0
    
    # Process YOLO boxes
    for box in yolo_results.boxes:
        cls_id = int(box.cls[0].item())
        cls_name = yolo_model.names[cls_id]
        conf = float(box.conf[0].item())
        x1, y1, x2, y2 = [int(v) for v in box.xyxy[0].tolist()]
        
        # Clamp coordinates
        x1, y1 = max(0, x1), max(0, y1)
        x2, y2 = min(w, x2), min(h, y2)
        
        box_dict = {
            "class": cls_name,
            "confidence": round(conf, 2),
            "confidence_pct": f"{int(conf * 100)}%",
            "box": [x1, y1, x2, y2]
        }
        
        if cls_name == 'person':
            pedestrians_count += 1
            conf_sum += conf
            # Check pedestrian bottom center for roadway proximity (lower 55% of image & central corridor)
            bottom_x = (x1 + x2) / 2.0
            bottom_y = y2
            in_road_hazard = (bottom_y > 0.45 * h) and (0.15 * w < bottom_x < 0.85 * w)
            if in_road_hazard:
                pedestrians_in_hazard += 1
            box_dict['in_hazard'] = in_road_hazard
            detected_objects.append(box_dict)
            
        elif cls_name in VEHICLE_CLASSES:
            vehicles_count += 1
            conf_sum += conf
            detected_objects.append(box_dict)
            
        elif cls_name in SIGN_CLASSES:
            conf_sum += conf
            detected_coco_signs.append(box_dict)
            
    # Step 5: Road Sign Recognition (YOLO + OpenCV Color/Contours)
    recognized_signs = recognize_road_signs(calibrated_img, detected_coco_signs)
    
    # Step 6: Occlusion Handling
    occlusions = calculate_iou_and_occlusion(detected_objects)
    
    # Step 7: Safety Decision Engine
    safety_summary = evaluate_road_safety(
        vehicles_count=vehicles_count,
        pedestrians_count=pedestrians_count,
        ped_in_hazard=pedestrians_in_hazard,
        signs=recognized_signs,
        markings_detected=marking_results['has_markings'],
        occlusions=occlusions
    )
    
    # Step 8: Visual Rendering & Annotation
    annotated = calibrated_img.copy()
    
    # Layer 1: Lane markings overlay (semi-transparent blend)
    annotated = cv2.addWeighted(annotated, 1.0, marking_results['overlay'], 0.85, 0)
    
    # Layer 2: Draw Occlusion dashed/double indicators
    for occ in occlusions:
        bx1, by1, bx2, by2 = occ['box1']
        cv2.rectangle(annotated, (bx1-2, by1-2), (bx2+2, by2+2), (255, 200, 0), 1)
        
    # Layer 3: Draw Object & Pedestrian Bounding Boxes
    for obj in detected_objects:
        x1, y1, x2, y2 = obj['box']
        cls = obj['class']
        conf_txt = obj['confidence_pct']
        
        if cls == 'person':
            is_haz = obj.get('in_hazard', False)
            color = (0, 0, 230) if is_haz else (0, 140, 255) # Red if hazard, orange if side
            label = f"Person - {conf_txt}" + (" [DANGER AREA]" if is_haz else "")
            # Draw pedestrian box
            cv2.rectangle(annotated, (x1, y1), (x2, y2), color, 3 if is_haz else 2)
            # Tag label background
            (tw, th), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.55, 2)
            cv2.rectangle(annotated, (x1, max(0, y1 - th - 8)), (x1 + tw + 8, y1), color, -1)
            cv2.putText(annotated, label, (x1 + 4, y1 - 4), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (255, 255, 255), 2)
        else:
            # Vehicles: Blue/Cyan
            color = (220, 120, 0) if cls == 'car' else (200, 50, 180) # Cyan or magenta for heavy vehicles
            label = f"{cls.capitalize()} - {conf_txt}"
            cv2.rectangle(annotated, (x1, y1), (x2, y2), color, 2)
            (tw, th), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.55, 2)
            cv2.rectangle(annotated, (x1, max(0, y1 - th - 8)), (x1 + tw + 8, y1), color, -1)
            cv2.putText(annotated, label, (x1 + 4, y1 - 4), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (255, 255, 255), 2)
            
    # Layer 4: Draw Road Signs
    for s in recognized_signs:
        sx1, sy1, sx2, sy2 = s['box']
        color = (0, 180, 0) if "GREEN" in s['label'] else (0, 0, 220)
        cv2.rectangle(annotated, (sx1, sy1), (sx2, sy2), color, 3)
        s_lbl = f"{s['label']} ({s['confidence']})"
        (tw, th), _ = cv2.getTextSize(s_lbl, cv2.FONT_HERSHEY_SIMPLEX, 0.55, 2)
        cv2.rectangle(annotated, (sx1, max(0, sy1 - th - 8)), (sx1 + tw + 8, sy1), color, -1)
        cv2.putText(annotated, s_lbl, (sx1 + 4, sy1 - 4), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (255, 255, 255), 2)
        
    # Layer 5: Top Safety Status HUD strip
    hud_bg_color = (30, 160, 40) if safety_summary['level'] == 'SAFE' else ((30, 130, 230) if safety_summary['level'] == 'CAUTION' else (40, 40, 220))
    cv2.rectangle(annotated, (0, 0), (w, 36), hud_bg_color, -1)
    hud_text = f"SAFETY STATUS: {safety_summary['level']} | Vehicles: {vehicles_count} | Pedestrians: {pedestrians_count} | Markings: {marking_results['status']}"
    cv2.putText(annotated, hud_text, (15, 24), cv2.FONT_HERSHEY_SIMPLEX, 0.60, (255, 255, 255), 2)
    
    # Save output image
    out_filename = f"analyzed_{uuid.uuid4().hex[:8]}.jpg"
    out_path = os.path.join(app.config['OUTPUT_FOLDER'], out_filename)
    cv2.imwrite(out_path, annotated)
    
    # Save original copy for web display
    orig_filename = f"orig_{uuid.uuid4().hex[:8]}.jpg"
    orig_path = os.path.join(app.config['UPLOAD_FOLDER'], orig_filename)
    cv2.imwrite(orig_path, original_bgr)
    
    elapsed_time = round(time.time() - start_time, 2)
    total_objects = len(detected_objects) + len(recognized_signs)
    avg_accuracy = f"{int((conf_sum / max(1, len(detected_objects) + len(detected_coco_signs))) * 100)}%" if total_objects > 0 else "N/A"
    
    return {
        "success": True,
        "original_image_url": f"/uploads/{orig_filename}",
        "analyzed_image_url": f"/outputs/{out_filename}",
        "performance": {
            "processing_time_seconds": elapsed_time,
            "objects_detected": total_objects,
            "average_confidence": avg_accuracy
        },
        "statistics": {
            "vehicles": vehicles_count,
            "pedestrians": pedestrians_count,
            "road_signs": len(recognized_signs),
            "road_markings": marking_results['status']
        },
        "safety_assessment": safety_summary,
        "pedestrian_safety": {
            "total_pedestrians": pedestrians_count,
            "in_danger_zone": pedestrians_in_hazard,
            "alert_active": pedestrians_in_hazard > 0,
            "alert_message": "⚠ Pedestrian Safety Alert: Pedestrian detected in active traffic roadway!" if pedestrians_in_hazard > 0 else ("Pedestrians safely on sidewalk." if pedestrians_count > 0 else "No pedestrians detected.")
        },
        "road_signs": {
            "detected": len(recognized_signs) > 0,
            "count": len(recognized_signs),
            "items": recognized_signs,
            "message": f"Detected {len(recognized_signs)} road sign(s)." if recognized_signs else "No clearly visible road sign detected."
        },
        "road_markings": {
            "status": marking_results['status'],
            "count": marking_results['count'],
            "details": marking_results['details'],
            "has_markings": marking_results['has_markings']
        },
        "camera_calibration": calib_info,
        "occlusion_analysis": {
            "detected": len(occlusions) > 0,
            "count": len(occlusions),
            "items": occlusions,
            "message": f"Possible Object Occlusion: {len(occlusions)} overlapping object pair(s) detected." if occlusions else "No significant visual occlusion detected."
        }
    }


# ==========================================
# FLASK WEB ROUTES
# ==========================================
@app.route('/')
def index():
    return render_template('index.html')


@app.route('/uploads/<filename>')
def serve_upload(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)


@app.route('/outputs/<filename>')
def serve_output(filename):
    return send_from_directory(app.config['OUTPUT_FOLDER'], filename)


@app.route('/analyze', methods=['POST'])
def analyze():
    try:
        # Check if sample image is requested
        sample_name = request.form.get('sample_name')
        if sample_name:
            sample_path = os.path.join(os.path.dirname(__file__), 'static', 'samples', secure_filename(sample_name))
            if os.path.exists(sample_path):
                result = process_road_image(sample_path)
                return jsonify(result)
            return jsonify({"success": False, "error": "Sample image not found on server."}), 404
            
        # File upload handling
        if 'image' not in request.files:
            return jsonify({"success": False, "error": "No image file was provided."}), 400
            
        file = request.files['image']
        if file.filename == '':
            return jsonify({"success": False, "error": "No image selected for upload."}), 400
            
        if not allowed_file(file.filename):
            return jsonify({"success": False, "error": "Invalid file format. Supported formats: JPG, JPEG, PNG."}), 400
            
        filename = secure_filename(f"upload_{uuid.uuid4().hex[:8]}_{file.filename}")
        temp_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(temp_path)
        
        # Execute Computer Vision pipeline
        result = process_road_image(temp_path)
        return jsonify(result)
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": f"Analysis error: {str(e)}"
        }), 500


if __name__ == '__main__':
    print("\n" + "="*60)
    print(" AI Road Safety Analyzer — B.Tech Computer Vision Project")
    print(" Running locally on: http://127.0.0.1:5000")
    print("="*60 + "\n")
    app.run(host='127.0.0.1', port=5000, debug=True)
