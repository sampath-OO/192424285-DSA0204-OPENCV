import React from 'react';
import {
  AlertOctagon,
  Shield,
  Gauge,
  UserX,
  Sliders,
  Car,
  TrendingUp,
  Activity
} from 'lucide-react';
import { useVisionSystem } from '../../context/VisionSystemContext';

export const RiskAnalysis: React.FC = () => {
  const { risk, isEmergencyActive, triggerEmergencyScenario } = useVisionSystem();

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'text-red-400 bg-red-950/60 border-red-500/80 animate-pulse';
      case 'HIGH':
        return 'text-orange-400 bg-orange-950/60 border-orange-500/80';
      case 'MEDIUM':
        return 'text-amber-400 bg-amber-950/60 border-amber-500/80';
      default:
        return 'text-emerald-400 bg-emerald-950/60 border-emerald-500/80';
    }
  };

  return (
    <section id="risk-engine" className="py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <AlertOctagon className="w-5 h-5 text-red-400" />
              <h2 className="text-2xl font-bold tracking-tight text-white">
                Autonomous Traffic Risk & Collision Avoidance Engine
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              Spatial-temporal threat model evaluating multi-target Time-to-Collision (TTC), pedestrian crossing zones, lateral lane drift, and safety margins.
            </p>
          </div>

          <button
            onClick={triggerEmergencyScenario}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs font-mono transition-all ${
              isEmergencyActive
                ? 'bg-red-500 text-white shadow-glow-crimson animate-pulse'
                : 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30'
            }`}
          >
            <AlertOctagon className="w-4 h-4" />
            <span>{isEmergencyActive ? 'AEB ACTIVE — BRAKING' : '🚨 SIMULATE EMERGENCY SCENARIO'}</span>
          </button>
        </div>

        {/* Primary Threat Status Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Card 1: Overall Risk Level */}
          <div className={`p-5 rounded-2xl border shadow-xl flex flex-col justify-between ${getRiskColor(risk.overallLevel)}`}>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono uppercase tracking-wider font-bold">
                  SAFETY STATUS
                </span>
                <Shield className="w-4 h-4" />
              </div>
              <div className="text-2xl font-extrabold font-mono mt-1">
                {risk.overallLevel} RISK
              </div>
            </div>
            <p className="text-[11px] opacity-80 mt-3 font-mono">
              Composite Threat Score: {risk.overallScore}/100
            </p>
          </div>

          {/* Card 2: Time-to-Collision */}
          <div className="p-5 rounded-2xl bg-navy-900/90 border border-slate-800 shadow-xl flex flex-col justify-between font-mono text-xs">
            <div>
              <div className="flex items-center justify-between mb-2 text-slate-400">
                <span className="text-[11px] uppercase tracking-wider">TIME-TO-COLLISION</span>
                <Gauge className="w-4 h-4 text-cyan-400" />
              </div>
              <div className={`text-2xl font-bold ${risk.ttcSeconds < 2.0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {risk.ttcSeconds} sec
              </div>
            </div>
            <div className="text-[10px] text-slate-500 mt-2">
              Critical Threshold: &lt; 1.8s
            </div>
          </div>

          {/* Card 3: Collision Probability */}
          <div className="p-5 rounded-2xl bg-navy-900/90 border border-slate-800 shadow-xl flex flex-col justify-between font-mono text-xs">
            <div>
              <div className="flex items-center justify-between mb-2 text-slate-400">
                <span className="text-[11px] uppercase tracking-wider">COLLISION PROBABILITY</span>
                <TrendingUp className="w-4 h-4 text-amber-400" />
              </div>
              <div className={`text-2xl font-bold ${risk.collisionProbability > 50 ? 'text-red-400 animate-pulse' : 'text-slate-100'}`}>
                {risk.collisionProbability}%
              </div>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
              <div
                className={`h-full rounded-full ${risk.collisionProbability > 50 ? 'bg-red-400' : 'bg-cyan-400'}`}
                style={{ width: `${risk.collisionProbability}%` }}
              />
            </div>
          </div>

          {/* Card 4: Pedestrian Threat */}
          <div className="p-5 rounded-2xl bg-navy-900/90 border border-slate-800 shadow-xl flex flex-col justify-between font-mono text-xs">
            <div>
              <div className="flex items-center justify-between mb-2 text-slate-400">
                <span className="text-[11px] uppercase tracking-wider">PEDESTRIAN RISK</span>
                <UserX className="w-4 h-4 text-emerald-400" />
              </div>
              <div className={`text-2xl font-bold ${risk.pedestrianRiskLevel === 'CRITICAL' ? 'text-red-400' : 'text-emerald-400'}`}>
                {risk.pedestrianRiskLevel}
              </div>
            </div>
            <div className="text-[10px] text-slate-500 mt-2">
              Crosswalk Proximity Zone Lock
            </div>
          </div>

          {/* Card 5: Traffic Density */}
          <div className="p-5 rounded-2xl bg-navy-900/90 border border-slate-800 shadow-xl flex flex-col justify-between font-mono text-xs">
            <div>
              <div className="flex items-center justify-between mb-2 text-slate-400">
                <span className="text-[11px] uppercase tracking-wider">TRAFFIC DENSITY</span>
                <Car className="w-4 h-4 text-sky-400" />
              </div>
              <div className="text-2xl font-bold text-sky-400">
                {risk.trafficDensityRating}
              </div>
            </div>
            <div className="text-[10px] text-slate-500 mt-2">
              Velocity Spread Factor: {risk.speedRiskFactor}
            </div>
          </div>
        </div>

        {/* Emergency Description Banner */}
        {isEmergencyActive && (
          <div className="mt-4 p-4 rounded-2xl bg-red-950/80 border border-red-500/80 text-red-200 text-xs font-mono flex items-center justify-between gap-4 animate-pulse shadow-glow-crimson">
            <div className="flex items-center gap-3">
              <AlertOctagon className="w-5 h-5 text-red-400 shrink-0" />
              <div>
                <strong className="block text-sm font-bold text-white uppercase">
                  🚨 CRITICAL ROAD SAFETY EVENT ACTIVE
                </strong>
                <span>{risk.emergencyDescription}</span>
              </div>
            </div>
            <span className="px-3 py-1 rounded bg-red-900/80 text-white font-bold text-[10px] uppercase shrink-0">
              AEB ACTIVE (-8.5 m/s²)
            </span>
          </div>
        )}
      </div>
    </section>
  );
};
