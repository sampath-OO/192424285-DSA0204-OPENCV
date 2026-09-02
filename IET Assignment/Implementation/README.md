# AI Road Safety Analyzer — Image-Based Computer Vision System

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue?logo=python&logoColor=white)](https://www.python.org/)
[![OpenCV](https://img.shields.io/badge/OpenCV-5.0%2F4.8-5C3EE8?logo=opencv&logoColor=white)](https://opencv.org/)
[![YOLOv8](https://img.shields.io/badge/YOLOv8-Nano-00FFFF?logo=yolo&logoColor=black)](https://docs.ultralytics.com/)
[![Flask](https://img.shields.io/badge/Flask-3.0-000000?logo=flask&logoColor=white)](https://flask.palletsprojects.com/)

> **A simple, clean, beginner-friendly Computer Vision web application for road safety analysis using OpenCV, NumPy, and lightweight YOLOv8. Built for B.Tech Computer Vision with OpenCV coursework and viva demonstration.**

---

## 📌 Project Overview

The **AI Road Safety Analyzer** is a single-image perception system designed for autonomous road safety assessment. The system processes real-world road photographs taken from smartphones or vehicle dashcams, automatically identifying critical road-safety elements and assessing the situational risk level.

### Key Workflow
```
Upload Road Image  ──▶  OpenCV Preprocessing & Calibration  ──▶  Hough Lane Detection  ──▶  YOLOv8 Object Detection  ──▶  Rule-Based Safety Evaluation  ──▶  Visual Results & Summary
```

### Main Highlights
- **100% Image-Based**: Zero live-video/webcam complexity—ideal for deterministic, reliable local execution and assignment evaluation.
- **Clean Academic UI**: Bright, modern white/light layout with zero clutter, spacious side-by-side comparison, and simple navigation (**Road Safety AI | Home | About**).
- **Comprehensive Detection**: Identifies Vehicles (Cars, Buses, Trucks, Bikes), Pedestrians, Road Signs (Stop, Speed Limit, Signals), and Road Markings (Lanes, Crosswalks).
- **Intelligent Safety Engine**: Categorizes situational road hazard into `SAFE`, `CAUTION`, or `HIGH RISK` with plain-English rationale.
- **Occlusion Awareness**: Detects spatial overlap (IoU) between bounding boxes, explaining theoretical foundations for video-based multi-object tracking.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Backend Framework** | Python 3 + Flask | Lightweight REST API and web routing |
| **Computer Vision** | OpenCV (`cv2`) + NumPy | Preprocessing, Camera Undistortion, Canny Edge, ROI masking, Hough Line Transform, HSV color segmentation |
| **Object Detection** | Ultralytics YOLOv8n (Nano) | Lightweight neural detection (~6.2 MB) for vehicles, pedestrians, and road entities |
| **Frontend** | HTML5, Modern CSS3, Vanilla JS | Bright, responsive, single-page interface with drag-and-drop upload and comparison viewer |

---

## 📂 Project Structure

```
Implementation/
├── app.py                     # Main Flask application & complete CV pipeline
├── requirements.txt           # Python dependency specifications
├── run.bat                    # 1-Click Windows batch execution script
├── test_pipeline.py           # Automated test suite for all CV modules
├── generate_assets.py         # Generates camera calibration matrix & test samples
├── models/
│   ├── calibration_params.npz # Pinhole intrinsic matrix K and distortion coefficients D
│   └── yolov8n.pt             # Lightweight YOLOv8 nano model weights
├── static/
│   ├── style.css              # Clean, bright styling (light palette, soft shadows)
│   ├── script.js              # Upload, preview, API calls, dynamic result rendering
│   └── samples/               # Pre-bundled real-life sample road images for instant testing
│       ├── sample1_urban_traffic.jpg
│       ├── sample2_pedestrians.jpg
│       ├── sample3_highway_lanes.jpg
│       ├── sample4_stop_junction.jpg
│       └── sample5_multiclass_traffic.jpg
├── templates/
│   └── index.html             # Clean, spacious single-page HTML interface
├── uploads/                   # Stored uploaded original images
└── outputs/                   # Annotated output images with CV overlays
```

---

## 🚀 Quick Start & Installation

### Step 1: Clone or Navigate to Directory
```powershell
cd "c:\Users\sampa\OneDrive\Documents\DSA0204 OpenCV\IET Assignment\Implementation"
```

### Step 2: Install Dependencies
```powershell
pip install -r requirements.txt
```

### Step 3: Run the Application
**Option A (1-Click on Windows):**
Double-click `run.bat` in File Explorer.

**Option B (Command Line):**
```powershell
python app.py
```

### Step 4: Open in Web Browser
Open your browser and navigate to:
```
http://127.0.0.1:5000
```

---

## 🔬 Computer Vision Pipeline Explained (Viva Reference)

### 1. Camera Calibration & Lens Distortion Correction
- **Theory**: Real camera lenses exhibit radial and tangential barrel/pincushion distortion governed by:
  $$x_{\text{corrected}} = x(1 + k_1 r^2 + k_2 r^4), \quad y_{\text{corrected}} = y(1 + k_1 r^2 + k_2 r^4)$$
- **Implementation**: Utilizes `cv2.undistort` with intrinsic matrix $K = \begin{bmatrix} f_x & 0 & c_x \\ 0 & f_y & c_y \\ 0 & 0 & 1 \end{bmatrix}$ and distortion vector $D = [k_1, k_2, p_1, p_2, k_3]$.
- **Safe Fallback**: If calibration data is unavailable, the pipeline smoothly uses the original image without crashing.

### 2. Road Marking & Lane Detection
- **Preprocessing**: Grayscale conversion (`cv2.COLOR_BGR2GRAY`) followed by $5\times 5$ Gaussian smoothing filter to eliminate high-frequency texture noise.
- **Edge Extraction**: Canny Edge Detector (`cv2.Canny`) with dual thresholding ($\text{low}=50, \text{high}=150$) using Sobel gradient operators.
- **Region of Interest (ROI)**: Trapezoidal polygonal mask isolates the lower road surface, suppressing extraneous sky/building edges.
- **Line Fitting**: Probabilistic Hough Line Transform (`cv2.HoughLinesP`). Extracted line segments are filtered by geometric slope $m = \frac{y_2 - y_1}{x_2 - x_1}$:
  - Left Lane: $-3.0 < m < -0.2$ (Cyan overlay)
  - Right Lane: $+0.2 < m < +3.0$ (Lime overlay)
  - Stop / Crosswalk Lines: $|m| < 0.15$ (Orange overlay)

### 3. Object & Pedestrian Detection
- **Architecture**: Single-stage YOLOv8 nano model processing the frame at high efficiency (~150-300ms on standard CPU).
- **Target Classes**:
  - `Vehicles`: `car`, `bus`, `truck`, `motorcycle`, `bicycle`
  - `Vulnerable Road Users (VRUs)`: `person`
  - `Traffic Control`: `stop sign`, `traffic light`
- **Pedestrian Danger Corridor**: Evaluates the foot position $(x_{\text{center}}, y_{\text{bottom}})$ of each pedestrian relative to the road trapezoid. Pedestrians located inside active traffic lanes trigger a high-priority **⚠ Pedestrian Safety Alert**.

### 4. Road Sign Recognition
- **Multimodal Strategy**:
  1. Deep neural classification for standard COCO signs (Stop Sign, Traffic Signals).
  2. OpenCV Color & Geometry Module: Converts upper image region to HSV color space, extracts red circular contours with circularity metric $C = \frac{4\pi A}{P^2} > 0.65$ to detect Speed Limit and Regulatory Signs.
  3. Traffic light dominant color extraction inside bounding box (Red/Green/Yellow state).

### 5. Occlusion Consideration & Multi-Object Tracking
- **Implemented (Image-Level)**: Computes 2D Bounding Box Overlap Ratio / Intersection over Union (IoU). Pairs exceeding 30% overlap trigger a `"Possible Object Occlusion"` advisory.
- **Future Scope (Video Pipelines)**: Multi-object tracking (MOT) utilizing Kalman Filter kinematic state estimation ($\mathbf{x} = [u, v, s, r, \dot{u}, \dot{v}, \dot{s}]^T$) and Hungarian bipartite data association across continuous video streams.

### 6. Deterministic Safety Assessment Engine
A transparent rule-based evaluator assigns one of three statuses:
- 🟢 **SAFE**: Clear road markings, 0 pedestrians in traffic corridor, adequate forward vehicle spacing.
- 🟡 **CAUTION**: Stop sign / yellow light present, pedestrians on sidewalk, road markings indistinct, or dense traffic cluster.
- 🔴 **HIGH RISK**: Pedestrian positioned directly in active vehicular roadway, red traffic signal with oncoming traffic, or heavy vehicle occlusion.

---

## 📊 Sample Output Screenshots & Verification

Run the test suite to verify all modules:
```powershell
python test_pipeline.py
```
**Sample Test Results:**
- `sample1_urban_traffic.jpg`: 1 Bus, 4 Pedestrians, Markings Detected $\rightarrow$ **HIGH RISK (Pedestrians in road)**
- `sample3_highway_lanes.jpg`: Speed Limit Sign, Clear Lane Markings $\rightarrow$ **SAFE**
- `sample4_stop_junction.jpg`: STOP Sign Detected, Stop Line Highlighted $\rightarrow$ **CAUTION (Stop required)**

---

## 🎓 Academic Relevance & Viva Questions

| Question | Viva Answer Summary |
| :--- | :--- |
| **Why use Canny edge detection before Hough Transform?** | Hough Transform maps points $(x, y)$ to sinusoidal curves in $(\rho, \theta)$ parameter space. Applying Canny isolates thin, prominent boundary pixels, drastically reducing computational complexity. |
| **Why choose YOLOv8n over heavier models?** | YOLOv8n (nano) has only ~3.2M parameters and requires ~8.7 GFLOPs, enabling real-time CPU inference without requiring dedicated GPU hardware. |
| **How does camera undistortion improve lane detection?** | Wide-angle dashcam lenses suffer from radial barrel distortion, curving straight parallel lane lines. `cv2.undistort` rectifies pixel coordinates back to true linear perspective geometry. |
| **How is occlusion handled in single images vs video?** | In single images, occlusion is detected via spatial 2D bounding box intersection (IoU). In continuous video, temporal Kalman filtering maintains a track state through temporary visual obstruction. |

---

## 📄 License & Attribution
Designed for educational purposes as part of the **B.Tech Computer Vision with OpenCV** curriculum.
