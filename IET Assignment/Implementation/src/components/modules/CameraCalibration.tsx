import React from 'react';
import {
  Crosshair,
  CheckCircle2,
  RefreshCw,
  Sliders,
  Grid,
  Info,
  Maximize2
} from 'lucide-react';
import { useVisionSystem } from '../../context/VisionSystemContext';

export const CameraCalibration: React.FC = () => {
  const { camera, calibrateCamera } = useVisionSystem();

  return (
    <section id="calibration" className="py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Crosshair className="w-5 h-5 text-cyan-400" />
              <h2 className="text-2xl font-bold tracking-tight text-white">
                Camera Calibration & Geometric Homography
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              Establishes the geometric relationship between the 2D image plane and 3D road coordinates via pinhole camera intrinsic matrix (K) and lens distortion modeling.
            </p>
          </div>

          <button
            onClick={calibrateCamera}
            disabled={!camera.isCalibrated && camera.calibrationProgress < 100}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-glow-cyan transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${!camera.isCalibrated ? 'animate-spin' : ''}`} />
            <span>{!camera.isCalibrated ? 'CALIBRATING...' : 'CALIBRATE CAMERA'}</span>
          </button>
        </div>

        {/* Calibration Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Interactive Calibration Visualizer */}
          <div className="lg:col-span-7 p-6 rounded-2xl bg-navy-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Grid className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Vanishing Point & Perspective Road Plane
                </h3>
              </div>
              <span className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold ${
                camera.isCalibrated
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse'
              }`}>
                {camera.isCalibrated ? 'CALIBRATION COMPLETE' : `CALIBRATING (${camera.calibrationProgress}%)`}
              </span>
            </div>

            {/* Visual Schematic Diagram of Perspective Horizon */}
            <div className="relative aspect-[16/9] w-full rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex flex-col justify-between p-4">
              {/* Sky region */}
              <div className="h-[44%] w-full border-b border-dashed border-cyan-500/60 relative">
                <span className="absolute top-2 left-2 text-[10px] font-mono text-cyan-400/80 bg-slate-900/80 px-2 py-0.5 rounded border border-cyan-800/60">
                  HORIZON PLANE (Y = {Math.round(camera.vanishingPointY * 100)}%)
                </span>
                {/* Vanishing point target reticle */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full border border-cyan-400 animate-ping absolute" />
                  <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-glow-cyan" />
                </div>
              </div>

              {/* Road perspective rays */}
              <div className="h-[56%] w-full relative">
                {/* Perspective lines */}
                <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <line x1="50" y1="0" x2="0" y2="100" stroke="rgba(6, 182, 212, 0.4)" strokeWidth="1" strokeDasharray="3,3" />
                  <line x1="50" y1="0" x2="25" y2="100" stroke="rgba(6, 182, 212, 0.5)" strokeWidth="1.5" />
                  <line x1="50" y1="0" x2="50" y2="100" stroke="rgba(56, 189, 248, 0.4)" strokeWidth="1" strokeDasharray="2,2" />
                  <line x1="50" y1="0" x2="75" y2="100" stroke="rgba(6, 182, 212, 0.5)" strokeWidth="1.5" />
                  <line x1="50" y1="0" x2="100" y2="100" stroke="rgba(6, 182, 212, 0.4)" strokeWidth="1" strokeDasharray="3,3" />
                  {/* Horizontal distance rings */}
                  <line x1="20" y1="30" x2="80" y2="30" stroke="rgba(148, 163, 184, 0.3)" strokeWidth="0.8" />
                  <line x1="10" y1="60" x2="90" y2="60" stroke="rgba(148, 163, 184, 0.3)" strokeWidth="0.8" />
                  <line x1="0" y1="90" x2="100" y2="90" stroke="rgba(148, 163, 184, 0.3)" strokeWidth="0.8" />
                </svg>

                <span className="absolute bottom-2 right-2 text-[10px] font-mono text-emerald-400/80 bg-slate-900/80 px-2 py-0.5 rounded border border-emerald-800/60">
                  ROAD SURFACE PLANE (Z = 0m)
                </span>
              </div>

              {/* Progress Bar during calibration */}
              {!camera.isCalibrated && (
                <div className="absolute inset-0 bg-navy-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 gap-3">
                  <div className="w-full max-w-xs bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-cyan-400 h-full transition-all duration-300"
                      style={{ width: `${camera.calibrationProgress}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-cyan-300">
                    Computing Homography Matrix... {camera.calibrationProgress}%
                  </span>
                </div>
              )}
            </div>

            {/* Explanation Note */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed flex items-start gap-2.5">
              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                “Camera calibration establishes the geometric relationship between the camera sensor and the 3D road scene, improving lane detection accuracy, ground distance estimation, and time-to-collision reliability.”
              </span>
            </div>
          </div>

          {/* Right: Camera Parameters Matrix */}
          <div className="lg:col-span-5 p-6 rounded-2xl bg-navy-900/90 border border-slate-800 shadow-xl space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-slate-200 uppercase tracking-wider">
                Intrinsic Matrix & Extrinsics
              </h3>
              <span className="text-[11px] text-slate-400">Pinhole Model</span>
            </div>

            {/* Matrix Display Box */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-cyan-300">
              <div className="text-[10px] text-slate-500 mb-1">// 3x3 Intrinsic Camera Matrix (K)</div>
              <div>[ {camera.focalLengthX.toFixed(1)} ,    0.00 , {camera.principalPointX.toFixed(1)} ]</div>
              <div>[    0.00 , {camera.focalLengthY.toFixed(1)} , {camera.principalPointY.toFixed(1)} ]</div>
              <div>[    0.00 ,    0.00 ,   1.00 ]</div>
            </div>

            {/* Individual Parameters List */}
            <div className="space-y-2 text-[11px]">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-400">Focal Length (fx, fy)</span>
                <span className="text-slate-100 font-bold">{camera.focalLengthX} px</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-400">Principal Point (cx, cy)</span>
                <span className="text-slate-100 font-bold">({camera.principalPointX}, {camera.principalPointY})</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-400">Camera Mounting Height</span>
                <span className="text-slate-100 font-bold">{camera.cameraHeight} m</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-400">Horizontal / Vertical FOV</span>
                <span className="text-slate-100 font-bold">{camera.fovHorizontal}° / {camera.fovVertical}°</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-400">Radial Distortion (k1, k2)</span>
                <span className="text-slate-100 font-bold">{camera.radialDistortionK1}, {camera.radialDistortionK2}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-400">Reprojection Error (RMSE)</span>
                <span className="text-emerald-400 font-bold">{camera.reprojectionError} px</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
