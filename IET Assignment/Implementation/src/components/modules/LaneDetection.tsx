import React from 'react';
import {
  Route,
  Sliders,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Compass
} from 'lucide-react';
import { useVisionSystem } from '../../context/VisionSystemContext';

export const LaneDetection: React.FC = () => {
  const { lane, triggerLaneDeparture } = useVisionSystem();

  const getDepartureRiskColor = () => {
    switch (lane.departureRisk) {
      case 'DEPARTURE_WARNING':
        return 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse';
      case 'DRIFTING':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      default:
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-navy-900/90 border border-slate-800 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
            <Route className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">
              Lane Boundary & Road Marking Analysis
            </h3>
            <p className="text-xs text-slate-400">
              2nd-degree polynomial curve fitting (x(y) = ay&sup2; + by + c) with Lane Departure Warning (LDW)
            </p>
          </div>
        </div>

        <button
          onClick={triggerLaneDeparture}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs font-mono transition-all ${
            lane.isSimulatingDeparture
              ? 'bg-red-500/20 text-red-300 border border-red-500/50 shadow-glow-crimson'
              : 'bg-sky-500/20 text-sky-300 border border-sky-500/40 hover:bg-sky-500/30'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>{lane.isSimulatingDeparture ? 'Cancel Departure Simulation' : 'Simulate Lane Departure'}</span>
        </button>
      </div>

      {/* Telemetry Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
          <div className="text-[11px] text-slate-400">CURRENT LANE</div>
          <div className="text-base font-bold text-cyan-400">LANE 02 (Ego)</div>
          <div className="text-[10px] text-slate-500">Center Corridor</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
          <div className="text-[11px] text-slate-400">LANE CONFIDENCE</div>
          <div className="text-base font-bold text-emerald-400">{lane.confidence}%</div>
          <div className="text-[10px] text-slate-500">Dual Boundary Lock</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
          <div className="text-[11px] text-slate-400">LATERAL OFFSET</div>
          <div className={`text-base font-bold ${Math.abs(lane.centerOffsetCm) > 30 ? 'text-red-400' : 'text-slate-100'}`}>
            {lane.centerOffsetCm.toFixed(1)} cm
          </div>
          <div className="text-[10px] text-slate-500">From Lane Center</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
          <div className="text-[11px] text-slate-400">DEPARTURE RISK</div>
          <div className={`inline-block px-2 py-0.5 rounded text-xs font-bold border mt-0.5 ${getDepartureRiskColor()}`}>
            {lane.departureRisk}
          </div>
        </div>
      </div>

      {/* Visual Lateral Drift Bar */}
      <div className="space-y-1.5 font-mono text-xs">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>[LEFT BOUNDARY]</span>
          <span className="text-slate-200">LANE CENTER (0.0 cm)</span>
          <span>[RIGHT BOUNDARY]</span>
        </div>
        <div className="relative w-full h-4 bg-slate-950 rounded-full border border-slate-800 overflow-hidden">
          {/* Center line marker */}
          <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-slate-700" />
          {/* Safe zone boundary */}
          <div className="absolute top-0 bottom-0 left-[35%] right-[35%] bg-emerald-500/10 border-x border-emerald-500/30" />
          {/* Ego-vehicle indicator cursor */}
          <div
            className={`absolute top-0.5 bottom-0.5 w-3 rounded-full transition-all duration-150 transform -translate-x-1/2 ${
              lane.departureRisk === 'DEPARTURE_WARNING'
                ? 'bg-red-400 shadow-glow-crimson animate-ping'
                : 'bg-cyan-400 shadow-glow-cyan'
            }`}
            style={{
              left: `${Math.max(5, Math.min(95, 50 + (lane.centerOffsetCm / 60) * 45))}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
};
