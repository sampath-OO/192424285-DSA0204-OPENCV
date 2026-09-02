import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  CameraParameters,
  LaneBoundary,
  RoadSignDetection,
  SystemMetrics,
  TrafficRiskSummary,
  ViewportMode,
  VisionEntity,
  WeatherType
} from '../types/vision';
import { SystemAlert } from '../types/telemetry';
import {
  createInitialEntities,
  createInitialSigns,
  spawnRandomPedestrian,
  spawnRandomVehicle,
  updateSimulationStep
} from '../utils/simulationEngine';
import { audioAlerts } from '../utils/audioAlerts';

interface VisionContextType {
  entities: VisionEntity[];
  signs: RoadSignDetection[];
  camera: CameraParameters;
  lane: LaneBoundary;
  risk: TrafficRiskSummary;
  metrics: SystemMetrics;
  alerts: SystemAlert[];
  weather: WeatherType;
  viewportMode: ViewportMode;
  isPlaying: boolean;
  simSpeed: number;
  confidenceThreshold: number;
  iouThreshold: number;
  isOcclusionDemoActive: boolean;
  isEmergencyActive: boolean;
  soundEnabled: boolean;
  selectedEntity: VisionEntity | null;
  
  // Actions
  startSimulation: () => void;
  pauseSimulation: () => void;
  resetSimulation: () => void;
  stepFrame: () => void;
  addVehicle: () => void;
  addPedestrian: () => void;
  clearEntities: () => void;
  setWeather: (w: WeatherType) => void;
  setViewportMode: (m: ViewportMode) => void;
  setSimSpeed: (s: number) => void;
  setConfidenceThreshold: (c: number) => void;
  setIouThreshold: (i: number) => void;
  setSelectedEntity: (e: VisionEntity | null) => void;
  
  // Scenarios
  triggerLaneDeparture: () => void;
  triggerOcclusionDemo: () => void;
  triggerEmergencyScenario: () => void;
  resetScenarios: () => void;
  calibrateCamera: () => void;
  
  // Alerts & Sound
  dismissAlert: (id: string) => void;
  clearAlerts: () => void;
  toggleSound: () => void;
}

const defaultCamera: CameraParameters = {
  focalLengthX: 820,
  focalLengthY: 820,
  principalPointX: 400,
  principalPointY: 250,
  pitchAngle: 5.5,
  yawAngle: 0.0,
  rollAngle: 0.0,
  cameraHeight: 1.45,
  fovHorizontal: 92,
  fovVertical: 58,
  radialDistortionK1: -0.015,
  radialDistortionK2: 0.002,
  vanishingPointY: 0.44,
  isCalibrated: true,
  calibrationProgress: 100,
  reprojectionError: 0.38,
};

const defaultLane: LaneBoundary = {
  leftLaneCoeffs: [0.0001, -0.42, -2.1],
  rightLaneCoeffs: [0.0001, 0.42, 2.1],
  centerOffsetCm: 0,
  departureRisk: 'NORMAL',
  isSimulatingDeparture: false,
  roadSurface: 'DRY_ASPHALT',
  confidence: 96.8,
};

const defaultRisk: TrafficRiskSummary = {
  overallScore: 14,
  overallLevel: 'LOW',
  ttcSeconds: 6.2,
  collisionProbability: 2.8,
  pedestrianRiskLevel: 'LOW',
  laneDepartureStatus: 'NONE',
  trafficDensityRating: 'MODERATE',
  speedRiskFactor: 0.83,
  activeThreatCount: 0,
  isEmergencyActive: false,
  emergencyStep: 0,
  emergencyDescription: 'Nominal perception active. No critical hazards detected.',
};

const defaultMetrics: SystemMetrics = {
  fps: 30,
  latencyMs: 33,
  detectionTimeMs: 19,
  trackingTimeMs: 8,
  riskEngineTimeMs: 3,
  renderTimeMs: 3,
  totalObjectsTracked: 7,
  vehiclesCount: 4,
  pedestriansCount: 1,
  cyclistsCount: 1,
  signsCount: 4,
  activeTracksCount: 7,
  occludedTracksCount: 0,
  recoveredTracksCount: 0,
  lostTracksCount: 0,
  detectionPrecision: 95.4,
  detectionRecall: 93.8,
  detectionAccuracy: 94.6,
  f1Score: 94.6,
  motaScore: 91.2,
  idAccuracy: 95.8,
};

const VisionSystemContext = createContext<VisionContextType | undefined>(undefined);

