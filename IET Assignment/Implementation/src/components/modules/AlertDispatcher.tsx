import React from 'react';
import {
  Bell,
  AlertTriangle,
  Info,
  AlertOctagon,
  X,
  Trash2,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useVisionSystem } from '../../context/VisionSystemContext';
import { SystemAlert } from '../../types/telemetry';

export const AlertDispatcher: React.FC = () => {
  const {
    alerts,
    dismissAlert,
    clearAlerts,
    soundEnabled,
    toggleSound
  } = useVisionSystem();

  const getAlertSeverityIcon = (sev: SystemAlert['severity']) => {
    switch (sev) {
      case 'CRITICAL':
        return <AlertOctagon className="w-4 h-4 text-red-400" />;
      case 'WARNING':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      default:
        return <Info className="w-4 h-4 text-cyan-400" />;
    }
  };

  const getAlertSeverityClass = (sev: SystemAlert['severity']) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-red-950/70 border-red-500/80 text-red-200 ring-1 ring-red-500/60 animate-pulse';
      case 'WARNING':
        return 'bg-amber-950/60 border-amber-500/60 text-amber-200';
      default:
        return 'bg-slate-900/80 border-slate-800 text-slate-300';
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-navy-900/90 border border-slate-800 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
            Real-Time Safety Alert Dispatcher
          </h3>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={toggleSound}
            className="p-1 rounded text-slate-400 hover:text-cyan-400 transition-colors"
            title={soundEnabled ? 'Mute Alert Chimes' : 'Unmute Alert Chimes'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
          {alerts.length > 0 && (
            <button
              onClick={clearAlerts}
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-red-400 transition-colors"
              title="Clear all alerts"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Alert Feed Container */}
      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {alerts.length === 0 ? (
          <div className="p-4 text-center text-xs font-mono text-slate-500">
            No active safety alerts. Perception envelope nominal.
          </div>
        ) : (
          alerts.map((alt) => (
            <div
              key={alt.id}
              className={`p-3 rounded-xl border flex items-start justify-between gap-3 text-xs transition-all ${getAlertSeverityClass(alt.severity)}`}
            >
              <div className="flex items-start gap-2.5">
                <div className="p-1 rounded-md bg-slate-950/60 shrink-0 mt-0.5">
                  {getAlertSeverityIcon(alt.severity)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-100">
                      {alt.title}
                    </span>
                    <span className="text-[10px] font-mono opacity-70">
                      {alt.timestamp}
                    </span>
                  </div>
                  <p className="text-[11px] opacity-90 mt-0.5 leading-snug">
                    {alt.description}
                  </p>
                </div>
              </div>

              <button
                onClick={() => dismissAlert(alt.id)}
                className="p-1 rounded text-slate-400 hover:text-white shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
