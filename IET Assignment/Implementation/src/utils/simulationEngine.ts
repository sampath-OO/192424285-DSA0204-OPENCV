import {
  CameraParameters,
  LaneBoundary,
  ObjectClass,
  RiskLevel,
  RoadSignDetection,
  SignType,
  SystemMetrics,
  TrackStatus,
  TrafficRiskSummary,
  VisionEntity,
  WeatherType
} from '../types/vision';
import { project3DTo2D, calculateTTC } from './cvAlgorithms';

/**
 * Initial standard pool of simulated vision entities
 */
export function createInitialEntities(): VisionEntity[] {
  return [
    {
      id: 'CAR #01',
      numericId: 1,
      class: 'sedan',
      label: 'Sedan (White)',
      confidence: 97.4,
      x: -3.5,
      y: 28,
      vx: 0,
      vy: -1.2,
      speedKmh: 48,
      lane: 1,
      width: 1.8,
      length: 4.5,
      height: 1.4,
      bbox: { x: 0, y: 0, width: 0, height: 0 },
      trackStatus: 'active',
      occlusionFrames: 0,
      trail: [],
      ttcSeconds: null,
      proximityRisk: 'LOW',
      distanceMeters: 28,
      heading: 0,
    },
    {
      id: 'BUS #02',
      numericId: 2,
      class: 'bus',
      label: 'Transit Bus #42',
      confidence: 96.8,
      x: 3.8,
      y: 36,
      vx: 0,
      vy: -1.8,
      speedKmh: 42,
      lane: 3,
      width: 2.6,
      length: 10.5,
      height: 3.2,
      bbox: { x: 0, y: 0, width: 0, height: 0 },
      trackStatus: 'active',
      occlusionFrames: 0,
      trail: [],
      ttcSeconds: null,
      proximityRisk: 'LOW',
      distanceMeters: 36,
      heading: 0,
    },
    {
      id: 'PED #03',
      numericId: 3,
      class: 'pedestrian',
      label: 'Pedestrian (Adult)',
      confidence: 94.2,
      x: 6.8,
      y: 18,
      vx: -0.8,
      vy: 0,
      speedKmh: 4.5,
      lane: 4,
      width: 0.6,
      length: 0.6,
      height: 1.75,
      bbox: { x: 0, y: 0, width: 0, height: 0 },
      trackStatus: 'active',
      occlusionFrames: 0,
      trail: [],
      ttcSeconds: null,
      proximityRisk: 'LOW',
      distanceMeters: 19.2,
      heading: -Math.PI / 2,
    },
    {
      id: 'CAR #05',
      numericId: 5,
      class: 'sedan',
      label: 'Sedan (Blue)',
      confidence: 95.1,
      x: 4.2,
      y: 48,
      vx: 0,
      vy: 0.8,
      speedKmh: 56,
      lane: 3,
      width: 1.8,
      length: 4.6,
      height: 1.45,
      bbox: { x: 0, y: 0, width: 0, height: 0 },
      trackStatus: 'active',
      occlusionFrames: 0,
      trail: [],
      ttcSeconds: null,
      proximityRisk: 'LOW',
      distanceMeters: 48,
      heading: 0,
    },
    {
      id: 'BIKE #07',
      numericId: 7,
      class: 'bicycle',
      label: 'Cyclist (Commuter)',
      confidence: 91.5,
      x: -6.2,
      y: 14,
      vx: 0,
      vy: -0.6,
      speedKmh: 18,
      lane: 0,
      width: 0.7,
      length: 1.8,
      height: 1.6,
      bbox: { x: 0, y: 0, width: 0, height: 0 },
      trackStatus: 'active',
      occlusionFrames: 0,
      trail: [],
      ttcSeconds: null,
      proximityRisk: 'LOW',
      distanceMeters: 15.3,
      heading: 0,
    },
    {
      id: 'TRUCK #09',
      numericId: 9,
      class: 'truck',
      label: 'Freight Cargo',
      confidence: 98.1,
      x: -3.6,
      y: 62,
      vx: 0,
      vy: -1.0,
      speedKmh: 45,
      lane: 1,
      width: 2.5,
      length: 9.0,
      height: 3.4,
      bbox: { x: 0, y: 0, width: 0, height: 0 },
      trackStatus: 'active',
      occlusionFrames: 0,
      trail: [],
      ttcSeconds: null,
      proximityRisk: 'LOW',
      distanceMeters: 62,
      heading: 0,
    },
    {
      id: 'MOTO #11',
      numericId: 11,
      class: 'motorcycle',
      label: 'Motorcycle (Sport)',
      confidence: 92.7,
      x: 0.2,
      y: 38,
      vx: 0,
      vy: 1.2,
      speedKmh: 62,
      lane: 2,
      width: 0.8,
      length: 2.1,
      height: 1.3,
      bbox: { x: 0, y: 0, width: 0, height: 0 },
      trackStatus: 'active',
      occlusionFrames: 0,
      trail: [],
      ttcSeconds: null,
      proximityRisk: 'LOW',
      distanceMeters: 38,
      heading: 0,
    }
  ];
}

