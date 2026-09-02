import { RiskLevel, WeatherType } from './vision';

export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL';

export interface SystemAlert {
  id: string;
  timestamp: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  entityId?: string;
  sourceModule: 'PEDESTRIAN_DETECTION' | 'LANE_DEPARTURE' | 'OCCLUSION_HANDLER' | 'COLLISION_ENGINE' | 'CAMERA_CALIBRATION' | 'WEATHER_MONITOR';
  acknowledged?: boolean;
}

export interface WeatherBenchmarkData {
  condition: WeatherType;
  title: string;
  detectionAccuracy: number;
  trackingAccuracy: number;
  fps: number;
  latencyMs: number;
  riskLevel: RiskLevel;
  contrastRatio: number;
  falsePositiveRate: number;
  notes: string;
}

export interface ArchitectureNodeInfo {
  id: string;
  title: string;
  category: 'SENSOR' | 'CALIBRATION' | 'PREPROCESSING' | 'DETECTION' | 'TRACKING' | 'DECISION' | 'ACTUATION';
  description: string;
  inputs: string[];
  outputs: string[];
  algorithm: string;
  mathFormula?: string;
  latencyBudgetMs: number;
  implementationType: 'LIVE CV / BROWSER' | 'DETERMINISTIC SIMULATION';
}

export interface SafetyComparisonMetric {
  feature: string;
  traditionalSystem: string;
  visionGuardAI: string;
  improvementPercentage: number;
  metricType: 'time' | 'coverage' | 'accuracy' | 'reliability';
}
