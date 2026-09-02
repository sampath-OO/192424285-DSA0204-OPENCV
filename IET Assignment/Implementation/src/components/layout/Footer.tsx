import React from 'react';
import { Shield, ExternalLink, Cpu, GitBranch, Terminal, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-navy-950 border-t border-slate-800/80 pt-12 pb-8 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: Brand & Identity */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-400">
                <Shield className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-base tracking-wider text-slate-100">
                VISIONGUARD AI
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-md">
              Autonomous Computer Vision for Safer Roads. An intelligent transportation perception & traffic monitoring platform integrating camera calibration, multi-class neural detection, Kalman multi-object tracking, occlusion recovery, lane departure warnings, and real-time collision risk analysis.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-mono">
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-400">
                React 18 + TS
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-sky-400">
                Vite 6 + Tailwind
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-emerald-400">
                HTML5 Canvas 60 FPS
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-amber-400">
                Recharts Analytics
              </span>
            </div>
          </div>

          {/* Col 2: Core CV Modules */}
          <div className="space-y-2">
            <h4 className="text-slate-200 font-semibold text-xs tracking-wider uppercase">
              Perception Pipeline
            </h4>
            <ul className="space-y-1.5 text-[11px] text-slate-400">
              <li>• Camera Intrinsic Calibration (Homography)</li>
              <li>• Multi-Class Vehicle & Pedestrian Bounding Boxes</li>
              <li>• Optical Road Sign Recognition & Scanning</li>
              <li>• Polynomial Lane Boundary Regression (LDW)</li>
              <li>• Multi-Object Kalman Tracking (MOTA &gt; 91%)</li>
              <li>• Temporal Occlusion Recovery Buffer</li>
              <li>• Time-to-Collision (TTC) Risk Engine</li>
            </ul>
          </div>

          {/* Col 3: Standards & Research */}
          <div className="space-y-2">
            <h4 className="text-slate-200 font-semibold text-xs tracking-wider uppercase">
              Academic & Standards
            </h4>
            <ul className="space-y-1.5 text-[11px] text-slate-400">
              <li>• ISO 26262 Road Vehicles Functional Safety</li>
              <li>• ISO 21448 SOTIF (Safety of the Intended Functionality)</li>
              <li>• Bipartite Hungarian Association</li>
              <li>• Sobel / Canny Gradient Edge Kernels</li>
              <li>• Top-Down Bird&apos;s-Eye View (BEV) Warping</li>
              <li>• Synthetic Audio Telemetry Synthesizer</li>
            </ul>
          </div>
        </div>

        {/* Scientific Transparency Alert Box */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-8">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              <strong className="text-slate-200">Scientific Honesty Notice:</strong> This project is an educational and prototype intelligent transportation system. Metrics labeled as <span className="text-amber-400 font-mono">[SIMULATION / BENCHMARK]</span> represent physics-based kinematic models, while <span className="text-cyan-400 font-mono">[LIVE BROWSER CV]</span> denotes actual browser webcam canvas processing.
            </span>
          </div>
          <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950/60 text-cyan-300 border border-cyan-800">
            PROTOTYPE v1.0
          </span>
        </div>

        {/* Copyright & Disclaimer */}
        <div className="pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[11px]">
          <p>© 2026 VisionGuard AI Research Project. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Developed with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" /> for Advanced Computer Vision & Intelligent Road Safety.
          </p>
        </div>
      </div>
    </footer>
  );
};
