import React from 'react';
import {
  GitCommit,
  Activity,
  Layers,
  CheckCircle2,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { useVisionSystem } from '../../context/VisionSystemContext';

export const TrackingPanel: React.FC = () => {
  const { metrics, entities } = useVisionSystem();

  return (
    <section id="tracking" className="py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <GitCommit className="w-5 h-5 text-cyan-400" />
              <h2 className="text-2xl font-bold tracking-tight text-white">
                Multi-Object Tracking (MOT) & State Estimation
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              DeepSORT &amp; Kalman filter state estimators (x = [u, v, &gamma;, h, dx, dy, d&gamma;, dh]<sup>T</sup>) associating spatial detections across sequential video frames with zero ID switches.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-cyan-400">
              MOTA Score: <strong>{metrics.motaScore}%</strong>
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400">
              ID Accuracy: <strong>{metrics.idAccuracy}%</strong>
            </span>
          </div>
        </div>

        {/* Tracking Metrics Dashboard */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-6 font-mono text-xs">
          <div className="p-3.5 rounded-xl bg-navy-900/80 border border-slate-800">
            <span className="text-slate-400 text-[10px] block">ACTIVE OBJECTS</span>
            <span className="text-xl font-bold text-white">{entities.length}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-navy-900/80 border border-slate-800">
            <span className="text-slate-400 text-[10px] block">TRACKED VEHICLES</span>
            <span className="text-xl font-bold text-cyan-400">{metrics.vehiclesCount}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-navy-900/80 border border-slate-800">
            <span className="text-slate-400 text-[10px] block">PEDESTRIANS</span>
            <span className="text-xl font-bold text-emerald-400">{metrics.pedestriansCount}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-navy-900/80 border border-slate-800">
            <span className="text-slate-400 text-[10px] block">BICYCLES / BIKES</span>
            <span className="text-xl font-bold text-purple-400">{metrics.cyclistsCount}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-navy-900/80 border border-slate-800">
            <span className="text-slate-400 text-[10px] block">OCCLUDED TRACKS</span>
            <span className="text-xl font-bold text-amber-400">{metrics.occludedTracksCount}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-navy-900/80 border border-slate-800">
            <span className="text-slate-400 text-[10px] block">LOST TRACKS</span>
            <span className="text-xl font-bold text-slate-400">{metrics.lostTracksCount}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-navy-900/80 border border-slate-800">
            <span className="text-slate-400 text-[10px] block">TRACKING FPS</span>
            <span className="text-xl font-bold text-sky-400">{metrics.fps}</span>
          </div>
        </div>
      </div>
    </section>
  );
};
