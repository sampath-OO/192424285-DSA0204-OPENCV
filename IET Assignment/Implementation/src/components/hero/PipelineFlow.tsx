import React, { useState } from 'react';
import {
  Camera,
  Layers,
  Scan,
  GitCommit,
  AlertOctagon,
  Bell,
  ArrowRight,
  Info,
  X,
  Cpu,
  CheckCircle2
} from 'lucide-react';
import { ArchitectureNodeInfo } from '../../types/telemetry';

const pipelineStages: ArchitectureNodeInfo[] = [
  {
    id: 'stage-1',
    title: 'Camera Ingestion & Calibration',
    category: 'CALIBRATION',
    description: 'Captures raw frame buffers, corrects lens radial distortion, estimates road plane horizon, and computes the 3x3 Intrinsic Matrix K and Homography projection matrix.',
    inputs: ['Raw RGB Video Feed (1080p @ 30/60 FPS)'],
    outputs: ['Undistorted Frame', 'Homography Warp Matrix (H)', 'Vanishing Point (u0, v0)'],
    algorithm: 'Zhang’s Method / Pinhole Camera Model with Radial Distortion Correction',
    mathFormula: 'K = [[fx, 0, cx], [0, fy, cy], [0, 0, 1]],  x_distorted = x(1 + k1*r^2 + k2*r^4)',
    latencyBudgetMs: 2.5,
    implementationType: 'LIVE CV / BROWSER',
  },
  {
    id: 'stage-2',
    title: 'Preprocessing & Edge Extraction',
    category: 'PREPROCESSING',
    description: 'Applies color space conversions (RGB -> Grayscale/HSV), Sobel gradient convolutions for road edge detection, contrast normalization, and Region-of-Interest (RoI) cropping.',
    inputs: ['Undistorted RGB Frame'],
    outputs: ['Edge Gradient Map', 'RoI Feature Tensor (1x3x640x640)'],
    algorithm: 'Sobel 3x3 Derivative Convolutions & Bilinear Color Normalization',
    mathFormula: 'G_x = [[-1,0,1],[-2,0,2],[-1,0,1]] * I,  |G| = sqrt(G_x^2 + G_y^2)',
    latencyBudgetMs: 4.0,
    implementationType: 'LIVE CV / BROWSER',
  },
  {
    id: 'stage-3',
    title: 'Multi-Head Neural Detection',
    category: 'DETECTION',
    description: 'Parallel perception heads detecting vehicles (Sedans, SUVs, Buses, Trucks), pedestrians with proximity radii, cyclists, road signs (Stop, Speed Limit), and polynomial lane curves.',
    inputs: ['Feature Map Tensor'],
    outputs: ['Bounding Boxes [x, y, w, h]', 'Class Probabilities', 'Lane Polynomial Coeffs [a, b, c]'],
    algorithm: 'One-Stage Neural Object Detector + Non-Maximum Suppression (IoU >= 0.45)',
    mathFormula: 'IoU(A, B) = Area(A ∩ B) / Area(A ∪ B),  Lane(y) = a*y^2 + b*y + c',
    latencyBudgetMs: 14.5,
    implementationType: 'LIVE CV / BROWSER',
  },
  {
    id: 'stage-4',
    title: 'Kalman MOT & Occlusion Buffer',
    category: 'TRACKING',
    description: 'Maintains persistent temporal track IDs across sequential frames using Kalman filter kinematic state estimation [x, y, vx, vy] and bipartite Hungarian association. Prevents track drops during visual occlusion.',
    inputs: ['Current Frame Detections', 'Historical Track State Vectors'],
    outputs: ['Track IDs (CAR #01, PED #03)', 'Motion Vectors', 'Occluded Ghost Trajectories'],
    algorithm: 'Kalman Filter State Prediction & Optimal Hungarian Bipartite Matching',
    mathFormula: 'x_k|k-1 = F*x_k-1 + B*u,  P_k|k-1 = F*P_k-1*F^T + Q',
    latencyBudgetMs: 6.2,
    implementationType: 'DETERMINISTIC SIMULATION',
  },
  {
    id: 'stage-5',
    title: 'Traffic Risk & Collision Engine',
    category: 'DECISION',
    description: 'Computes instantaneous Time-to-Collision (TTC) for all active threats, measures lateral lane departure drift, evaluates weather-adjusted stopping distances, and flags safety violations.',
    inputs: ['Track Vectors', 'Relative Velocities (Δv)', 'Lane Offset (Δd)', 'Weather Profile'],
    outputs: ['Threat Severity Score (0-100)', 'TTC (seconds)', 'Proximity Hazard Zones'],
    algorithm: 'Kinematic Time-to-Collision (TTC) & Multi-Factor Spatial Risk Matrix',
    mathFormula: 'TTC = d_longitudinal / (v_ego - v_lead),  Risk = w1*(1/TTC) + w2*(1/d_ped) + w3*Δlane',
    latencyBudgetMs: 2.8,
    implementationType: 'DETERMINISTIC SIMULATION',
  },
  {
    id: 'stage-6',
    title: 'Safety Decision & Actuation',
    category: 'ACTUATION',
    description: 'Dispatches real-time acoustic/visual telemetry alerts, executes simulated Automatic Emergency Braking (AEB), and broadcasts proactive driver assistance guidance.',
    inputs: ['Risk Matrix', 'Collision Probability'],
    outputs: ['Acoustic Alert Chimes', 'HUD Warning Overlays', 'AEB Braking Command'],
    algorithm: 'Deterministic ISO 26262 / SOTIF Safety Threshold State Machine',
    mathFormula: 'if (TTC < 1.8s && Proximity == CRITICAL) -> Engage_AEB(Decel = -8.5 m/s^2)',
    latencyBudgetMs: 1.0,
    implementationType: 'LIVE CV / BROWSER',
  }
];

