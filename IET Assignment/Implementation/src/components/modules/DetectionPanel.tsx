import React from 'react';
import {
  Scan,
  Car,
  User,
  Bike,
  ShieldAlert,
  Sliders,
  CheckCircle2,
  Maximize2
} from 'lucide-react';
import { useVisionSystem } from '../../context/VisionSystemContext';

export const DetectionPanel: React.FC = () => {
  const {
    entities,
    metrics,
    confidenceThreshold,
    selectedEntity,
    setSelectedEntity
  } = useVisionSystem();

  const filteredEntities = entities.filter(e => e.confidence >= confidenceThreshold);

  return (
    <section id="detection" className="py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Scan className="w-5 h-5 text-cyan-400" />
              <h2 className="text-2xl font-bold tracking-tight text-white">
                Vehicle & Pedestrian Detection Engine
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              Multi-class neural perception module segmenting dynamic traffic participants with 2D bounding boxes, confidence scoring, distance regression, and velocity vectors.
            </p>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400">Detection Accuracy: </span>
              <strong className="text-cyan-400">{metrics.detectionAccuracy}%</strong>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400">F1 Score: </span>
              <strong className="text-emerald-400">{metrics.f1Score}%</strong>
            </div>
          </div>
        </div>

        {/* Stats Summary Counter Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-2xl bg-navy-900/80 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-slate-400">Vehicles</span>
              <Car className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-extrabold text-white font-mono">{metrics.vehiclesCount}</div>
            <span className="text-[10px] text-slate-500">Sedans, Buses, Trucks</span>
          </div>

          <div className="p-4 rounded-2xl bg-navy-900/80 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-slate-400">Pedestrians</span>
              <User className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-extrabold text-white font-mono">{metrics.pedestriansCount}</div>
            <span className="text-[10px] text-slate-500">Adults, Crossing targets</span>
          </div>

          <div className="p-4 rounded-2xl bg-navy-900/80 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-slate-400">Bicycles & Bikes</span>
              <Bike className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-extrabold text-white font-mono">{metrics.cyclistsCount}</div>
            <span className="text-[10px] text-slate-500">Cyclists, Motorcyclists</span>
          </div>

          <div className="p-4 rounded-2xl bg-navy-900/80 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-slate-400">Traffic Signs</span>
              <ShieldAlert className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-extrabold text-white font-mono">{metrics.signsCount}</div>
            <span className="text-[10px] text-slate-500">Stop, Speed, Signals</span>
          </div>
        </div>

        {/* Live Detected Entities Telemetry List */}
        <div className="p-5 rounded-2xl bg-navy-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
              Live Tracked Objects Stream (Cutoff: &gt;={confidenceThreshold}%)
            </h3>
            <span className="text-xs font-mono text-cyan-400">
              {filteredEntities.length} Entities Visible
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredEntities.map((ent) => {
              const isSel = selectedEntity?.id === ent.id;
              let borderClass = 'border-slate-800 bg-slate-950/60';
              if (isSel) borderClass = 'border-cyan-400 bg-cyan-950/30 ring-1 ring-cyan-400';
              else if (ent.proximityRisk === 'CRITICAL') borderClass = 'border-red-500/60 bg-red-950/20';

              return (
                <div
                  key={ent.id}
                  onClick={() => setSelectedEntity(isSel ? null : ent)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer hover:border-slate-700 ${borderClass}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-cyan-300">
                        {ent.id}
                      </span>
                      <span className="text-xs font-semibold text-slate-200 capitalize">
                        {ent.label}
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      {ent.confidence.toFixed(1)}%
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400">
                    <div>
                      <span>Distance: </span>
                      <strong className="text-slate-200">{ent.distanceMeters}m</strong>
                    </div>
                    <div>
                      <span>Speed: </span>
                      <strong className="text-slate-200">{ent.speedKmh} km/h</strong>
                    </div>
                    <div>
                      <span>Lateral X: </span>
                      <strong className="text-slate-200">{ent.x.toFixed(1)}m</strong>
                    </div>
                    <div>
                      <span>Status: </span>
                      <strong className={ent.trackStatus === 'occluded' ? 'text-amber-400' : 'text-cyan-400'}>
                        {ent.trackStatus.toUpperCase()}
                      </strong>
                    </div>
                  </div>

                  {/* Confidence Progress Bar */}
                  <div className="mt-2.5 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${ent.confidence > 90 ? 'bg-cyan-400' : 'bg-amber-400'}`}
                      style={{ width: `${ent.confidence}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
