import React from 'react';
import {
  Eye,
  Compass,
  Zap,
  Flame,
  Grid,
  Route,
  Target,
  Sliders
} from 'lucide-react';
import { ViewportMode } from '../../types/vision';
import { useVisionSystem } from '../../context/VisionSystemContext';

interface ViewportControlsProps {
  showBoundingBoxes: boolean;
  setShowBoundingBoxes: (v: boolean) => void;
  showTrails: boolean;
  setShowTrails: (v: boolean) => void;
  showLanes: boolean;
  setShowLanes: (v: boolean) => void;
  showHorizonGrid: boolean;
  setShowHorizonGrid: (v: boolean) => void;
}

export const ViewportControls: React.FC<ViewportControlsProps> = ({
  showBoundingBoxes,
  setShowBoundingBoxes,
  showTrails,
  setShowTrails,
  showLanes,
  setShowLanes,
  showHorizonGrid,
  setShowHorizonGrid
}) => {
  const { viewportMode, setViewportMode } = useVisionSystem();

  const modes: { id: ViewportMode; label: string; icon: React.ReactNode }[] = [
    { id: 'perspective', label: 'Perspective Front Cam', icon: <Eye className="w-3.5 h-3.5" /> },
    { id: 'bev', label: 'Bird’s-Eye (BEV)', icon: <Compass className="w-3.5 h-3.5" /> },
    { id: 'edge', label: 'Sobel Edge Filter', icon: <Zap className="w-3.5 h-3.5" /> },
    { id: 'thermal', label: 'Thermal Night IR', icon: <Flame className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-navy-900/90 border-b border-slate-800 text-xs">
      {/* Viewport Render Mode Selectors */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
        <span className="text-[11px] font-mono text-slate-400 mr-1 hidden sm:inline">VIEW:</span>
        {modes.map((mode) => {
          const isActive = viewportMode === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => setViewportMode(mode.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-mono text-[11px] transition-all ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-glow-cyan'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              {mode.icon}
              <span>{mode.label}</span>
            </button>
          );
        })}
      </div>

      {/* Layer Overlay Toggles */}
      <div className="flex items-center gap-1.5 text-[11px] font-mono">
        <button
          onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
          className={`flex items-center gap-1 px-2 py-1 rounded-md border transition-all ${
            showBoundingBoxes
              ? 'bg-cyan-950/60 text-cyan-300 border-cyan-700/80'
              : 'bg-slate-900 text-slate-500 border-slate-800'
          }`}
          title="Toggle Bounding Boxes & Confidence Labels"
        >
          <Target className="w-3 h-3" />
          <span>BBoxes</span>
        </button>

        <button
          onClick={() => setShowTrails(!showTrails)}
          className={`flex items-center gap-1 px-2 py-1 rounded-md border transition-all ${
            showTrails
              ? 'bg-cyan-950/60 text-cyan-300 border-cyan-700/80'
              : 'bg-slate-900 text-slate-500 border-slate-800'
          }`}
          title="Toggle Tracking Motion Trails"
        >
          <Route className="w-3 h-3" />
          <span>Trails</span>
        </button>

        <button
          onClick={() => setShowLanes(!showLanes)}
          className={`flex items-center gap-1 px-2 py-1 rounded-md border transition-all ${
            showLanes
              ? 'bg-cyan-950/60 text-cyan-300 border-cyan-700/80'
              : 'bg-slate-900 text-slate-500 border-slate-800'
          }`}
          title="Toggle Polynomial Lane Boundaries"
        >
          <Sliders className="w-3 h-3" />
          <span>Lanes</span>
        </button>

        <button
          onClick={() => setShowHorizonGrid(!showHorizonGrid)}
          className={`flex items-center gap-1 px-2 py-1 rounded-md border transition-all ${
            showHorizonGrid
              ? 'bg-cyan-950/60 text-cyan-300 border-cyan-700/80'
              : 'bg-slate-900 text-slate-500 border-slate-800'
          }`}
          title="Toggle Vanishing Point & Calibration Grid"
        >
          <Grid className="w-3 h-3" />
          <span>Grid</span>
        </button>
      </div>
    </div>
  );
};