/**
 * Initial road signs detected along the route
 */
export function createInitialSigns(): RoadSignDetection[] {
  return [
    {
      id: 'SIGN #01',
      type: 'SPEED_LIMIT_50',
      name: 'Speed Limit 50 km/h',
      confidence: 98.4,
      distanceMeters: 32.5,
      actionRequired: 'Maintain cruise speed <= 50 km/h',
      icon: '50',
      activeScan: true,
    },
    {
      id: 'SIGN #02',
      type: 'STOP',
      name: 'STOP Sign',
      confidence: 99.1,
      distanceMeters: 68.0,
      actionRequired: 'Prepare deceleration to full stop',
      icon: 'STOP',
      activeScan: false,
    },
    {
      id: 'SIGN #03',
      type: 'PED_CROSSING',
      name: 'Pedestrian Crossing Ahead',
      confidence: 96.7,
      distanceMeters: 22.0,
      actionRequired: 'Yield right-of-way to pedestrians',
      icon: 'PED',
      activeScan: true,
    },
    {
      id: 'SIGN #04',
      type: 'TRAFFIC_LIGHT_GREEN',
      name: 'Traffic Signal (Green)',
      confidence: 97.9,
      distanceMeters: 45.0,
      actionRequired: 'Proceed with normal intersection scan',
      icon: 'LIGHT',
      activeScan: true,
    }
  ];
}

/**
 * Spawn a new random vehicle in the simulation
 */
export function spawnRandomVehicle(entities: VisionEntity[]): VisionEntity {
  const nextId = Math.floor(Math.random() * 80) + 20;
  const classes: ObjectClass[] = ['sedan', 'suv', 'truck', 'motorcycle'];
  const chosenClass = classes[Math.floor(Math.random() * classes.length)];
  const lanes = [-3.5, 0.0, 3.8];
  const chosenLaneX = lanes[Math.floor(Math.random() * lanes.length)];
  const laneIndex = chosenLaneX < -1 ? 1 : chosenLaneX > 1 ? 3 : 2;

  const baseSpeed = 40 + Math.random() * 25;
  const length = chosenClass === 'truck' ? 8.5 : chosenClass === 'motorcycle' ? 2.0 : 4.5;
  const height = chosenClass === 'truck' ? 3.2 : chosenClass === 'motorcycle' ? 1.3 : 1.45;
  const width = chosenClass === 'truck' ? 2.5 : chosenClass === 'motorcycle' ? 0.8 : 1.8;

  return {
    id: `CAR #${nextId < 10 ? '0' + nextId : nextId}`,
    numericId: nextId,
    class: chosenClass,
    label: `${chosenClass.toUpperCase()} #${nextId}`,
    confidence: Number((91 + Math.random() * 8).toFixed(1)),
    x: chosenLaneX + (Math.random() - 0.5) * 0.4,
    y: 75 + Math.random() * 15,
    vx: (Math.random() - 0.5) * 0.1,
    vy: -0.5 - Math.random() * 1.5,
    speedKmh: Number(baseSpeed.toFixed(1)),
    lane: laneIndex,
    width,
    length,
    height,
    bbox: { x: 0, y: 0, width: 0, height: 0 },
    trackStatus: 'active',
    occlusionFrames: 0,
    trail: [],
    ttcSeconds: null,
    proximityRisk: 'LOW',
    distanceMeters: 75,
    heading: 0,
  };
}

