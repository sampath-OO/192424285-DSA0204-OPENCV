import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import {
  Activity,
  Cpu,
  Clock,
  PieChart as PieIcon,
  BarChart3,
  TrendingUp
} from 'lucide-react';
import { useVisionSystem } from '../../context/VisionSystemContext';

export const PerformanceCharts: React.FC = () => {
  const { metrics, risk, entities } = useVisionSystem();

  // Historical telemetry time-series buffer for dynamic chart updates
  const [telemetryHistory, setTelemetryHistory] = useState<
    { time: string; fps: number; latency: number; detectionTime: number; trackingTime: number; riskScore: number }[]
  >([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = `${now.getMinutes()}:${now.getSeconds() < 10 ? '0' : ''}${now.getSeconds()}`;

      setTelemetryHistory((prev) => {
        const next = [
          ...prev.slice(-14),
          {
            time: timeStr,
            fps: metrics.fps + (Math.random() * 2 - 1),
            latency: metrics.latencyMs + (Math.random() * 3 - 1.5),
            detectionTime: metrics.detectionTimeMs + (Math.random() * 2 - 1),
            trackingTime: metrics.trackingTimeMs + (Math.random() * 1 - 0.5),
            riskScore: risk.overallScore + (Math.random() * 2 - 1),
          },
        ];
        return next;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [metrics, risk]);

  // Object Class Breakdown Data for Donut Chart
  const classDistData = [
    { name: 'Vehicles', value: Math.max(1, metrics.vehiclesCount), color: '#38bdf8' },
    { name: 'Pedestrians', value: Math.max(1, metrics.pedestriansCount), color: '#10b981' },
    { name: 'Bicycles', value: Math.max(1, metrics.cyclistsCount), color: '#a855f7' },
    { name: 'Signs', value: 4, color: '#f59e0b' },
  ];

  // Pipeline Latency Breakdown
  const latencyBreakdownData = [
    { stage: 'Preprocessing', time: 4.2, budget: 6.0 },
    { stage: 'Detection Head', time: metrics.detectionTimeMs, budget: 20.0 },
    { stage: 'MOT Tracking', time: metrics.trackingTimeMs, budget: 10.0 },
    { stage: 'Risk Engine', time: metrics.riskEngineTimeMs, budget: 5.0 },
    { stage: 'Rendering', time: metrics.renderTimeMs, budget: 5.0 },
  ];

  return (
    <section id="analytics" className="py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-5 h-5 text-cyan-400" />
              <h2 className="text-2xl font-bold tracking-tight text-white">
                Real-Time Performance Analytics & Benchmarks
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              Live telemetry monitoring inference throughput (FPS), hardware compute latency breakdown, tracking precision/recall curves, and class distributions.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-cyan-400">
              Avg Latency: <strong>{metrics.latencyMs} ms</strong>
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400">
              Target: <strong>60 FPS / 16.6ms</strong>
            </span>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 font-mono text-xs">
          <div className="p-4 rounded-2xl bg-navy-900/80 border border-slate-800">
            <span className="text-slate-400 text-[11px] block">PRECISION</span>
            <span className="text-2xl font-bold text-cyan-400">{metrics.detectionPrecision}%</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">True Positives Ratio</span>
          </div>

          <div className="p-4 rounded-2xl bg-navy-900/80 border border-slate-800">
            <span className="text-slate-400 text-[11px] block">RECALL</span>
            <span className="text-2xl font-bold text-sky-400">{metrics.detectionRecall}%</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Target Coverage</span>
          </div>

          <div className="p-4 rounded-2xl bg-navy-900/80 border border-slate-800">
            <span className="text-slate-400 text-[11px] block">F1 SCORE</span>
            <span className="text-2xl font-bold text-emerald-400">{metrics.f1Score}%</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Harmonic Mean</span>
          </div>

          <div className="p-4 rounded-2xl bg-navy-900/80 border border-slate-800">
            <span className="text-slate-400 text-[11px] block">MOTA TRACKING</span>
            <span className="text-2xl font-bold text-purple-400">{metrics.motaScore}%</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Multi-Object Accuracy</span>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Chart 1: Live FPS & Total Latency Over Time */}
          <div className="lg:col-span-8 p-6 rounded-2xl bg-navy-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                  Real-Time Throughput (FPS) & Compute Latency (ms)
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-500">Live 1.2s Poll</span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={telemetryHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorFps" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorLat" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} domain={[0, 60]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#1e293b', borderRadius: '0.75rem', fontSize: '11px', fontFamily: 'JetBrains Mono' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'JetBrains Mono', paddingTop: '8px' }} />
                  <Area type="monotone" dataKey="fps" name="Throughput (FPS)" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorFps)" />
                  <Area type="monotone" dataKey="latency" name="Latency (ms)" stroke="#38bdf8" strokeWidth={2} fillOpacity={1} fill="url(#colorLat)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Object Class Distribution Donut */}
          <div className="lg:col-span-4 p-6 rounded-2xl bg-navy-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                  Object Class Distribution
                </h3>
              </div>
              <span className="text-[10px] font-mono text-cyan-400">{entities.length} Total</span>
            </div>

            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={classDistData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {classDistData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#1e293b', borderRadius: '0.75rem', fontSize: '11px', fontFamily: 'JetBrains Mono' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '10px', fontFamily: 'JetBrains Mono' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Pipeline Stage Latency Breakdown (Bar) */}
          <div className="lg:col-span-12 p-6 rounded-2xl bg-navy-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                  Pipeline Stage Compute Time vs Latency Budget (ms)
                </h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400">Total: {metrics.latencyMs} ms / 45 ms Budget</span>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={latencyBreakdownData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="stage" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} unit="ms" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#1e293b', borderRadius: '0.75rem', fontSize: '11px', fontFamily: 'JetBrains Mono' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'JetBrains Mono', paddingTop: '8px' }} />
                  <Bar dataKey="time" name="Actual Time (ms)" fill="#06b6d4" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="budget" name="Budget Limit (ms)" fill="#334155" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
