import React from 'react';
import {
  Play,
  Shield,
  Activity,
  Zap,
  Sliders,
  AlertTriangle,
  ArrowDown,
  Eye,
  Crosshair,
  Gauge
} from 'lucide-react';
import { useVisionSystem } from '../../context/VisionSystemContext';
import { PipelineFlow } from './PipelineFlow';

interface HeroSectionProps {
  onLaunchMonitor: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onLaunchMonitor }) => {
  const {
    isPlaying,
    startSimulation,
    pauseSimulation,
    metrics,
    risk,
    triggerEmergencyScenario,
    calibrateCamera
  } = useVisionSystem();

  return (
    <section id="overview" className="relative pt-8 pb-16 overflow-hidden cyber-grid">
      {/* Background ambient lighting glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-cyan-600/15 via-blue-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-10 right-10 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 shadow-glow-cyan text-xs">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              <span className="text-cyan-300 font-mono font-medium tracking-wide">
                NEXT-GEN INTELLIGENT TRANSPORTATION PERCEPTION
              </span>
            </div>

            {/* Main Headings */}
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
                <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">
                  VISIONGUARD AI
                </span>
                <br />
                <span className="text-slate-100 text-3xl sm:text-4xl lg:text-5xl font-bold">
                  Autonomous Computer Vision for Safer Roads
                </span>
              </h1>
              <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-2xl">
                Real-time multi-class object detection, Kalman multi-object tracking, temporal occlusion recovery, polynomial lane departure warnings, and kinematic collision risk estimation in a unified intelligent transportation dashboard.
              </p>
            </div>

            {/* Telemetry Snapshot Cards */}
            <div className="grid grid-cols-3 gap-3 py-2 font-mono">
              <div className="p-3 rounded-xl bg-navy-900/80 border border-slate-800">
                <div className="text-[11px] text-slate-400">DETECTION ACCURACY</div>
                <div className="text-xl font-bold text-cyan-400">{metrics.detectionAccuracy}%</div>
                <div className="text-[10px] text-slate-500">mAP@0.50:0.95</div>
              </div>
              <div className="p-3 rounded-xl bg-navy-900/80 border border-slate-800">
                <div className="text-[11px] text-slate-400">INFERENCE LATENCY</div>
                <div className="text-xl font-bold text-emerald-400">{metrics.latencyMs} ms</div>
                <div className="text-[10px] text-slate-500">@ {metrics.fps} FPS Target</div>
              </div>
              <div className="p-3 rounded-xl bg-navy-900/80 border border-slate-800">
                <div className="text-[11px] text-slate-400">TRACKING MOTA</div>
                <div className="text-xl font-bold text-sky-400">{metrics.motaScore}%</div>
                <div className="text-[10px] text-slate-500">0 ID Switches</div>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="#monitor"
                onClick={onLaunchMonitor}
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-glow-cyan hover:shadow-cyan-500/50 transition-all transform hover:-translate-y-0.5"
              >
                <Eye className="w-4 h-4 text-slate-950" />
                <span>Launch Live Monitoring</span>
              </a>

              <button
                onClick={isPlaying ? pauseSimulation : startSimulation}
                className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm transition-all"
              >
                <Play className={`w-4 h-4 ${isPlaying ? 'text-amber-400' : 'text-emerald-400'}`} />
                <span>{isPlaying ? 'Pause Simulation' : 'Resume Simulation'}</span>
              </button>

              <button
                onClick={triggerEmergencyScenario}
                className="flex items-center gap-2 px-4 py-3.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/40 font-semibold text-xs transition-all"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Simulate Emergency</span>
              </button>
            </div>
          </div>

          {/* Right Hero Graphic: High-Tech Telemetry HUD Card */}
          <div className="lg:col-span-5">
            <div className="relative p-6 rounded-3xl bg-gradient-to-b from-slate-900/90 to-navy-950/90 border border-cyan-500/30 shadow-2xl backdrop-blur-xl">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="font-mono text-xs text-slate-200 font-bold tracking-wider">
                    VISION SYSTEM STATUS HUD
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">
                  ONLINE
                </span>
              </div>

              {/* Graphical Perception Stack */}
              <div className="py-5 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-navy-950/80 border border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <Crosshair className="w-4 h-4 text-cyan-400" />
                    <span className="text-slate-300">Camera Perception Head</span>
                  </div>
                  <span className="text-emerald-400 font-bold">LOCKED (92° FOV)</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-navy-950/80 border border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-sky-400" />
                    <span className="text-slate-300">Active Entities Tracked</span>
                  </div>
                  <span className="text-cyan-400 font-bold">{metrics.totalObjectsTracked} Active</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-navy-950/80 border border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-amber-400" />
                    <span className="text-slate-300">Collision Probability</span>
                  </div>
                  <span className={`font-bold ${risk.collisionProbability > 50 ? 'text-red-400 animate-pulse' : 'text-slate-300'}`}>
                    {risk.collisionProbability}%
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-navy-950/80 border border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-purple-400" />
                    <span className="text-slate-300">Minimum Time-to-Collision</span>
                  </div>
                  <span className="text-emerald-400 font-bold">{risk.ttcSeconds}s</span>
                </div>
              </div>

              {/* Interactive Quick Calibration Button */}
              <div className="pt-2">
                <button
                  onClick={calibrateCamera}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-cyan-300 border border-slate-700 text-xs font-mono transition-all"
                >
                  <Crosshair className="w-4 h-4" />
                  <span>Run Geometric Camera Calibration</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Architecture Flow Ribbon */}
        <div className="mt-14 pt-8 border-t border-slate-800/80">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold tracking-wider text-slate-200 uppercase">
                Interactive End-to-End Perception Pipeline Flow
              </h2>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              Click any stage below to inspect mathematical formulations & tensor specs
            </span>
          </div>

          <PipelineFlow />
        </div>
      </div>
    </section>
  );
};
