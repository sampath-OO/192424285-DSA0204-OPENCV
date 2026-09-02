import React from 'react';
import {
  EyeOff,
  Eye,
  RotateCcw,
  CheckCircle2,
  Info,
  Layers,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { useVisionSystem } from '../../context/VisionSystemContext';

export const OcclusionRecovery: React.FC = () => {
  const {
    isOcclusionDemoActive,
    triggerOcclusionDemo,
    entities
  } = useVisionSystem();

  const car05 = entities.find(e => e.id === 'CAR #05');
  const isOccluded = car05?.trackStatus === 'occluded';
  const isRecovered = car05?.trackStatus === 'recovered';

  return (
    <div className="p-6 rounded-2xl bg-navy-900/90 border border-slate-800 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
            <EyeOff className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">
              Temporal Occlusion Handling & Re-Identification Buffer
            </h3>
            <p className="text-xs text-slate-400">
              Preserves object identity during temporary line-of-sight visual blockages using Kalman motion extrapolation
            </p>
          </div>
        </div>

        <button
          onClick={triggerOcclusionDemo}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs font-mono transition-all ${
            isOcclusionDemoActive
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-glow-amber'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
          }`}
        >
          <EyeOff className="w-3.5 h-3.5" />
          <span>{isOcclusionDemoActive ? 'Disable Occlusion Test' : 'Trigger Occlusion Simulation'}</span>
        </button>
      </div>

      {/* Occlusion Showcase Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Step 1: Visible */}
        <div className={`p-4 rounded-xl border transition-all ${
          !isOccluded && !isRecovered
            ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
            : 'bg-slate-950/60 border-slate-800 text-slate-400'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">
              Stage 1: Direct Line of Sight
            </span>
            <Eye className="w-4 h-4 text-emerald-400" />
          </div>
          <h4 className="text-sm font-bold text-slate-100">CAR #05 (Active Track)</h4>
          <p className="text-xs text-slate-400 mt-1">
            Raw bounding box detected with 95.1% confidence.
          </p>
        </div>

        {/* Step 2: Occluded Behind Bus */}
        <div className={`p-4 rounded-xl border transition-all ${
          isOccluded
            ? 'bg-amber-950/60 border-amber-500 text-amber-200 ring-1 ring-amber-400 animate-pulse'
            : 'bg-slate-950/60 border-slate-800 text-slate-400'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">
              Stage 2: Visual Obstruction
            </span>
            <EyeOff className="w-4 h-4 text-amber-400" />
          </div>
          <h4 className="text-sm font-bold text-amber-300">
            {isOccluded ? 'OBJECT OCCLUDED (BUS #02)' : 'CAR #05 (Occlusion Ready)'}
          </h4>
          <p className="text-xs text-slate-400 mt-1">
            Kalman state extrapolation maintains ghost trajectory buffer ({car05?.ghostConfidence?.toFixed(0) || 81}% track confidence).
          </p>
        </div>

        {/* Step 3: Track Recovered */}
        <div className={`p-4 rounded-xl border transition-all ${
          isRecovered
            ? 'bg-cyan-950/60 border-cyan-400 text-cyan-200 ring-1 ring-cyan-400'
            : 'bg-slate-950/60 border-slate-800 text-slate-400'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">
              Stage 3: Identity Re-Acquisition
            </span>
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          </div>
          <h4 className="text-sm font-bold text-cyan-300">
            {isRecovered ? 'TRACK RECOVERED' : 'Re-Identification Ready'}
          </h4>
          <p className="text-xs text-slate-400 mt-1">
            Zero ID switch penalty: Spatial IoU re-associates entity as CAR #05.
          </p>
        </div>
      </div>

      {/* Scientific Explanation Note */}
      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed flex items-start gap-2.5">
        <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <span>
          “Temporal tracking maintains object identity during short periods of visual obstruction. When a lead vehicle (e.g. BUS #02) occludes a follower (CAR #05), the tracker propagates kinematic state equations without resetting ID numbers.”
        </span>
      </div>
    </div>
  );
};