/**
 * Spawn a new pedestrian crossing the roadway
 */
export function spawnRandomPedestrian(entities: VisionEntity[]): VisionEntity {
  const nextId = Math.floor(Math.random() * 80) + 15;
  const fromRight = Math.random() > 0.5;
  const startX = fromRight ? 7.5 : -7.5;
  const vx = fromRight ? -1.1 : 1.1;

  return {
    id: `PED #${nextId < 10 ? '0' + nextId : nextId}`,
    numericId: nextId,
    class: 'pedestrian',
    label: `Pedestrian #${nextId}`,
    confidence: Number((92 + Math.random() * 7).toFixed(1)),
    x: startX,
    y: 16 + Math.random() * 20,
    vx: vx,
    vy: 0,
    speedKmh: Number((Math.abs(vx) * 3.6).toFixed(1)),
    lane: fromRight ? 4 : 0,
    width: 0.6,
    length: 0.6,
    height: 1.75,
    bbox: { x: 0, y: 0, width: 0, height: 0 },
    trackStatus: 'active',
    occlusionFrames: 0,
    trail: [],
    ttcSeconds: null,
    proximityRisk: 'LOW',
    distanceMeters: 20,
    heading: vx > 0 ? 0 : Math.PI,
  };
}

/**
 * Main simulation physics and perception update step (executed every animation frame)
 */
