import React from 'react';
import {
  Sun,
  CloudRain,
  CloudFog,
  Moon,
  Car,
  Users,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';
import { useVisionSystem } from '../../context/VisionSystemContext';
import { WeatherType } from '../../types/vision';
import { WeatherBenchmarkData } from '../../types/telemetry';

export const WeatherBenchmarks: React.FC = () => {
  const { weather, setWeather } = useVisionSystem();

  const scenarios: WeatherBenchmarkData[] = [
    {
      condition: 'clear',
      title: 'Clear Day (Baseline)',
      detectionAccuracy: 96.8,
      trackingAccuracy: 94.5,
      fps: 31,
      latencyMs: 29,
      riskLevel: 'LOW',
      contrastRatio: 1.0,
      falsePositiveRate: 1.2,
      notes: 'Optimal lighting and road contrast. Highest detection & tracking confidence.'
    },
    {
      condition: 'heavy_traffic',
      title: 'Heavy Traffic Rush',
      detectionAccuracy: 91.3,
      trackingAccuracy: 87.2,
      fps: 25,
      latencyMs: 41,
      riskLevel: 'MEDIUM',
      contrastRatio: 0.92,
      falsePositiveRate: 3.8,
      notes: 'Dense vehicle cluster with frequent occlusions. High Kalman association load.'
    },
    {
      condition: 'night',
      title: 'Night / Low Light',
      detectionAccuracy: 88.4,
      trackingAccuracy: 83.9,
      fps: 29,
      latencyMs: 36,
      riskLevel: 'MEDIUM',
      contrastRatio: 0.54,
      falsePositiveRate: 4.5,
      notes: 'Headlight glare and low-contrast pedestrians. LWIR Thermal head compensates.'
    },
    {
      condition: 'rain',
      title: 'Rain & Wet Asphalt',
      detectionAccuracy: 87.9,
      trackingAccuracy: 81.6,
      fps: 28,
      latencyMs: 38,
      riskLevel: 'MEDIUM',
      contrastRatio: 0.68,
      falsePositiveRate: 5.2,
      notes: 'Road surface reflections and windshield distortion. Edge contrast reduced.'
    },
    {
      condition: 'fog',
      title: 'Dense Fog / Mist',
      detectionAccuracy: 82.6,
      trackingAccuracy: 76.4,
      fps: 23,
      latencyMs: 46,
      riskLevel: 'HIGH',
      contrastRatio: 0.38,
      falsePositiveRate: 7.9,
      notes: 'Severe spatial attenuation. Relies on temporal Kalman track history.'
    }
  ];

  const currentBenchmark = scenarios.find(s => s.condition === weather) || scenarios[0];

  return (
    <section className="py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sun className="w-5 h-5 text-amber-400" />
              <h2 className="text-2xl font-bold tracking-tight text-white">
                Performance Under Adverse Traffic & Weather Conditions
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              Comparative benchmark evaluating degradation of detection mAP, tracking MOTA, compute latency, and false positive rates under complex environmental disturbances.
            </p>
          </div>

          <span className="px-3 py-1.5 rounded-xl bg-amber-950/60 border border-amber-800/80 text-xs font-mono text-amber-300">
            [PROTOTYPE BENCHMARK SUITE]
          </span>
        </div>

        {/* Condition Selector Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
          {scenarios.map((sc) => {
            const isSel = weather === sc.condition;
            return (
              <button
                key={sc.condition}
                onClick={() => setWeather(sc.condition)}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  isSel
                    ? 'bg-cyan-950/70 border-cyan-400 text-cyan-200 shadow-glow-cyan ring-1 ring-cyan-400'
                    : 'bg-navy-900/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-850'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">
                    {sc.condition.replace('_', ' ')}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    sc.riskLevel === 'HIGH' ? 'bg-red-950 text-red-300' : 'bg-slate-950 text-slate-300'
                  }`}>
                    {sc.riskLevel}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white mb-2">{sc.title}</h4>
                <div className="text-[11px] font-mono text-slate-400 space-y-1">
                  <div>mAP: <strong className="text-cyan-400">{sc.detectionAccuracy}%</strong></div>
                  <div>Latency: <strong className="text-emerald-400">{sc.latencyMs} ms</strong></div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Condition Benchmark Comparison Table */}
        <div className="p-6 rounded-2xl bg-navy-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
              Benchmark Profile: {currentBenchmark.title}
            </h3>
            <span className="text-xs font-mono text-cyan-400">
              {currentBenchmark.fps} FPS Target
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 text-[11px] block">DETECTION ACCURACY</span>
              <span className="text-xl font-bold text-cyan-400">{currentBenchmark.detectionAccuracy}%</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 text-[11px] block">TRACKING ACCURACY</span>
              <span className="text-xl font-bold text-sky-400">{currentBenchmark.trackingAccuracy}%</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 text-[11px] block">COMPUTE LATENCY</span>
              <span className="text-xl font-bold text-emerald-400">{currentBenchmark.latencyMs} ms</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 text-[11px] block">FALSE POSITIVE RATE</span>
              <span className="text-xl font-bold text-amber-400">{currentBenchmark.falsePositiveRate}%</span>
            </div>
          </div>

          <p className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <strong className="text-cyan-400">Scenario Behavior: </strong> {currentBenchmark.notes}
          </p>
        </div>
      </div>
    </section>
  );
};
