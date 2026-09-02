import React from 'react';
import {
  ShieldAlert,
  Octagon,
  Gauge,
  UserCheck,
  TrafficCone,
  AlertTriangle,
  Lightbulb,
  CheckCircle2
} from 'lucide-react';
import { useVisionSystem } from '../../context/VisionSystemContext';
import { SignType } from '../../types/vision';

export const SignRecognition: React.FC = () => {
  const { signs } = useVisionSystem();

  const getSignIcon = (type: SignType) => {
    switch (type) {
      case 'STOP':
        return <Octagon className="w-5 h-5 text-red-400" />;
      case 'SPEED_LIMIT_50':
      case 'SPEED_LIMIT_80':
        return <Gauge className="w-5 h-5 text-sky-400" />;
      case 'PED_CROSSING':
        return <UserCheck className="w-5 h-5 text-amber-400" />;
      case 'TRAFFIC_LIGHT_GREEN':
      case 'TRAFFIC_LIGHT_RED':
        return <Lightbulb className="w-5 h-5 text-emerald-400" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
    }
  };

  return (
    <section id="lanes-signs" className="py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              <h2 className="text-2xl font-bold tracking-tight text-white">
                Optical Road-Sign Recognition & Semantic Classification
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              Convolutional shape detector & OCR semantic classifier identifying regulatory, warning, and traffic control signs with autonomous speed recommendations.
            </p>
          </div>

          <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-400">
            Sign Recognition Accuracy: <strong>98.2%</strong>
          </span>
        </div>

        {/* Road Sign Recognition Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {signs.map((sign) => {
            return (
              <div
                key={sign.id}
                className="relative p-5 rounded-2xl bg-navy-900/90 border border-slate-800 shadow-xl space-y-3 overflow-hidden group hover:border-cyan-500/50 transition-all"
              >
                {/* Active scan radar pulse line */}
                {sign.activeScan && (
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />
                )}

                <div className="flex items-start justify-between">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    {getSignIcon(sign.type)}
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                    RECOGNIZED
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-100">
                    {sign.name}
                  </h3>
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400 mt-1">
                    <span>Confidence:</span>
                    <strong className="text-cyan-400">{sign.confidence}%</strong>
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400 mt-0.5">
                    <span>Distance to Sign:</span>
                    <strong className="text-slate-200">{sign.distanceMeters} m</strong>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 text-[11px] text-slate-300">
                  <span className="text-[10px] font-mono text-slate-500 block uppercase">
                    Ego Action Guidance:
                  </span>
                  <span className="text-sky-300 font-medium">{sign.actionRequired}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
