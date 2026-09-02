import React from 'react';
import {
  BookOpen,
  CheckCircle2,
  Code2,
  Terminal,
  Cpu,
  Layers,
  GraduationCap,
  Lightbulb,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';

export const ResearchOverview: React.FC = () => {
  return (
    <section id="research" className="py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <GraduationCap className="w-5 h-5 text-cyan-400" />
              <h2 className="text-2xl font-bold tracking-tight text-white">
                Academic Research, Methodology & Viva Guide
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              Comprehensive architectural breakdown, mathematical formulations, and engineering principles underpinning VisionGuard AI for academic project evaluation and viva defense.
            </p>
          </div>

          <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-400">
            Research Standard: IEEE ITS / ISO 26262
          </span>
        </div>

        {/* 3 Core Pillars: Problem, Solution, Key Technologies */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1: Problem Statement */}
          <div className="p-6 rounded-2xl bg-navy-900/90 border border-slate-800 shadow-xl space-y-3">
            <div className="p-2.5 rounded-xl bg-red-500/20 text-red-400 w-fit">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">1. The Problem</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Traditional municipal traffic monitoring relies on passive CCTV recording or manual operator observation. These legacy setups suffer from high detection latency (&gt; 2.5 seconds), catastrophic track loss during vehicle occlusions, failure under adverse weather/night lighting, and lack of real-time Time-to-Collision (TTC) emergency warnings.
            </p>
          </div>

          {/* Pillar 2: Proposed Solution */}
          <div className="p-6 rounded-2xl bg-navy-900/90 border border-slate-800 shadow-xl space-y-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 w-fit">
              <Lightbulb className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">2. VisionGuard AI Solution</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              VisionGuard AI integrates a unified multi-task perception pipeline combining geometric camera calibration, one-stage neural object detection, optical sign OCR, polynomial lane regression, Kalman multi-object tracking with occlusion ghost buffers, and an automated collision risk engine running at 60 FPS.
            </p>
          </div>

          {/* Pillar 3: Practical Applications */}
          <div className="p-6 rounded-2xl bg-navy-900/90 border border-slate-800 shadow-xl space-y-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 w-fit">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">3. Practical Relevance</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Designed for deployment across Smart City Traffic Control Centers, Intelligent Intersection Gantries, Autonomous Shuttles, and Advanced Driver Assistance Systems (ADAS) compliant with ISO 26262 ASIL-B and SOTIF safety standards.
            </p>
          </div>
        </div>

        {/* Mathematical Formulations Section */}
        <div className="p-6 rounded-3xl bg-navy-900/90 border border-slate-800 shadow-2xl space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Code2 className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono">
              Core Mathematical & Algorithmic Formulations
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono">
            {/* Math 1: Camera Intrinsic & Homography */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <h4 className="font-bold text-cyan-400">1. Pinhole Intrinsic Matrix (K) &amp; Projection</h4>
              <div className="text-slate-300 bg-navy-950 p-2.5 rounded border border-slate-900 overflow-x-auto">
                <code>
                  {`s * [u, v, 1]^T = [[fx, 0, cx], [0, fy, cy], [0, 0, 1]] * [R | t] * [Xw, Yw, Zw, 1]^T`}
                </code>
              </div>
              <p className="text-slate-400 text-[11px] font-sans">
                Projects 3D world road coordinates (Xw, Yw, Zw) into 2D pixel coordinates (u, v) with radial distortion modeling.
              </p>
            </div>

            {/* Math 2: Kalman State Vector */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <h4 className="font-bold text-emerald-400">2. Kalman Tracking State Vector</h4>
              <div className="text-slate-300 bg-navy-950 p-2.5 rounded border border-slate-900 overflow-x-auto">
                <code>
                  {`x = [u, v, gamma, h, dx/dt, dy/dt, d(gamma)/dt, dh/dt]^T`}
                </code>
              </div>
              <p className="text-slate-400 text-[11px] font-sans">
                Maintains position, bounding box aspect ratio &gamma;, scale h, and velocity derivatives across occlusion periods.
              </p>
            </div>

            {/* Math 3: Polynomial Lane Fitting */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <h4 className="font-bold text-sky-400">3. Lane Boundary 2nd-Degree Polynomial</h4>
              <div className="text-slate-300 bg-navy-950 p-2.5 rounded border border-slate-900 overflow-x-auto">
                <code>
                  {`x(y) = a*y^2 + b*y + c,   offset = x_center - (x_left(y0) + x_right(y0)) / 2`}
                </code>
              </div>
              <p className="text-slate-400 text-[11px] font-sans">
                Calculates lane curvature and lateral deviation from lane center for Lane Departure Warnings (LDW).
              </p>
            </div>

            {/* Math 4: Time-to-Collision */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <h4 className="font-bold text-purple-400">4. Kinematic Time-to-Collision (TTC)</h4>
              <div className="text-slate-300 bg-navy-950 p-2.5 rounded border border-slate-900 overflow-x-auto">
                <code>
                  {`TTC = d_longitudinal / (v_ego - v_target),   Trigger_AEB <=> TTC < 1.8s`}
                </code>
              </div>
              <p className="text-slate-400 text-[11px] font-sans">
                Predicts impending collision time window to trigger autonomous emergency deceleration (a = -8.5 m/s&sup2;).
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