export const VisionSystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [entities, setEntities] = useState<VisionEntity[]>(createInitialEntities);
  const [signs] = useState<RoadSignDetection[]>(createInitialSigns);
  const [camera, setCamera] = useState<CameraParameters>(defaultCamera);
  const [lane, setLane] = useState<LaneBoundary>(defaultLane);
  const [risk, setRisk] = useState<TrafficRiskSummary>(defaultRisk);
  const [metrics, setMetrics] = useState<SystemMetrics>(defaultMetrics);
  const [alerts, setAlerts] = useState<SystemAlert[]>([
    {
      id: 'ALT-101',
      timestamp: new Date().toLocaleTimeString(),
      severity: 'INFO',
      title: 'Perception Pipeline Online',
      description: 'VisionGuard AI initialized with 60 FPS multi-camera perception pipeline.',
      sourceModule: 'CAMERA_CALIBRATION',
    }
  ]);
  const [weather, setWeather] = useState<WeatherType>('clear');
  const [viewportMode, setViewportMode] = useState<ViewportMode>('perspective');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [simSpeed, setSimSpeed] = useState<number>(1.0);
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(75);
  const [iouThreshold, setIouThreshold] = useState<number>(45);
  const [isOcclusionDemoActive, setIsOcclusionDemoActive] = useState<boolean>(false);
  const [isEmergencyActive, setIsEmergencyActive] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [selectedEntity, setSelectedEntity] = useState<VisionEntity | null>(null);

  const prevEmergencyState = useRef<boolean>(false);
  const prevDepartureState = useRef<string>('NORMAL');
  const prevOcclusionState = useRef<boolean>(false);

  // Helper to add new alerts without duplication
  const pushAlert = useCallback((severity: 'INFO' | 'WARNING' | 'CRITICAL', title: string, description: string, source: SystemAlert['sourceModule']) => {
    const newAlert: SystemAlert = {
      id: `ALT-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleTimeString(),
      severity,
      title,
      description,
      sourceModule: source,
    };
    setAlerts((prev) => [newAlert, ...prev.slice(0, 19)]);
  }, []);

  // Main animation frame tick loop
  useEffect(() => {
    if (!isPlaying) return;

    let animId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const deltaSec = Math.min(0.1, (currentTime - lastTime) / 1000) * simSpeed;
      lastTime = currentTime;

      setEntities((currentEntities) => {
        const { updatedEntities, riskSummary, updatedLane, metrics: updatedMetrics } = updateSimulationStep(
          currentEntities,
          deltaSec,
          camera,
          lane,
          weather,
          isOcclusionDemoActive,
          isEmergencyActive,
          800,
          500,
          50
        );

        setRisk(riskSummary);
        setLane(updatedLane);
        setMetrics(updatedMetrics);

        // Sound & Alert Triggers on state transitions
        if (riskSummary.overallLevel === 'CRITICAL' && !prevEmergencyState.current) {
          prevEmergencyState.current = true;
          audioAlerts.playEmergencyCollisionAlert();
          pushAlert('CRITICAL', 'CRITICAL ROAD SAFETY EVENT', 'Pedestrian / Obstacle detected in active ego-path. Automatic Emergency Braking (AEB) initiated.', 'COLLISION_ENGINE');
        } else if (riskSummary.overallLevel !== 'CRITICAL' && prevEmergencyState.current) {
          prevEmergencyState.current = false;
        }

        // Lane departure alerts
        if (updatedLane.departureRisk === 'DEPARTURE_WARNING' && prevDepartureState.current !== 'DEPARTURE_WARNING') {
          prevDepartureState.current = 'DEPARTURE_WARNING';
          audioAlerts.playRumbleStripAlert();
          pushAlert('WARNING', 'Lane Departure Warning (LDW)', 'Vehicle lateral drift exceeds 40cm boundary limit without turn indicator.', 'LANE_DEPARTURE');
        } else if (updatedLane.departureRisk === 'NORMAL') {
          prevDepartureState.current = 'NORMAL';
        }

        // Occlusion alerts
        const occludedItem = updatedEntities.find(e => e.trackStatus === 'occluded');
        if (occludedItem && !prevOcclusionState.current) {
          prevOcclusionState.current = true;
          pushAlert('WARNING', `Object Occlusion: ${occludedItem.id}`, `Track identity maintained via Kalman temporal filter during obstruction by ${occludedItem.occludedBy || 'lead vehicle'}.`, 'OCCLUSION_HANDLER');
        } else if (!occludedItem && prevOcclusionState.current) {
          prevOcclusionState.current = false;
          pushAlert('INFO', 'Track Recovered', 'Visual line-of-sight restored. Re-identification confidence restored.', 'OCCLUSION_HANDLER');
        }

        return updatedEntities;
      });

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, simSpeed, camera, lane, weather, isOcclusionDemoActive, isEmergencyActive, pushAlert]);

  // Controls
  const startSimulation = () => setIsPlaying(true);
  const pauseSimulation = () => setIsPlaying(false);
  const resetSimulation = () => {
    setEntities(createInitialEntities());
    setLane(defaultLane);
    setRisk(defaultRisk);
    setIsOcclusionDemoActive(false);
    setIsEmergencyActive(false);
    setSelectedEntity(null);
    pushAlert('INFO', 'Simulation Reset', 'Traffic state restored to default nominal baseline.', 'CAMERA_CALIBRATION');
  };

  const stepFrame = () => {
    setEntities((current) => {
      const { updatedEntities, riskSummary, updatedLane, metrics: updatedMetrics } = updateSimulationStep(
        current,
        1 / 30,
        camera,
        lane,
        weather,
        isOcclusionDemoActive,
        isEmergencyActive,
        800,
        500,
        50
      );
      setRisk(riskSummary);
      setLane(updatedLane);
      setMetrics(updatedMetrics);
      return updatedEntities;
    });
  };

  const addVehicle = () => {
    setEntities((prev) => [...prev, spawnRandomVehicle(prev)]);
    audioAlerts.playAcquisitionChime();
    pushAlert('INFO', 'Vehicle Spawned', 'New traffic participant entered sensor tracking envelope.', 'PEDESTRIAN_DETECTION');
  };

  const addPedestrian = () => {
    setEntities((prev) => [...prev, spawnRandomPedestrian(prev)]);
    audioAlerts.playAcquisitionChime();
    pushAlert('INFO', 'Pedestrian Detected', 'New pedestrian entity acquired at urban crossing perimeter.', 'PEDESTRIAN_DETECTION');
  };

  const clearEntities = () => {
    setEntities([]);
    setSelectedEntity(null);
  };

  const triggerLaneDeparture = () => {
    setLane((prev) => ({
      ...prev,
      isSimulatingDeparture: !prev.isSimulatingDeparture,
      centerOffsetCm: prev.isSimulatingDeparture ? 0 : 5,
    }));
  };

  const triggerOcclusionDemo = () => {
    setIsOcclusionDemoActive((prev) => !prev);
  };

  const triggerEmergencyScenario = () => {
    setIsEmergencyActive(true);
    setTimeout(() => {
      setIsEmergencyActive(false);
    }, 6000);
  };

  const resetScenarios = () => {
    setIsOcclusionDemoActive(false);
    setIsEmergencyActive(false);
    setLane(defaultLane);
  };

  const calibrateCamera = () => {
    setCamera((prev) => ({ ...prev, isCalibrated: false, calibrationProgress: 10 }));
    let prog = 10;
    const interval = setInterval(() => {
      prog += 20;
      if (prog >= 100) {
        clearInterval(interval);
        setCamera({
          ...defaultCamera,
          isCalibrated: true,
          calibrationProgress: 100,
          reprojectionError: 0.36,
        });
        audioAlerts.playCalibrationSuccess();
        pushAlert('INFO', 'Camera Calibration Complete', 'Perspective homography matrix K computed. Vanishing point locked at Y=44%.', 'CAMERA_CALIBRATION');
      } else {
        setCamera((prev) => ({ ...prev, calibrationProgress: prog }));
      }
    }, 300);
  };

  const dismissAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const clearAlerts = () => {
    setAlerts([]);
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    audioAlerts.setEnabled(next);
  };

  return (
    <VisionSystemContext.Provider
      value={{
        entities,
        signs,
        camera,
        lane,
        risk,
        metrics,
        alerts,
        weather,
        viewportMode,
        isPlaying,
        simSpeed,
        confidenceThreshold,
        iouThreshold,
        isOcclusionDemoActive,
        isEmergencyActive,
        soundEnabled,
        selectedEntity,
        startSimulation,
        pauseSimulation,
        resetSimulation,
        stepFrame,
        addVehicle,
        addPedestrian,
        clearEntities,
        setWeather,
        setViewportMode,
        setSimSpeed,
        setConfidenceThreshold,
        setIouThreshold,
        setSelectedEntity,
        triggerLaneDeparture,
        triggerOcclusionDemo,
        triggerEmergencyScenario,
        resetScenarios,
        calibrateCamera,
        dismissAlert,
        clearAlerts,
        toggleSound,
      }}
    >
      {children}
    </VisionSystemContext.Provider>
  );
};

export const useVisionSystem = () => {
  const context = useContext(VisionSystemContext);
  if (!context) {
    throw new Error('useVisionSystem must be used within a VisionSystemProvider');
  }
  return context;
};
