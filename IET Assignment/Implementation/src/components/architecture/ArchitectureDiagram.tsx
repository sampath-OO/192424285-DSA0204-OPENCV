import React, { useState } from 'react';
import {
  Layers,
  Camera,
  Cpu,
  Scan,
  GitCommit,
  ShieldCheck,
  AlertOctagon,
  ArrowDown,
  Info,
  CheckCircle2,
  Share2
} from 'lucide-react';

export const ArchitectureDiagram: React.FC = () => {
  const [activeLayer, setActiveLayer] = useState<string | null>('detection');

  return (
    <section id="architecture" className="py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Layers className="w-5 h-5 text-cyan-400" />
              <h2 className="text-2xl font-bold tracking-tight text-white">
                System Perception & Decision Architecture
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              Hierarchical data-flow topology connecting sensory acquisition, neural feature extraction, temporal tracking, occlusion resilience, and safety actuation.
            </p>
          </div>

          <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-400">
            Topology: ISO 26262 ASIL-B Pipeline
          </span>
        </div>

        {/* Interactive SVG / CSS Architecture Canvas */}
        <div className="p-8 rounded-3xl bg-navy-900/90 border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col items-center space-y-4 max-w-3xl mx-auto font-mono text-xs">
            {/* Stage 1: Camera Sensor */}
            <div
              onClick={() => setActiveLayer('camera')}
              className={`w-full p-4 rounded-2xl border text-center transition-all cursor-pointer ${
                activeLayer === 'camera'
                  ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 shadow-glow-cyan ring-1 ring-cyan-400'
                  : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-center gap-2 text-sm font-bold text-white mb-1">
                <Camera className="w-4 h-4 text-cyan-400" />
                <span>1. OPTICAL SENSOR INGESTION & CALIBRATION</span>
              </div>
              <p className="text-[11px] text-slate-400">
                1080p RGB / LWIR Thermal Stream • Pinhole Intrinsic Matrix (K) • Distortion Correction
              </p>
            </div>

            {/* Connecting Arrow */}
            <ArrowDown className="w-5 h-5 text-cyan-400 animate-bounce" />

            {/* Stage 2: Vision Processing Parallel Heads */}
            <div
              onClick={() => setActiveLayer('detection')}
              className={`w-full p-5 rounded-2xl border transition-all cursor-pointer ${
                activeLayer === 'detection'
                  ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 shadow-glow-cyan ring-1 ring-cyan-400'
                  : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="text-center font-bold text-sm text-white mb-3 flex items-center justify-center gap-2">
                <Scan className="w-4 h-4 text-cyan-400" />
                <span>2. PARALLEL PERCEPTION HEADS</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[11px]">
                <div className="p-2 rounded-xl bg-navy-950 border border-slate-800 text-cyan-300">
                  <strong className="block text-white">Vehicle Head</strong>
                  Sedans, Buses, Trucks
                </div>
                <div className="p-2 rounded-xl bg-navy-950 border border-slate-800 text-emerald-300">
                  <strong className="block text-white">Pedestrian Head</strong>
                  Adults, Crosswalks
                </div>
                <div className="p-2 rounded-xl bg-navy-950 border border-slate-800 text-amber-300">
                  <strong className="block text-white">Sign Classifier</strong>
                  Stop, Speed Limit
                </div>
                <div className="p-2 rounded-xl bg-navy-950 border border-slate-800 text-purple-300">
                  <strong className="block text-white">Lane Regression</strong>
                  Polynomial Fitting (LDW)
                </div>
              </div>
            </div>

            {/* Connecting Arrow */}
            <ArrowDown className="w-5 h-5 text-cyan-400 animate-bounce" />

            {/* Stage 3: Multi-Object Tracking & Occlusion */}
            <div
              onClick={() => setActiveLayer('tracking')}
              className={`w-full p-4 rounded-2xl border text-center transition-all cursor-pointer ${
                activeLayer === 'tracking'
                  ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 shadow-glow-cyan ring-1 ring-cyan-400'
                  : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-center gap-2 text-sm font-bold text-white mb-1">
                <GitCommit className="w-4 h-4 text-cyan-400" />
                <span>3. TEMPORAL MOT & OCCLUSION RECOVERY BUFFER</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Kalman State Vectors • Bipartite Hungarian IoU Matching • Ghost Track Extrapolation
              </p>
            </div>

            {/* Connecting Arrow */}
            <ArrowDown className="w-5 h-5 text-cyan-400 animate-bounce" />

            {/* Stage 4: Traffic Risk Engine */}
            <div
              onClick={() => setActiveLayer('risk')}
              className={`w-full p-4 rounded-2xl border text-center transition-all cursor-pointer ${
                activeLayer === 'risk'
                  ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 shadow-glow-cyan ring-1 ring-cyan-400'
                  : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-center gap-2 text-sm font-bold text-white mb-1">
                <AlertOctagon className="w-4 h-4 text-red-400" />
                <span>4. KINEMATIC RISK & COLLISION ENGINE</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Time-to-Collision (TTC) • Spatial Proximity Envelope • Weather Braking Multipliers
              </p>
            </div>

            {/* Connecting Arrow */}
            <ArrowDown className="w-5 h-5 text-cyan-400 animate-bounce" />

            {/* Stage 5: Safety Actuation & Alert UI */}
            <div
              onClick={() => setActiveLayer('actuation')}
              className={`w-full p-4 rounded-2xl border text-center transition-all cursor-pointer ${
                activeLayer === 'actuation'
                  ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 shadow-glow-cyan ring-1 ring-cyan-400'
                  : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-center gap-2 text-sm font-bold text-white mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>5. SAFETY DECISION & TELEMETRY ACTUATION</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Simulated AEB Emergency Braking • Synthetic Acoustic Chimes • HUD Telemetry Feed
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
