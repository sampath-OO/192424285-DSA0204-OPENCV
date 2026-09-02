import React from 'react';
import {
  ShieldCheck,
  TrendingUp,
  Zap,
  Clock,
  Eye,
  Route,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { SafetyComparisonMetric } from '../../types/telemetry';

export const SafetyComparison: React.FC = () => {
  const comparisonData: SafetyComparisonMetric[] = [
    {
      feature: 'Hazard Perception & Alert Latency',
      traditionalSystem: '2.50 - 4.00 seconds (Human/CCTV operator delay)',
      visionGuardAI: '0.033 seconds (33 ms real-time compute latency)',
      improvementPercentage: 92,
      metricType: 'time'
    },
    {
      feature: 'Blind-Spot & Occlusion Recovery',
      traditionalSystem: 'Track dropped upon momentary visual obstruction',
      visionGuardAI: 'Kalman temporal filter extrapolates & recovers track IDs',
      improvementPercentage: 88,
      metricType: 'reliability'
    },
    {
      feature: 'Low-Light Pedestrian Protection',
      traditionalSystem: 'Limited optical contrast in night / adverse weather',
      visionGuardAI: 'Multi-spectral LWIR thermal simulation + edge gradients',
      improvementPercentage: 84,
      metricType: 'coverage'
    },
    {
      feature: 'Proactive Lane Departure (LDW)',
      traditionalSystem: 'No predictive lateral trajectory modeling',
      visionGuardAI: 'Polynomial curve fitting (x = ay² + by + c) with acoustic rumble',
      improvementPercentage: 95,
      metricType: 'accuracy'
    },
    {
      feature: 'Kinematic Time-to-Collision (TTC)',
      traditionalSystem: 'Static threshold estimation or post-incident review',
      visionGuardAI: 'Instantaneous multi-target TTC vector with AEB actuation',
      improvementPercentage: 96,
      metricType: 'time'
    }
  ];

  return (
    <section id="safety" className="py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h2 className="text-2xl font-bold tracking-tight text-white">
                Impact on Road Safety & Intelligent Transportation
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              Comparative benchmark evaluating proactive computer-vision-based collision prevention versus conventional legacy traffic monitoring.
            </p>
          </div>

          <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-400">
            [PROTOTYPE BENCHMARK COMPARISON]
          </span>
        </div>

        {/* Comparison Table */}
        <div className="p-6 rounded-3xl bg-navy-900/90 border border-slate-800 shadow-2xl space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pb-3 border-b border-slate-800 text-xs font-mono uppercase tracking-wider text-slate-400 font-bold hidden md:grid">
            <div className="md:col-span-4">Perception Capability</div>
            <div className="md:col-span-4">Traditional Traffic CCTV</div>
            <div className="md:col-span-4 text-cyan-400">VisionGuard AI Autonomous System</div>
          </div>

          <div className="space-y-4">
            {comparisonData.map((item, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 items-center text-xs transition-all hover:border-slate-700"
              >
                {/* Feature Title */}
                <div className="md:col-span-4 space-y-1">
                  <h4 className="font-bold text-slate-100 flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{item.feature}</span>
                  </h4>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full"
                      style={{ width: `${item.improvementPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Legacy System */}
                <div className="md:col-span-4 flex items-start gap-2 text-slate-400">
                  <XCircle className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                  <span>{item.traditionalSystem}</span>
                </div>

                {/* VisionGuard AI */}
                <div className="md:col-span-4 flex items-start gap-2 text-cyan-300 font-semibold bg-cyan-950/30 p-2.5 rounded-xl border border-cyan-800/40">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{item.visionGuardAI}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
