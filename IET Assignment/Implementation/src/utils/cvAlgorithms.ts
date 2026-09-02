import { BoundingBox, CameraParameters } from '../types/vision';

/**
 * Camera Intrinsic Matrix & Perspective Projection
 * Converts 3D Road Coordinates (X: lateral meters, Y: longitudinal distance meters, Z: height meters)
 * into 2D Screen Pixel coordinates [u, v] using camera intrinsics and extrinsics.
 */
export function project3DTo2D(
  xMeters: number,
  yMeters: number,
  zMeters: number,
  canvasWidth: number,
  canvasHeight: number,
  camera: CameraParameters
): { screenX: number; screenY: number; scale: number; isVisible: boolean } {
  // Prevent division by zero / behind camera
  if (yMeters <= 0.5) {
    return { screenX: 0, screenY: canvasHeight, scale: 1, isVisible: false };
  }

  // Camera parameters
  const fx = camera.focalLengthX || 800;
  const fy = camera.focalLengthY || 800;
  const cx = canvasWidth * 0.5 + (camera.principalPointX - 0.5 * canvasWidth);
  const horizonY = canvasHeight * camera.vanishingPointY;

  // Perspective scaling (inversely proportional to distance Y)
  const scale = fy / (yMeters * 15 + fy * 0.05);

  // Screen X: centered + lateral offset scaled by distance
  const screenX = cx + (xMeters * fx) / (yMeters * 1.8 + 8);

  // Screen Y: vanishes towards horizon as Y approaches infinity
  // As y -> 0 (close to ego), screenY -> canvasHeight
  // As y -> large (far distance), screenY -> horizonY
  const normalizedDist = Math.min(1, Math.max(0, yMeters / 90));
  // Non-linear perspective compression curve
  const perspectiveWeight = Math.pow(1 - normalizedDist, 1.8);
  const screenY = horizonY + (canvasHeight - horizonY) * perspectiveWeight - (zMeters * scale * 25);

  const isVisible = screenY >= horizonY && screenY <= canvasHeight + 100 && screenX >= -200 && screenX <= canvasWidth + 200;

  return { screenX, screenY, scale, isVisible };
}

/**
 * Bird's-Eye View (BEV) Orthographic 2D Projection
 * Maps road distance (X meters, Y meters) directly to a top-down tactical radar map.
 */
export function project3DToBEV(
  xMeters: number,
  yMeters: number,
  bevWidth: number,
  bevHeight: number,
  maxDistanceMeters: number = 80,
  maxLateralMeters: number = 14
): { bevX: number; bevY: number } {
  // Center is ego-vehicle at bottom center
  const centerX = bevWidth / 2;
  const scaleX = (bevWidth * 0.45) / maxLateralMeters;
  const scaleY = (bevHeight * 0.85) / maxDistanceMeters;

  const bevX = centerX + xMeters * scaleX;
  const bevY = bevHeight * 0.92 - yMeters * scaleY;

  return { bevX, bevY };
}

/**
 * Intersection over Union (IoU) calculation for bounding box association
 */
export function calculateIoU(boxA: BoundingBox, boxB: BoundingBox): number {
  const xA = Math.max(boxA.x, boxB.x);
  const yA = Math.max(boxA.y, boxB.y);
  const xB = Math.min(boxA.x + boxA.width, boxB.x + boxB.width);
  const yB = Math.min(boxA.y + boxA.height, boxB.y + boxB.height);

  const interArea = Math.max(0, xB - xA) * Math.max(0, yB - yA);
  const boxAArea = boxA.width * boxA.height;
  const boxBArea = boxB.width * boxB.height;
  const unionArea = boxAArea + boxBArea - interArea;

  if (unionArea <= 0) return 0;
  return interArea / unionArea;
}

/**
 * Simplified 2D Kalman Filter state step for smooth trajectory extrapolation
 * State vector: [x, y, vx, vy]
 */
export class KalmanTracker2D {
  private x: number;
  private y: number;
  private vx: number;
  private vy: number;
  private cov: number[][]; // Covariance matrix

