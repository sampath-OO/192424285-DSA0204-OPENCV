export type ObjectClass = 'sedan' | 'suv' | 'bus' | 'truck' | 'motorcycle' | 'bicycle' | 'pedestrian' | 'traffic_sign';

export type SignType = 'STOP' | 'SPEED_LIMIT_50' | 'SPEED_LIMIT_80' | 'NO_ENTRY' | 'PED_CROSSING' | 'TRAFFIC_LIGHT_RED' | 'TRAFFIC_LIGHT_GREEN' | 'YIELD';

export type TrackStatus = 'active' | 'occluded' | 'recovered' | 'lost';

export type WeatherType = 'clear' | 'rain' | 'fog' | 'night' | 'heavy_traffic';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ViewportMode = 'perspective' | 'bev' | 'edge' | 'thermal' | 'webcam';

export interface BoundingBox {
  x: number; // Normalised (0-1000) or pixel coordinates
  y: number;
  width: number;
  height: number;
}

export interface TrackPoint {
  x: number;
  y: number;
  timestamp: number;
}

export interface VisionEntity {
  id: string; // e.g. "CAR #12", "PED #04"
  numericId: number;
  class: ObjectClass;
  label: string;
  confidence: number; // 0 - 100
  x: number; // Ground coordinates (x: -15m to 15m)
  y: number; // Ground distance (y: 2m to 85m ahead)
  vx: number; // Velocity x (m/s)
  vy: number; // Velocity y (m/s)
  speedKmh: number;
  lane: number; // 0: Left shoulder, 1: Lane 1, 2: Lane 2 (Ego), 3: Lane 3, 4: Right shoulder
  width: number; // meters
  length: number; // meters
  height: number; // meters
  bbox: BoundingBox; // Computed 2D screen bounding box
  trackStatus: TrackStatus;
  occludedBy?: string; // ID of occluding vehicle (e.g. "BUS #02")
  occlusionFrames: number;
  ghostConfidence?: number;
  trail: TrackPoint[];
  ttcSeconds: number | null; // Time to collision
  proximityRisk: RiskLevel;
  signType?: SignType;
  distanceMeters: number;
  heading: number; // Angle in radians
  isEmergencyTarget?: boolean;
}

export interface CameraParameters {
  focalLengthX: number; // fx in pixels
  focalLengthY: number; // fy in pixels
  principalPointX: number; // cx in pixels
  principalPointY: number; // cy in pixels
  pitchAngle: number; // degrees down
  yawAngle: number; // degrees
  rollAngle: number; // degrees
  cameraHeight: number; // meters above road (e.g. 1.45m)
  fovHorizontal: number; // degrees (e.g. 92°)
  fovVertical: number; // degrees (e.g. 58°)
  radialDistortionK1: number;
  radialDistortionK2: number;
  vanishingPointY: number; // Normalized Y horizon position (0-1)
  isCalibrated: boolean;
  calibrationProgress: number; // 0 - 100
  reprojectionError: number; // px
}

export interface LaneBoundary {
  leftLaneCoeffs: [number, number, number]; // a*y^2 + b*y + c
  rightLaneCoeffs: [number, number, number];
  centerOffsetCm: number; // offset of vehicle from lane center (-50cm to +50cm)
  departureRisk: 'NORMAL' | 'DRIFTING' | 'DEPARTURE_WARNING';
  isSimulatingDeparture: boolean;
  roadSurface: 'DRY_ASPHALT' | 'WET_REFLECTIVE' | 'WORN_MARKINGS';
  confidence: number; // 0 - 100
}

export interface RoadSignDetection {
  id: string;
  type: SignType;
  name: string;
  confidence: number;
  distanceMeters: number;
  actionRequired: string;
  icon: string;
  activeScan: boolean;
}

export interface TrafficRiskSummary {
  overallScore: number; // 0 - 100
  overallLevel: RiskLevel;
  ttcSeconds: number; // Minimum TTC among threats
  collisionProbability: number; // 0 - 100%
  pedestrianRiskLevel: RiskLevel;
  laneDepartureStatus: 'NONE' | 'MODERATE' | 'SEVERE';
  trafficDensityRating: 'LIGHT' | 'MODERATE' | 'HEAVY' | 'CONGESTED';
  speedRiskFactor: number;
  activeThreatCount: number;
  isEmergencyActive: boolean;
  emergencyStep: number;
  emergencyDescription: string;
}

export interface SystemMetrics {
  fps: number;
  latencyMs: number;
  detectionTimeMs: number;
  trackingTimeMs: number;
  riskEngineTimeMs: number;
  renderTimeMs: number;
  totalObjectsTracked: number;
  vehiclesCount: number;
  pedestriansCount: number;
  cyclistsCount: number;
  signsCount: number;
  activeTracksCount: number;
  occludedTracksCount: number;
  recoveredTracksCount: number;
  lostTracksCount: number;
  detectionPrecision: number;
  detectionRecall: number;
  detectionAccuracy: number;
  f1Score: number;
  motaScore: number; // Multiple Object Tracking Accuracy
  idAccuracy: number;
}
