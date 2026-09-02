import React, { useState, useRef, useEffect } from 'react';
import {
  PRESET_SCENARIOS,
  PresetScenario
} from '../data/presetScenarios';
import {
  drawPhotoBackground,
  applySelectedFilter,
  drawPerceptionOverlays,
  FilterMode,
  OverlayToggles
} from '../utils/photoRenderer';
import { audioAlerts } from '../utils/audioAlerts';
import { exportTelemetryCSV, exportSystemAuditJSON } from '../utils/exportUtils';
import {
  Shield,
  Eye,
  Camera,
  Upload,
  Sliders,
  AlertTriangle,
  Volume2,
  VolumeX,
  FileText,
  Zap,
  RotateCcw,
  Compass,
  Flame,
  Grid,
  Route,
  Target,
  AlertOctagon,
  Download,
  Info,
  CheckCircle2,
  Crosshair
} from 'lucide-react';

export const PhotoDashboard: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Active Scenario & Custom Image State
  const [selectedScenario, setSelectedScenario] = useState<PresetScenario>(PRESET_SCENARIOS[0]);
  const [customImage, setCustomImage] = useState<HTMLImageElement | null>(null);
  const [customFileName, setCustomFileName] = useState<string | null>(null);

  // Active Filter & Overlays
  const [activeFilter, setActiveFilter] = useState<FilterMode>('original');
  const [overlays, setOverlays] = useState<OverlayToggles>({
    showBoundingBoxes: true,
    showLanes: true,
    showSigns: true,
    showCalibrationGrid: false,
    showRiskZones: true,
  });

  // Interactive Scenario States
  const [isLaneDepartureSim, setIsLaneDepartureSim] = useState<boolean>(false);
  const [isOcclusionSim, setIsOcclusionSim] = useState<boolean>(false);
  const [isEmergencyActive, setIsEmergencyActive] = useState<boolean>(false);
  const [isCalibrating, setIsCalibrating] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);

  // Main Canvas Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      // 1. Clear Canvas
      ctx.fillStyle = '#060913';
      ctx.fillRect(0, 0, width, height);

      // 2. Draw Photographic Background / Real Image
      drawPhotoBackground(
        ctx,
        width,
        height,
        selectedScenario,
        customImage,
        isLaneDepartureSim,
        selectedScenario.laneOffsetCm
      );

      // 3. Apply Real Pixel Image Processing Filter (Sobel Edge, BEV, Thermal, Threshold)
      applySelectedFilter(ctx, width, height, activeFilter);

      // 4. Draw Computer Vision Overlays (BBoxes, Lanes, Signs, Grid, Halos)
      drawPerceptionOverlays(
        ctx,
        width,
        height,
        selectedScenario,
        overlays,
        isEmergencyActive,
        isOcclusionSim,
        isLaneDepartureSim,
        selectedEntityId
      );

      // Draw Top HUD Bar
      ctx.fillStyle = 'rgba(6, 9, 19, 0.85)';
      ctx.fillRect(0, 0, width, 28);
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.2)';
      ctx.lineWidth = 1;
      ctx.strokeRect(0, 0, width, 28);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 11px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        customFileName ? `CUSTOM PHOTO // ${customFileName}` : `SCENARIO // ${selectedScenario.title.toUpperCase()}`,
        12,
        14
      );

      ctx.textAlign = 'right';
      ctx.fillStyle = isEmergencyActive ? '#ef4444' : '#10b981';
      ctx.fillText(
        isEmergencyActive ? '🚨 CRITICAL COLLISION THREAT — AEB ACTIVE' : `THREAT LEVEL: ${selectedScenario.riskLevel}`,
        width - 12,
        14
      );

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [
    selectedScenario,
    customImage,
    customFileName,
    activeFilter,
    overlays,
    isLaneDepartureSim,
    isOcclusionSim,
    isEmergencyActive,
    selectedEntityId
  ]);

  // Handle Custom File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setCustomImage(img);
        setCustomFileName(file.name);
        audioAlerts.playAcquisitionChime();
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Interactive Actions
  const handleToggleLaneDeparture = () => {
    const next = !isLaneDepartureSim;
    setIsLaneDepartureSim(next);
    if (next) {
      audioAlerts.playRumbleStripAlert();
    }
  };

  const handleToggleOcclusion = () => {
    setIsOcclusionSim(!isOcclusionSim);
    audioAlerts.playAcquisitionChime();
  };

  const handleTriggerEmergency = () => {
    setIsEmergencyActive(true);
    audioAlerts.playEmergencyCollisionAlert();
    setTimeout(() => {
      setIsEmergencyActive(false);
    }, 5000);
  };

  const handleCalibrateCamera = () => {
    setIsCalibrating(true);
    setOverlays((prev) => ({ ...prev, showCalibrationGrid: true }));
    setTimeout(() => {
      setIsCalibrating(false);
      audioAlerts.playCalibrationSuccess();
    }, 1200);
  };

  const handleResetAll = () => {
    setIsLaneDepartureSim(false);
    setIsOcclusionSim(false);
    setIsEmergencyActive(false);
    setSelectedEntityId(null);
    setActiveFilter('original');
    setCustomImage(null);
    setCustomFileName(null);
  };

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* 1. Header Bar */}
      <header className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-navy-900/90 border border-slate-800 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 shadow-glow-cyan">
            <Shield className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-extrabold tracking-wider bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">
                VISIONGUARD AI
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 rounded">
                REAL-PHOTO CV
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Autonomous Road Safety &amp; Intelligent Traffic Vision Engine
            </p>
          </div>
        </div>

        {/* Header Controls */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={() => {
              const next = !soundEnabled;
              setSoundEnabled(next);
              audioAlerts.setEnabled(next);
            }}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-400"
            title={soundEnabled ? 'Mute Audio Alerts' : 'Unmute Audio Alerts'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={handleResetAll}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-red-400 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </header>

      {/* 2. Scenario Presets & Custom Photo Upload Bar */}
      <section className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400 uppercase tracking-wider font-semibold">
            Select Road Photo Scenario or Upload Real Image:
          </span>
          <span className="text-cyan-400">
            {customFileName ? 'Custom Photo Active' : selectedScenario.title}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {PRESET_SCENARIOS.map((sc) => {
            const isSel = selectedScenario.id === sc.id && !customImage;
            return (
              <button
                key={sc.id}
                onClick={() => {
                  setSelectedScenario(sc);
                  setCustomImage(null);
                  setCustomFileName(null);
                  audioAlerts.playAcquisitionChime();
                }}
                className={`p-2.5 rounded-xl border text-left font-mono text-xs transition-all flex flex-col justify-between ${
                  isSel
                    ? 'bg-cyan-950/70 border-cyan-400 text-cyan-200 shadow-glow-cyan ring-1 ring-cyan-400'
                    : 'bg-navy-900/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-850'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-base">{sc.icon}</span>
                  <span className="text-[10px] text-slate-500">{sc.category}</span>
                </div>
                <div className="font-bold text-[11px] truncate text-white">{sc.title}</div>
              </button>
            );
          })}

          {/* Upload Custom Photo Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className={`p-2.5 rounded-xl border text-left font-mono text-xs transition-all flex flex-col justify-between ${
              customImage
                ? 'bg-emerald-950/70 border-emerald-400 text-emerald-200 shadow-glow-emerald ring-1 ring-emerald-400'
                : 'bg-navy-900/80 border-dashed border-cyan-500/50 text-cyan-300 hover:bg-cyan-950/30'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <Upload className="w-4 h-4 text-cyan-400" />
              <span className="text-[10px] text-slate-400">CUSTOM</span>
            </div>
            <div className="font-bold text-[11px] truncate">
              {customFileName ? 'Photo Loaded' : 'Upload Photo'}
            </div>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </section>

      {/* 3. Main Dashboard: Left Photo Canvas (65%) + Right Telemetry Panel (35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Photo Viewport & CV Filters */}
        <div className="lg:col-span-8 space-y-4">
          <div className="rounded-2xl bg-navy-900/90 border border-slate-800 shadow-2xl overflow-hidden">
            {/* Filter Selector Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-950 border-b border-slate-800 text-xs font-mono">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                <span className="text-slate-400 text-[11px] mr-1">FILTER:</span>
                <button
                  onClick={() => setActiveFilter('original')}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[11px] ${
                    activeFilter === 'original'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 shadow-glow-cyan'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Original Photo</span>
                </button>
                <button
                  onClick={() => setActiveFilter('edge')}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[11px] ${
                    activeFilter === 'edge'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 shadow-glow-cyan'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Sobel Edge (CV)</span>
                </button>
                <button
                  onClick={() => setActiveFilter('bev')}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[11px] ${
                    activeFilter === 'bev'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 shadow-glow-cyan'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Bird&apos;s-Eye (BEV)</span>
                </button>
                <button
                  onClick={() => setActiveFilter('thermal')}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[11px] ${
                    activeFilter === 'thermal'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 shadow-glow-cyan'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>Thermal IR Night</span>
                </button>
              </div>

              {/* Layer Overlay Toggles */}
              <div className="flex items-center gap-1.5 text-[11px]">
                <button
                  onClick={() => setOverlays((p) => ({ ...p, showBoundingBoxes: !p.showBoundingBoxes }))}
                  className={`px-2 py-1 rounded border ${overlays.showBoundingBoxes ? 'bg-cyan-950 text-cyan-300 border-cyan-700' : 'bg-slate-900 text-slate-500 border-slate-800'}`}
                >
                  BBoxes
                </button>
                <button
                  onClick={() => setOverlays((p) => ({ ...p, showLanes: !p.showLanes }))}
                  className={`px-2 py-1 rounded border ${overlays.showLanes ? 'bg-cyan-950 text-cyan-300 border-cyan-700' : 'bg-slate-900 text-slate-500 border-slate-800'}`}
                >
                  Lanes
                </button>
                <button
                  onClick={() => setOverlays((p) => ({ ...p, showSigns: !p.showSigns }))}
                  className={`px-2 py-1 rounded border ${overlays.showSigns ? 'bg-cyan-950 text-cyan-300 border-cyan-700' : 'bg-slate-900 text-slate-500 border-slate-800'}`}
                >
                  Signs
                </button>
                <button
                  onClick={() => setOverlays((p) => ({ ...p, showCalibrationGrid: !p.showCalibrationGrid }))}
                  className={`px-2 py-1 rounded border ${overlays.showCalibrationGrid ? 'bg-cyan-950 text-cyan-300 border-cyan-700' : 'bg-slate-900 text-slate-500 border-slate-800'}`}
                >
                  Grid
                </button>
              </div>
            </div>

            {/* Photo Canvas */}
            <div className="relative aspect-[16/10] w-full bg-slate-950">
              <canvas
                ref={canvasRef}
                width={860}
                height={540}
                className="w-full h-full object-cover cursor-crosshair"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Telemetry, 1-Click Interactive Demos & Detected Objects */}
        <div className="lg:col-span-4 space-y-4">
          {/* Primary Safety Telemetry Card */}
          <div className="p-5 rounded-2xl bg-navy-900/90 border border-slate-800 shadow-xl space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-slate-200 uppercase tracking-wider">
                  Road Safety Telemetry
                </h3>
              </div>
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                isEmergencyActive || selectedScenario.riskLevel === 'HIGH'
                  ? 'bg-red-950 text-red-300 border border-red-800 animate-pulse'
                  : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              }`}>
                {isEmergencyActive ? 'CRITICAL RISK' : `${selectedScenario.riskLevel} RISK`}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">DETECTED OBJECTS</span>
                <span className="text-lg font-bold text-cyan-400">{selectedScenario.detections.length} Target(s)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">LANE OFFSET</span>
                <span className={`text-lg font-bold ${isLaneDepartureSim ? 'text-red-400' : 'text-slate-100'}`}>
                  {isLaneDepartureSim ? '45.0 cm (Drift)' : `${selectedScenario.laneOffsetCm} cm`}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">DETECTION mAP</span>
                <span className="text-lg font-bold text-emerald-400">96.4%</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">CV LATENCY</span>
                <span className="text-lg font-bold text-sky-400">32 ms (60 FPS)</span>
              </div>
            </div>
          </div>

          {/* 1-Click Interactive Scenarios Card */}
          <div className="p-5 rounded-2xl bg-navy-900/90 border border-slate-800 shadow-xl space-y-3 font-mono text-xs">
            <h3 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] pb-2 border-b border-slate-800">
              Interactive Demonstrations
            </h3>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleCalibrateCamera}
                className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 text-cyan-300 text-left transition-colors"
              >
                <Crosshair className="w-3.5 h-3.5 text-cyan-400 mb-1" />
                <div className="font-bold text-[11px]">Calibrate Camera</div>
                <div className="text-[10px] text-slate-500">Vanishing Point Lock</div>
              </button>

              <button
                onClick={handleToggleLaneDeparture}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  isLaneDepartureSim
                    ? 'bg-red-950/70 border-red-500 text-red-200'
                    : 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-sky-300'
                }`}
              >
                <Route className="w-3.5 h-3.5 text-sky-400 mb-1" />
                <div className="font-bold text-[11px]">Lane Departure (LDW)</div>
                <div className="text-[10px] text-slate-500">Trigger Lateral Drift</div>
              </button>

              <button
                onClick={handleToggleOcclusion}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  isOcclusionSim
                    ? 'bg-amber-950/70 border-amber-500 text-amber-200'
                    : 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-amber-300'
                }`}
              >
                <Target className="w-3.5 h-3.5 text-amber-400 mb-1" />
                <div className="font-bold text-[11px]">Occlusion Handling</div>
                <div className="text-[10px] text-slate-500">Ghost Track Buffer</div>
              </button>

              <button
                onClick={handleTriggerEmergency}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  isEmergencyActive
                    ? 'bg-red-950 border-red-500 text-red-200 animate-pulse'
                    : 'bg-red-950/30 hover:bg-red-950/50 border-red-800/80 text-red-400'
                }`}
              >
                <AlertOctagon className="w-3.5 h-3.5 text-red-400 mb-1" />
                <div className="font-bold text-[11px]">Emergency AEB</div>
                <div className="text-[10px] text-slate-500">Immediate Braking</div>
              </button>
            </div>
          </div>

          {/* Detected Objects List */}
          <div className="p-5 rounded-2xl bg-navy-900/90 border border-slate-800 shadow-xl space-y-3 font-mono text-xs">
            <h3 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] pb-2 border-b border-slate-800">
              Objects Detected in Scene ({selectedScenario.detections.length})
            </h3>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {selectedScenario.detections.map((d) => (
                <div
                  key={d.id}
                  onClick={() => setSelectedEntityId(selectedEntityId === d.id ? null : d.id)}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    selectedEntityId === d.id
                      ? 'bg-cyan-950 border-cyan-400 text-cyan-200 ring-1 ring-cyan-400'
                      : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <span className="font-bold text-white mr-1.5">{d.id}</span>
                    <span className="text-slate-400 capitalize">({d.label})</span>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Distance: {d.distanceM}m | Speed: {d.speedKmh} km/h
                    </div>
                  </div>
                  <span className="text-emerald-400 font-bold">{d.confidence.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Compact Academic / Viva Reference Cards */}
      <footer className="p-6 rounded-3xl bg-navy-900/90 border border-slate-800 shadow-xl space-y-4 font-mono text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-cyan-400" />
            <h4 className="font-bold text-slate-200 uppercase tracking-wider">
              Academic Computer Vision Formulations &amp; Standards
            </h4>
          </div>
          <span className="text-[10px] text-slate-500">ISO 26262 ASIL-B / SOTIF</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-[11px]">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <strong className="text-cyan-400 block">1. Camera Intrinsic (K)</strong>
            <p className="text-slate-400">s * [u, v, 1]^T = K * [R | t] * [X, Y, Z, 1]^T</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <strong className="text-emerald-400 block">2. Kalman State Vector</strong>
            <p className="text-slate-400">x = [u, v, gamma, h, dx, dy, d(gamma), dh]^T</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <strong className="text-sky-400 block">3. Polynomial Lane Model</strong>
            <p className="text-slate-400">x(y) = a*y^2 + b*y + c (LDW offset)</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <strong className="text-purple-400 block">4. Time-to-Collision (TTC)</strong>
            <p className="text-slate-400">TTC = d_longitudinal / (v_ego - v_lead)</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
