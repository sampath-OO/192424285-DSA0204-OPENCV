import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  StepForward,
  PlusCircle,
  UserPlus,
  Trash2,
  Sun,
  CloudRain,
  CloudFog,
  Moon,
  Car,
  Sliders,
  Gauge
} from 'lucide-react';
import { useVisionSystem } from '../../context/VisionSystemContext';
import { WeatherType } from '../../types/vision';

export const ControlDeck: React.FC = () => {
  const {
    isPlaying,
    startSimulation,
    pauseSimulation,
    resetSimulation,
    stepFrame,
    simSpeed,
    setSimSpeed,
    addVehicle,
    addPedestrian,
    clearEntities,
    weather,
    setWeather,
    confidenceThreshold,
    setConfidenceThreshold,
    iouThreshold,
    setIouThreshold,
    entities
  } = useVisionSystem();

  const weatherOptions: { id: WeatherType; label: string; icon: React.ReactNode }[] = [
    { id: 'clear', label: 'Clear Day', icon: <Sun className="w-3.5 h-3.5 text-amber-400" /> },
    { id: 'heavy_traffic', label: 'Heavy Traffic', icon: <Car className="w-3.5 h-3.5 text-cyan-400" /> },
    { id: 'rain', label: 'Rain & Wet Road', icon: <CloudRain className="w-3.5 h-3.5 text-sky-400" /> },
    { id: 'fog', label: 'Dense Fog', icon: <CloudFog className="w-3.5 h-3.5 text-slate-400" /> },
    { id: 'night', label: 'Night / Low Light', icon: <Moon className="w-3.5 h-3.5 text-purple-400" /> },
  ];

  return (
    <div className="p-4 rounded-2xl bg-navy-900/90 border border-slate-800 shadow-xl space-y-4">
      {/* Top Controls: Playback & Speed */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        {/* Playback Buttons */}
        <div className="flex items-center gap-1.5 font-mono text-xs">
          <button
            onClick={isPlaying ? pauseSimulation : startSimulation}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
              isPlaying
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 shadow-glow-emerald'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'PAUSE' : 'START'}</span>
          </button>

          <button
            onClick={stepFrame}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-cyan-400 border border-slate-700 transition-colors"
            title="Step Forward 1 Frame"
          >
            <StepForward className="w-4 h-4" />
          </button>

          <button
            onClick={resetSimulation}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-red-400 border border-slate-700 transition-colors"
            title="Reset Simulation to Initial State"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESET</span>
          </button>
        </div>

        {/* Sim Speed Selector */}
        <div className="flex items-center gap-1 font-mono text-xs">
          <span className="text-slate-400 text-[11px] mr-1">SPEED:</span>
          {[0.5, 1.0, 2.0].map((s) => (
            <button
              key={s}
              onClick={() => setSimSpeed(s)}
              className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${
                simSpeed === s
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/60'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>

        {/* Spawner Buttons */}
        <div className="flex items-center gap-1.5 text-xs font-mono">
          <button
            onClick={addVehicle}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-sky-950/60 text-sky-300 border border-sky-800/80 hover:bg-sky-900/60 transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ Vehicle</span>
          </button>

          <button
            onClick={addPedestrian}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-950/60 text-emerald-300 border border-emerald-800/80 hover:bg-emerald-900/60 transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Pedestrian</span>
          </button>

          <button
            onClick={clearEntities}
            className="p-1.5 rounded-lg bg-slate-900 text-slate-500 hover:text-red-400 border border-slate-800 transition-colors"
            title="Clear all tracked entities"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Middle: Weather Condition Selector */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-300 tracking-wider uppercase text-[11px]">
            Environment & Traffic Scenario
          </span>
          <span className="font-mono text-[10px] text-cyan-400">
            Current: {weather.toUpperCase()}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {weatherOptions.map((opt) => {
            const isSel = weather === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setWeather(opt.id)}
                className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-mono transition-all ${
                  isSel
                    ? 'bg-cyan-950/70 border-cyan-400 text-cyan-200 shadow-glow-cyan'
                    : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                {opt.icon}
                <span className="truncate">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom: Sliders for Confidence & NMS Thresholds */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800 text-xs font-mono">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-slate-400 text-[11px]">Confidence Cutoff:</span>
            <span className="text-cyan-400 font-bold">{confidenceThreshold}%</span>
          </div>
          <input
            type="range"
            min="50"
            max="95"
            value={confidenceThreshold}
            onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-slate-400 text-[11px]">NMS IoU Threshold:</span>
            <span className="text-cyan-400 font-bold">{iouThreshold}%</span>
          </div>
          <input
            type="range"
            min="20"
            max="80"
            value={iouThreshold}
            onChange={(e) => setIouThreshold(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>
      </div>
    </div>
  );
};
