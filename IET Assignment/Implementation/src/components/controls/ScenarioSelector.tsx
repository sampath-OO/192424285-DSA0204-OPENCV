import React from 'react';
import {
  AlertTriangle,
  EyeOff,
  Sliders,
  Crosshair,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { useVisionSystem } from '../../context/VisionSystemContext';

export const ScenarioSelector: React.FC = () => {
  const {
    isEmergencyActive,
    triggerEmergencyScenario,
    isOcclusionDemoActive,
    triggerOcclusionDemo,
    lane,
    triggerLaneDeparture,
    calibrateCamera,
    camera,
    resetScenarios
  } = useVisionSystem();

  return (
    <div className="p-4 rounded-2xl bg-navy-900/90 border border-slate-800 shadow-xl space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            One-Click Evaluation Scenarios
          </h3>
        </div>
        {(isEmergencyActive || isOcclusionDemoActive || lane.isSimulatingDeparture) && (
          <button
            onClick={resetScenarios}
            className="text-[11px] font-mono text-cyan-400 hover:underline"
          >
            Reset Scenarios
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {/* Scenario 1: Emergency Collision */}
        <button
          onClick={triggerEmergencyScenario}
          className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
            isEmergencyActive
              ? 'bg-red-950/80 border-red-500 text-red-200 shadow-glow-crimson ring-1 ring-red-400 animate-pulse'
              : 'bg-slate-900/80 border-slate-800 hover:border-red-500/50 hover:bg-slate-850 text-slate-300'
          }`}
        >
          <div className="p-2 rounded-lg bg-red-500/20 text-red-400 shrink-0 mt-0.5">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-100">
              Emergency AEB
            </h4>
            <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
              Pedestrian steps into ego-path; TTC &lt; 1.8s trigger.
            </p>
          </div>
        </button>

        {/* Scenario 2: Occlusion Handling */}
        <button
          onClick={triggerOcclusionDemo}
          className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
            isOcclusionDemoActive
              ? 'bg-amber-950/80 border-amber-500 text-amber-200 shadow-amber-500/20 ring-1 ring-amber-400'
              : 'bg-slate-900/80 border-slate-800 hover:border-amber-500/50 hover:bg-slate-850 text-slate-300'
          }`}
        >
          <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
            <EyeOff className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-100">
              Occlusion Test
            </h4>
            <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
              Car #05 hides behind Bus #02; Kalman ghost track buffer.
            </p>
          </div>
        </button>

        {/* Scenario 3: Lane Departure */}
        <button
          onClick={triggerLaneDeparture}
          className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
            lane.isSimulatingDeparture
              ? 'bg-sky-950/80 border-sky-400 text-sky-200 ring-1 ring-sky-400'
              : 'bg-slate-900/80 border-slate-800 hover:border-sky-500/50 hover:bg-slate-850 text-slate-300'
          }`}
        >
          <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400 shrink-0 mt-0.5">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-100">
              Lane Drift (LDW)
            </h4>
            <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
              Lateral offset exceeds 40cm boundary limit with alert.
            </p>
          </div>
        </button>

        {/* Scenario 4: Camera Calibration */}
        <button
          onClick={calibrateCamera}
          className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
            !camera.isCalibrated
              ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 shadow-glow-cyan'
              : 'bg-slate-900/80 border-slate-800 hover:border-cyan-500/50 hover:bg-slate-850 text-slate-300'
          }`}
        >
          <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 shrink-0 mt-0.5">
            <Crosshair className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-100">
              Calibrate Camera
            </h4>
            <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
              {camera.isCalibrated ? 'Status: Calibrated (K locked)' : `Calibrating: ${camera.calibrationProgress}%`}
            </p>
          </div>
        </button>
      </div>
    </div>
  );
};
