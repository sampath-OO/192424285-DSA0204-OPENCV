import React from 'react';
import {
  FileText,
  Download,
  Printer,
  X,
  ShieldCheck,
  Activity,
  CheckCircle2,
  Calendar,
  Layers
} from 'lucide-react';
import { useVisionSystem } from '../../context/VisionSystemContext';
import { exportTelemetryCSV, exportSystemAuditJSON } from '../../utils/exportUtils';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({ isOpen, onClose }) => {
  const { entities, metrics, risk, alerts, weather, camera } = useVisionSystem();

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCSV = () => {
    exportTelemetryCSV(entities, metrics, risk);
  };

  const handleDownloadJSON = () => {
    exportSystemAuditJSON(entities, metrics, risk, alerts);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-3xl bg-navy-900 border border-cyan-500/40 shadow-2xl overflow-hidden p-6 sm:p-8 my-8 text-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                VisionGuard AI — Road Safety Audit & Telemetry Report
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 font-mono">
                <Calendar className="w-3.5 h-3.5" />
                <span>Generated: {new Date().toLocaleString()}</span>
                <span>•</span>
                <span className="text-cyan-400">ISO 26262 Prototype Standard</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Report Content Body */}
        <div className="py-6 space-y-6 text-xs font-mono">
          {/* Executive Summary Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 text-[10px] block">SYSTEM STATUS</span>
              <span className="text-sm font-bold text-emerald-400">ONLINE (60 FPS)</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 text-[10px] block">OVERALL RISK</span>
              <span className="text-sm font-bold text-cyan-400">{risk.overallLevel} ({risk.overallScore}/100)</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 text-[10px] block">MIN TTC</span>
              <span className="text-sm font-bold text-emerald-400">{risk.ttcSeconds} sec</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 text-[10px] block">DETECTION ACCURACY</span>
              <span className="text-sm font-bold text-cyan-400">{metrics.detectionAccuracy}%</span>
            </div>
          </div>

          {/* Active Sensor & Perception Profile */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <h4 className="font-bold text-cyan-400 uppercase tracking-wider text-[11px]">
              Sensor & Camera Matrix Configuration
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-400 font-mono">
              <div>Focal Length: <strong className="text-slate-200">{camera.focalLengthX} px</strong></div>
              <div>Principal Point: <strong className="text-slate-200">({camera.principalPointX}, {camera.principalPointY})</strong></div>
              <div>Mount Height: <strong className="text-slate-200">{camera.cameraHeight} m</strong></div>
              <div>Horizontal FOV: <strong className="text-slate-200">{camera.fovHorizontal}°</strong></div>
              <div>Reprojection Error: <strong className="text-emerald-400">{camera.reprojectionError} px</strong></div>
              <div>Weather Profile: <strong className="text-slate-200">{weather.toUpperCase()}</strong></div>
            </div>
          </div>

          {/* Tracked Objects Snapshot Table */}
          <div className="space-y-2">
            <h4 className="font-bold text-cyan-400 uppercase tracking-wider text-[11px]">
              Active Tracked Entities ({entities.length} Total)
            </h4>
            <div className="max-h-48 overflow-y-auto border border-slate-800 rounded-xl">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-slate-950 text-slate-400 sticky top-0 border-b border-slate-800">
                  <tr>
                    <th className="p-2">ID</th>
                    <th className="p-2">Class</th>
                    <th className="p-2">Confidence</th>
                    <th className="p-2">Distance</th>
                    <th className="p-2">Speed</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Threat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-navy-950/50">
                  {entities.map((e) => (
                    <tr key={e.id} className="hover:bg-slate-900/60">
                      <td className="p-2 font-bold text-cyan-300">{e.id}</td>
                      <td className="p-2 capitalize">{e.class}</td>
                      <td className="p-2 text-emerald-400">{e.confidence.toFixed(1)}%</td>
                      <td className="p-2">{e.distanceMeters}m</td>
                      <td className="p-2">{e.speedKmh} km/h</td>
                      <td className="p-2 uppercase">{e.trackStatus}</td>
                      <td className="p-2 font-bold text-cyan-400">{e.proximityRisk}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadCSV}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 font-mono text-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handleDownloadJSON}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 font-mono text-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON Audit</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-mono text-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print PDF</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-glow-cyan transition-all"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
