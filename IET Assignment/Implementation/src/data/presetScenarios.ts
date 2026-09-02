export interface PresetScenario {
  id: string;
  title: string;
  subtitle: string;
  category: 'CITY' | 'CROSSWALK' | 'SIGNS' | 'HIGHWAY' | 'RAIN' | 'NIGHT' | 'CALIBRATION';
  icon: string;
  description: string;
  backgroundType: 'city_day' | 'crosswalk' | 'highway_signs' | 'expressway_lanes' | 'rain_highway' | 'night_road' | 'chessboard_grid';
  objectsCount: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  laneOffsetCm: number;
  laneRisk: 'NORMAL' | 'DRIFTING' | 'DEPARTURE_WARNING';
  detections: {
    id: string;
    label: string;
    class: 'sedan' | 'suv' | 'bus' | 'truck' | 'pedestrian' | 'bicycle' | 'sign';
    confidence: number;
    distanceM: number;
    speedKmh: number;
    xPct: number; // 0-100 percentage inside image
    yPct: number;
    wPct: number;
    hPct: number;
    threat: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  }[];
  signs: {
    name: string;
    type: string;
    confidence: number;
    distanceM: number;
    action: string;
    xPct: number;
    yPct: number;
  }[];
}

export const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: 'city-day',
    title: 'City Traffic Intersection',
    subtitle: 'Multi-Vehicle & Pedestrian Scene',
    category: 'CITY',
    icon: '🏙️',
    description: 'High-density urban road photo with multiple passenger vehicles, transit bus, cyclist, and pedestrians crossing.',
    backgroundType: 'city_day',
    objectsCount: 6,
    riskLevel: 'LOW',
    laneOffsetCm: 4.2,
    laneRisk: 'NORMAL',
    detections: [
      { id: 'CAR #01', label: 'White Sedan', class: 'sedan', confidence: 97.4, distanceM: 18.5, speedKmh: 45, xPct: 28, yPct: 48, wPct: 18, hPct: 24, threat: 'LOW' },
      { id: 'BUS #02', label: 'Transit Bus #14', class: 'bus', confidence: 98.1, distanceM: 32.0, speedKmh: 38, xPct: 56, yPct: 38, wPct: 26, hPct: 38, threat: 'LOW' },
      { id: 'PED #03', label: 'Pedestrian (Adult)', class: 'pedestrian', confidence: 94.6, distanceM: 12.0, speedKmh: 4.2, xPct: 84, yPct: 58, wPct: 6, hPct: 22, threat: 'MEDIUM' },
      { id: 'BIKE #04', label: 'Commuter Cyclist', class: 'bicycle', confidence: 92.3, distanceM: 14.5, speedKmh: 16, xPct: 12, yPct: 54, wPct: 8, hPct: 20, threat: 'LOW' },
      { id: 'SUV #05', label: 'Silver SUV', class: 'suv', confidence: 96.2, distanceM: 42.0, speedKmh: 48, xPct: 34, yPct: 42, wPct: 14, hPct: 18, threat: 'LOW' },
    ],
    signs: [
      { name: 'Speed Limit 50', type: 'SPEED_50', confidence: 98.6, distanceM: 25, action: 'Maintain speed <= 50 km/h', xPct: 88, yPct: 32 }
    ]
  },
  {
    id: 'crosswalk-alert',
    title: 'Pedestrian Crosswalk Hazard',
    subtitle: 'Vulnerable Road User (VRU) Focus',
    category: 'CROSSWALK',
    icon: '🚶',
    description: 'Pedestrians traversing zebra crossing in active lane path. Triggers proximity safety halos and Time-to-Collision warning.',
    backgroundType: 'crosswalk',
    objectsCount: 4,
    riskLevel: 'HIGH',
    laneOffsetCm: -2.0,
    laneRisk: 'NORMAL',
    detections: [
      { id: 'PED #01', label: 'Pedestrian in Ego-Lane', class: 'pedestrian', confidence: 96.8, distanceM: 9.5, speedKmh: 4.8, xPct: 46, yPct: 52, wPct: 9, hPct: 34, threat: 'HIGH' },
      { id: 'PED #02', label: 'Pedestrian (Curb)', class: 'pedestrian', confidence: 95.1, distanceM: 11.2, speedKmh: 3.5, xPct: 76, yPct: 54, wPct: 8, hPct: 30, threat: 'MEDIUM' },
      { id: 'CAR #03', label: 'Approaching Sedan', class: 'sedan', confidence: 97.0, distanceM: 22.0, speedKmh: 35, xPct: 18, yPct: 46, wPct: 19, hPct: 25, threat: 'LOW' }
    ],
    signs: [
      { name: 'Pedestrian Crossing', type: 'PED_CROSSING', confidence: 99.1, distanceM: 14, action: 'Yield right-of-way to pedestrian', xPct: 12, yPct: 28 }
    ]
  },
  {
    id: 'highway-signs',
    title: 'Highway Road Signs & Gantries',
    subtitle: 'Optical OCR & Regulatory Signs',
    category: 'SIGNS',
    icon: '🛑',
    description: 'High-speed roadway with overhead gantry signs, STOP signs, and regulatory speed limit markers with optical OCR classification.',
    backgroundType: 'highway_signs',
    objectsCount: 5,
    riskLevel: 'LOW',
    laneOffsetCm: 1.5,
    laneRisk: 'NORMAL',
    detections: [
      { id: 'CAR #01', label: 'Lead Sedan', class: 'sedan', confidence: 98.4, distanceM: 28.0, speedKmh: 75, xPct: 48, yPct: 50, wPct: 15, hPct: 22, threat: 'LOW' },
      { id: 'TRUCK #02', label: 'Freight Cargo Truck', class: 'truck', confidence: 97.8, distanceM: 48.0, speedKmh: 68, xPct: 20, yPct: 40, wPct: 20, hPct: 32, threat: 'LOW' },
      { id: 'SUV #03', label: 'Overtaking SUV', class: 'suv', confidence: 95.5, distanceM: 35.0, speedKmh: 82, xPct: 72, yPct: 48, wPct: 16, hPct: 24, threat: 'LOW' }
    ],
    signs: [
      { name: 'Speed Limit 80 km/h', type: 'SPEED_80', confidence: 99.2, distanceM: 35, action: 'Cruise limit: 80 km/h', xPct: 82, yPct: 22 },
      { name: 'STOP Sign Ahead', type: 'STOP', confidence: 98.9, distanceM: 55, action: 'Prepare deceleration', xPct: 14, yPct: 28 }
    ]
  },
  {
    id: 'expressway-lanes',
    title: 'Expressway Lane Departure (LDW)',
    subtitle: 'Polynomial Lane Boundary Analysis',
    category: 'HIGHWAY',
    icon: '🛣️',
    description: 'Multi-lane curved highway demonstrating 2nd-degree polynomial curve fitting and lateral vehicle drift warnings.',
    backgroundType: 'expressway_lanes',
    objectsCount: 4,
    riskLevel: 'MEDIUM',
    laneOffsetCm: 38.5,
    laneRisk: 'DRIFTING',
    detections: [
      { id: 'CAR #01', label: 'Lead Vehicle', class: 'sedan', confidence: 98.0, distanceM: 30.0, speedKmh: 65, xPct: 42, yPct: 50, wPct: 16, hPct: 22, threat: 'LOW' },
      { id: 'CAR #02', label: 'Right-Lane Vehicle', class: 'sedan', confidence: 96.4, distanceM: 24.0, speedKmh: 68, xPct: 68, yPct: 52, wPct: 18, hPct: 25, threat: 'LOW' }
    ],
    signs: [
      { name: 'Curve Warning Ahead', type: 'WARNING', confidence: 97.5, distanceM: 40, action: 'Reduce speed for gentle bend', xPct: 86, yPct: 26 }
    ]
  },
  {
    id: 'rain-highway',
    title: 'Rain & Wet Road Reflections',
    subtitle: 'Adverse Weather Robustness',
    category: 'RAIN',
    icon: '🌧️',
    description: 'Rainy asphalt road with surface reflections and reduced visibility. Demonstrates edge thresholding and contrast compensation.',
    backgroundType: 'rain_highway',
    objectsCount: 4,
    riskLevel: 'MEDIUM',
    laneOffsetCm: 6.0,
    laneRisk: 'NORMAL',
    detections: [
      { id: 'CAR #01', label: 'Sedan (Headlights On)', class: 'sedan', confidence: 91.2, distanceM: 20.0, speedKmh: 42, xPct: 45, yPct: 50, wPct: 17, hPct: 24, threat: 'LOW' },
      { id: 'TRUCK #02', label: 'Logistics Truck', class: 'truck', confidence: 93.4, distanceM: 45.0, speedKmh: 38, xPct: 18, yPct: 42, wPct: 22, hPct: 34, threat: 'LOW' }
    ],
    signs: [
      { name: 'Slippery Road Warning', type: 'WARNING', confidence: 95.8, distanceM: 30, action: 'Increase following distance (3x)', xPct: 84, yPct: 28 }
    ]
  },
  {
    id: 'night-road',
    title: 'Night Traffic (Low Light)',
    subtitle: 'Thermal Infrared (LWIR) Detection',
    category: 'NIGHT',
    icon: '🌙',
    description: 'Low-light nighttime road. Switch to Thermal Night Vision filter to visualize pedestrians and vehicles via infrared heat signatures.',
    backgroundType: 'night_road',
    objectsCount: 4,
    riskLevel: 'MEDIUM',
    laneOffsetCm: 0.0,
    laneRisk: 'NORMAL',
    detections: [
      { id: 'PED #01', label: 'Pedestrian (Low Light)', class: 'pedestrian', confidence: 89.5, distanceM: 15.0, speedKmh: 4.0, xPct: 78, yPct: 56, wPct: 7, hPct: 24, threat: 'HIGH' },
      { id: 'CAR #02', label: 'Vehicle with Headlights', class: 'sedan', confidence: 94.0, distanceM: 26.0, speedKmh: 50, xPct: 36, yPct: 52, wPct: 18, hPct: 24, threat: 'LOW' }
    ],
    signs: [
      { name: 'Illuminated Speed Sign', type: 'SPEED_50', confidence: 96.0, distanceM: 35, action: 'Night cruise: 50 km/h', xPct: 88, yPct: 30 }
    ]
  },
  {
    id: 'calibration-grid',
    title: 'Camera Calibration Chessboard',
    subtitle: 'Perspective Grid & Horizon Alignment',
    category: 'CALIBRATION',
    icon: '🏁',
    description: 'Geometric calibration pattern used to calculate vanishing points, camera intrinsic matrix K, and homography projection.',
    backgroundType: 'chessboard_grid',
    objectsCount: 2,
    riskLevel: 'LOW',
    laneOffsetCm: 0.0,
    laneRisk: 'NORMAL',
    detections: [
      { id: 'CALIB #01', label: 'Target Grid Marker A', class: 'sign', confidence: 99.8, distanceM: 5.0, speedKmh: 0, xPct: 35, yPct: 45, wPct: 12, hPct: 18, threat: 'LOW' },
      { id: 'CALIB #02', label: 'Target Grid Marker B', class: 'sign', confidence: 99.7, distanceM: 8.0, speedKmh: 0, xPct: 62, yPct: 45, wPct: 12, hPct: 18, threat: 'LOW' }
    ],
    signs: [
      { name: 'Calibration Reference Marker', type: 'CALIB', confidence: 99.9, distanceM: 6, action: 'Vanishing point locked at Y=44%', xPct: 50, yPct: 35 }
    ]
  }
];