export const PipelineFlow: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<ArchitectureNodeInfo | null>(null);

  return (
    <div className="w-full">
      {/* Interactive Flow Nodes Bar */}
      <div className="relative grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 p-3 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-md">
        {pipelineStages.map((stage, idx) => {
          const isSelected = selectedNode?.id === stage.id;
          const icons = [
            <Camera key="1" className="w-4 h-4" />,
            <Layers key="2" className="w-4 h-4" />,
            <Scan key="3" className="w-4 h-4" />,
            <GitCommit key="4" className="w-4 h-4" />,
            <AlertOctagon key="5" className="w-4 h-4" />,
            <Bell key="6" className="w-4 h-4" />
          ];

          return (
            <div key={stage.id} className="relative group">
              <button
                onClick={() => setSelectedNode(stage)}
                className={`w-full text-left p-3 rounded-xl border transition-all duration-200 h-full flex flex-col justify-between ${
                  isSelected
                    ? 'bg-cyan-950/60 border-cyan-400 text-cyan-200 shadow-glow-cyan ring-1 ring-cyan-400'
                    : 'bg-navy-900/90 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/80'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400 group-hover:text-cyan-400'}`}>
                      {icons[idx]}
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">
                      0{idx + 1}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold tracking-tight text-slate-100 line-clamp-1 mb-1">
                    {stage.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-snug">
                    {stage.category} • {stage.latencyBudgetMs}ms
                  </p>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-cyan-400">
                  <span>Inspect</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {/* Selected Node Detailed Modal / Slide-out */}
      {selectedNode && (
        <div className="mt-4 p-5 rounded-2xl bg-navy-900/95 border border-cyan-500/40 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-100">
                    {selectedNode.title}
                  </h3>
                  <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                    {selectedNode.category}
                  </span>
                  <span className={`px-2 py-0.5 text-[10px] font-mono rounded ${
                    selectedNode.implementationType.includes('LIVE')
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}>
                    {selectedNode.implementationType}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Latency Budget: <strong className="text-cyan-400 font-mono">{selectedNode.latencyBudgetMs} ms</strong> • ISO 26262 Perception Layer
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-xs">
            <div className="md:col-span-2 space-y-3">
              <div>
                <h5 className="font-semibold text-slate-300 uppercase tracking-wider text-[11px] mb-1">
                  Functional Role
                </h5>
                <p className="text-slate-400 leading-relaxed">
                  {selectedNode.description}
                </p>
              </div>

              <div>
                <h5 className="font-semibold text-slate-300 uppercase tracking-wider text-[11px] mb-1">
                  Core Algorithm & Logic
                </h5>
                <p className="text-cyan-300 font-mono bg-slate-950 p-2 rounded-lg border border-slate-800 text-[11px]">
                  {selectedNode.algorithm}
                </p>
              </div>

              {selectedNode.mathFormula && (
                <div>
                  <h5 className="font-semibold text-slate-300 uppercase tracking-wider text-[11px] mb-1">
                    Mathematical Formulation
                  </h5>
                  <div className="p-2.5 rounded-lg bg-navy-950 border border-slate-800 text-sky-300 font-mono text-[11px] overflow-x-auto">
                    <code>{selectedNode.mathFormula}</code>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3 border-t md:border-t-0 md:border-l border-slate-800 md:pl-4 pt-3 md:pt-0">
              <div>
                <h5 className="font-semibold text-slate-300 uppercase tracking-wider text-[11px] mb-1.5">
                  Tensor / Data Inputs
                </h5>
                <ul className="space-y-1">
                  {selectedNode.inputs.map((inp, idx) => (
                    <li key={idx} className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{inp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h5 className="font-semibold text-slate-300 uppercase tracking-wider text-[11px] mb-1.5">
                  Output Signals
                </h5>
                <ul className="space-y-1">
                  {selectedNode.outputs.map((out, idx) => (
                    <li key={idx} className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>{out}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