export function updateSimulationStep(
  entities: VisionEntity[],
  dt: number,
  camera: CameraParameters,
  laneBoundary: LaneBoundary,
  weather: WeatherType,
  isOcclusionTriggered: boolean,
  isEmergencyActive: boolean,
  canvasWidth: number,
  canvasHeight: number,
  egoSpeedKmh: number = 50
): {
  updatedEntities: VisionEntity[];
  riskSummary: TrafficRiskSummary;
  updatedLane: LaneBoundary;
  metrics: SystemMetrics;
} {
  const updatedLane = { ...laneBoundary };
  const egoSpeedMps = egoSpeedKmh / 3.6;

  // 1. Lane Departure physics simulation
  if (updatedLane.isSimulatingDeparture) {
    updatedLane.centerOffsetCm += 1.8 * (dt * 60);
    if (Math.abs(updatedLane.centerOffsetCm) > 42) {
      updatedLane.departureRisk = 'DEPARTURE_WARNING';
    } else if (Math.abs(updatedLane.centerOffsetCm) > 22) {
      updatedLane.departureRisk = 'DRIFTING';
    } else {
      updatedLane.departureRisk = 'NORMAL';
    }
  } else {
    // Gentle auto-centering return
    if (Math.abs(updatedLane.centerOffsetCm) > 0.5) {
      updatedLane.centerOffsetCm *= 0.96;
    }
    updatedLane.departureRisk = 'NORMAL';
  }

  // Weather noise and confidence degradation factors
  let weatherConfidencePenalty = 0;
  let weatherFps = 30;
  let weatherLatency = 33;
  if (weather === 'rain') {
    weatherConfidencePenalty = 4.5;
    weatherFps = 28;
    weatherLatency = 38;
  } else if (weather === 'fog') {
    weatherConfidencePenalty = 12.0;
    weatherFps = 25;
    weatherLatency = 44;
  } else if (weather === 'night') {
    weatherConfidencePenalty = 6.0;
    weatherFps = 29;
    weatherLatency = 36;
  } else if (weather === 'heavy_traffic') {
    weatherConfidencePenalty = 3.0;
    weatherFps = 27;
    weatherLatency = 40;
  }

  let minTtc: number = 99;
  let highestRisk: RiskLevel = 'LOW';
  let activeThreats = 0;
  let pedestrianThreat: RiskLevel = 'LOW';
  let totalCollisionProb = 2.5;

  const updatedEntities: VisionEntity[] = [];

  for (let i = 0; i < entities.length; i++) {
    const e = { ...entities[i] };

    // Emergency Scenario Injection: Target pedestrian enters ego lane
    if (isEmergencyActive && e.class === 'pedestrian' && (e.isEmergencyTarget || e.id === 'PED #03')) {
      e.isEmergencyTarget = true;
      e.vx = -1.6; // Runs directly across
      if (e.x > 3.0) e.x = 2.8;
      if (e.y > 15) e.y = 12.5;
    }

    // Kinematic position integration
    e.x += e.vx * dt;
    e.y += e.vy * dt;

    // Boundary wrapping for endless loop road
    if (e.y < 3.0) {
      e.y = 80 + Math.random() * 10;
    } else if (e.y > 90) {
      e.y = 4.0;
    }

    // Pedestrian crosswalk bounce
    if (e.class === 'pedestrian') {
      if (e.x < -8.5) {
        e.x = -8.5;
        e.vx = Math.abs(e.vx);
        e.heading = 0;
      } else if (e.x > 8.5) {
        e.x = 8.5;
        e.vx = -Math.abs(e.vx);
        e.heading = Math.PI;
      }
    }

    // Calculate distance to camera
    e.distanceMeters = Number(Math.sqrt(e.x * e.x + e.y * e.y).toFixed(1));

    // Project 3D into 2D screen coordinates
    const proj = project3DTo2D(e.x, e.y, 0, canvasWidth, canvasHeight, camera);
    const projTop = project3DTo2D(e.x, e.y, e.height, canvasWidth, canvasHeight, camera);

    const screenH = Math.max(16, (proj.screenY - projTop.screenY));
    const screenW = Math.max(12, screenH * (e.width / Math.max(1, e.height)));

    e.bbox = {
      x: proj.screenX - screenW / 2,
      y: projTop.screenY,
      width: screenW,
      height: screenH,
    };

    // Update tracking trail (last 12 points)
    const now = Date.now();
    e.trail = [...e.trail.slice(-12), { x: proj.screenX, y: proj.screenY, timestamp: now }];

    // Occlusion Logic Simulation
    // Check if e.g. Car #05 is blocked by Bus #02
    let isCurrentlyOccluded = false;
    if (isOcclusionTriggered && e.id === 'CAR #05') {
      // Intentionally steer behind Bus #02
      e.x = 3.9;
      e.y = 44;
      isCurrentlyOccluded = true;
      e.occludedBy = 'BUS #02';
    } else {
      // Geometric raycast occlusion check against larger vehicles
      for (const other of entities) {
        if (other.id !== e.id && (other.class === 'bus' || other.class === 'truck')) {
          if (other.y < e.y && Math.abs(other.x - e.x) < (other.width + e.width) * 0.45 && (e.y - other.y) < 18) {
            isCurrentlyOccluded = true;
            e.occludedBy = other.id;
            break;
          }
        }
      }
    }

    if (isCurrentlyOccluded) {
      e.occlusionFrames++;
      if (e.trackStatus === 'active') {
        e.trackStatus = 'occluded';
      }
      e.ghostConfidence = Math.max(40, (e.confidence - e.occlusionFrames * 0.8));
    } else {
      if (e.trackStatus === 'occluded') {
        e.trackStatus = 'recovered';
      } else if (e.trackStatus === 'recovered') {
        e.trackStatus = 'active';
      }
      e.occlusionFrames = 0;
      e.occludedBy = undefined;
      e.ghostConfidence = undefined;
    }

    // Time-to-Collision and Proximity Risk
    const relativeSpeedMps = (egoSpeedMps - (e.speedKmh / 3.6));
    const isDirectlyAhead = Math.abs(e.x) < 2.2;
    const ttc = isDirectlyAhead ? calculateTTC(e.y, relativeSpeedMps) : null;
    e.ttcSeconds = ttc;

    // Threat determination
    let entityThreat: RiskLevel = 'LOW';
    if (e.class === 'pedestrian' && Math.abs(e.x) < 3.2 && e.y < 22) {
      entityThreat = e.y < 12 ? 'CRITICAL' : 'HIGH';
      pedestrianThreat = entityThreat;
      activeThreats++;
      totalCollisionProb += entityThreat === 'CRITICAL' ? 70 : 35;
    } else if (ttc !== null && ttc < 4.0) {
      if (ttc < 1.8) {
        entityThreat = 'CRITICAL';
        totalCollisionProb += 85;
      } else if (ttc < 3.2) {
        entityThreat = 'HIGH';
        totalCollisionProb += 45;
      } else {
        entityThreat = 'MEDIUM';
        totalCollisionProb += 20;
      }
      activeThreats++;
    }

    e.proximityRisk = entityThreat;
    if (entityThreat === 'CRITICAL') highestRisk = 'CRITICAL';
    else if (entityThreat === 'HIGH' && highestRisk !== 'CRITICAL') highestRisk = 'HIGH';
    else if (entityThreat === 'MEDIUM' && highestRisk === 'LOW') highestRisk = 'MEDIUM';

    if (ttc !== null && ttc < minTtc) {
      minTtc = ttc;
    }

    // Weather impact on confidence
    e.confidence = Math.max(60, Number((e.confidence - weatherConfidencePenalty).toFixed(1)));

    updatedEntities.push(e);
  }

  // Cap collision probability
  totalCollisionProb = Math.min(99.4, Math.max(1.8, Number(totalCollisionProb.toFixed(1))));

  const riskScore = highestRisk === 'CRITICAL' ? 94 : highestRisk === 'HIGH' ? 68 : highestRisk === 'MEDIUM' ? 38 : 12;

  const riskSummary: TrafficRiskSummary = {
    overallScore: riskScore,
    overallLevel: isEmergencyActive ? 'CRITICAL' : highestRisk,
    ttcSeconds: minTtc < 90 ? minTtc : 5.8,
    collisionProbability: isEmergencyActive ? 96.8 : totalCollisionProb,
    pedestrianRiskLevel: isEmergencyActive ? 'CRITICAL' : pedestrianThreat,
    laneDepartureStatus: updatedLane.departureRisk === 'DEPARTURE_WARNING' ? 'SEVERE' : updatedLane.departureRisk === 'DRIFTING' ? 'MODERATE' : 'NONE',
    trafficDensityRating: entities.length > 8 ? 'HEAVY' : entities.length > 5 ? 'MODERATE' : 'LIGHT',
    speedRiskFactor: Number((egoSpeedKmh / 60).toFixed(2)),
    activeThreatCount: isEmergencyActive ? activeThreats + 1 : activeThreats,
    isEmergencyActive,
    emergencyStep: isEmergencyActive ? 2 : 0,
    emergencyDescription: isEmergencyActive
      ? 'PEDESTRIAN IN EGO-LANE — AUTOMATIC EMERGENCY BRAKING (AEB) ENGAGED'
      : 'All safety thresholds nominal. Lane keeping active.',
  };

  const vehicles = updatedEntities.filter(e => e.class !== 'pedestrian' && e.class !== 'bicycle' && e.class !== 'traffic_sign');
  const pedestrians = updatedEntities.filter(e => e.class === 'pedestrian');
  const cyclists = updatedEntities.filter(e => e.class === 'bicycle');
  const occluded = updatedEntities.filter(e => e.trackStatus === 'occluded');
  const recovered = updatedEntities.filter(e => e.trackStatus === 'recovered');

  const metrics: SystemMetrics = {
    fps: weatherFps,
    latencyMs: weatherLatency,
    detectionTimeMs: Math.round(weatherLatency * 0.58),
    trackingTimeMs: Math.round(weatherLatency * 0.24),
    riskEngineTimeMs: Math.round(weatherLatency * 0.10),
    renderTimeMs: Math.round(weatherLatency * 0.08),
    totalObjectsTracked: updatedEntities.length,
    vehiclesCount: vehicles.length,
    pedestriansCount: pedestrians.length,
    cyclistsCount: cyclists.length,
    signsCount: 4,
    activeTracksCount: updatedEntities.filter(e => e.trackStatus === 'active').length,
    occludedTracksCount: occluded.length,
    recoveredTracksCount: recovered.length,
    lostTracksCount: 0,
    detectionPrecision: Number((95.4 - weatherConfidencePenalty * 0.6).toFixed(1)),
    detectionRecall: Number((93.8 - weatherConfidencePenalty * 0.8).toFixed(1)),
    detectionAccuracy: Number((94.6 - weatherConfidencePenalty * 0.7).toFixed(1)),
    f1Score: Number((94.6 - weatherConfidencePenalty * 0.7).toFixed(1)),
    motaScore: Number((91.2 - weatherConfidencePenalty * 0.9).toFixed(1)),
    idAccuracy: 95.8,
  };

  return {
    updatedEntities,
    riskSummary,
    updatedLane,
    metrics,
  };
}