  constructor(initX: number, initY: number, initVx: number = 0, initVy: number = 0) {
    this.x = initX;
    this.y = initY;
    this.vx = initVx;
    this.vy = initVy;
    this.cov = [
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 10, 0],
      [0, 0, 0, 10],
    ];
  }

  // Predict step
  predict(dt: number = 1 / 30): { x: number; y: number; vx: number; vy: number } {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    return { x: this.x, y: this.y, vx: this.vx, vy: this.vy };
  }

  // Measurement update step
  update(measX: number, measY: number, weight: number = 0.6): void {
    const prevX = this.x;
    const prevY = this.y;
    this.x = this.x * (1 - weight) + measX * weight;
    this.y = this.y * (1 - weight) + measY * weight;
    this.vx = (this.x - prevX) * 30; // Approx velocity
    this.vy = (this.y - prevY) * 30;
  }

  getState() {
    return { x: this.x, y: this.y, vx: this.vx, vy: this.vy };
  }
}

/**
 * Lane boundary 2nd-degree polynomial curve evaluation: x(y) = a*y^2 + b*y + c
 */
export function evaluateLanePolynomial(
  coeffs: [number, number, number],
  yNorm: number // 0 at horizon, 1 at bottom of screen
): number {
  const [a, b, c] = coeffs;
  return a * Math.pow(yNorm, 2) + b * yNorm + c;
}

/**
 * Time-to-Collision (TTC) in seconds
 * Formula: TTC = distance / relative_velocity
 */
export function calculateTTC(
  distanceMeters: number,
  relativeSpeedMps: number // positive if closing in
): number | null {
  if (relativeSpeedMps <= 0.2 || distanceMeters <= 0) {
    return null; // Not closing in or stationary relative to ego
  }
  const ttc = distanceMeters / relativeSpeedMps;
  return Math.max(0.1, Number(ttc.toFixed(1)));
}

/**
 * Apply real-time Sobel Edge Detection kernel on Canvas ImageData
 */
export function applySobelEdgeFilter(imageData: ImageData): ImageData {
  const width = imageData.width;
  const height = imageData.height;
  const src = imageData.data;
  const output = new ImageData(width, height);
  const dst = output.data;

  // Grayscale first
  const gray = new Uint8Array(width * height);
  for (let i = 0; i < src.length; i += 4) {
    gray[i / 4] = (src[i] * 0.299 + src[i + 1] * 0.587 + src[i + 2] * 0.114) | 0;
  }

  // Sobel 3x3 convolution
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;

      const gx =
        -1 * gray[idx - width - 1] + 1 * gray[idx - width + 1] +
        -2 * gray[idx - 1]         + 2 * gray[idx + 1] +
        -1 * gray[idx + width - 1] + 1 * gray[idx + width + 1];

      const gy =
        -1 * gray[idx - width - 1] - 2 * gray[idx - width] - 1 * gray[idx - width + 1] +
         1 * gray[idx + width - 1] + 2 * gray[idx + width] + 1 * gray[idx + width + 1];

      const mag = Math.min(255, Math.sqrt(gx * gx + gy * gy) * 1.5) | 0;
      const dIdx = idx * 4;

      // Electric Cyan edge color
      if (mag > 40) {
        dst[dIdx] = 6;      // R
        dst[dIdx + 1] = mag; // G (Cyan glow)
        dst[dIdx + 2] = 212; // B
        dst[dIdx + 3] = 255; // Alpha
      } else {
        dst[dIdx] = 11;
        dst[dIdx + 1] = 15;
        dst[dIdx + 2] = 25;
        dst[dIdx + 3] = 255;
      }
    }
  }

  return output;
}

/**
 * Apply Thermal / Infrared color map to Canvas ImageData
 */
export function applyThermalFilter(imageData: ImageData): ImageData {
  const src = imageData.data;
  const output = new ImageData(imageData.width, imageData.height);
  const dst = output.data;

  for (let i = 0; i < src.length; i += 4) {
    const intensity = (src[i] * 0.299 + src[i + 1] * 0.587 + src[i + 2] * 0.114) / 255;
    
    // Thermal spectrum: Blue -> Magenta -> Red -> Yellow -> White
    let r = 0, g = 0, b = 0;
    if (intensity < 0.25) {
      b = Math.floor(intensity * 4 * 255);
    } else if (intensity < 0.5) {
      r = Math.floor((intensity - 0.25) * 4 * 255);
      b = 255;
    } else if (intensity < 0.75) {
      r = 255;
      g = Math.floor((intensity - 0.5) * 4 * 255);
      b = Math.floor((1 - (intensity - 0.5) * 4) * 255);
    } else {
      r = 255;
      g = 255;
      b = Math.floor((intensity - 0.75) * 4 * 255);
    }

    dst[i] = r;
    dst[i + 1] = g;
    dst[i + 2] = b;
    dst[i + 3] = 255;
  }

  return output;
}
