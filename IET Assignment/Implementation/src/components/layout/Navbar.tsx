import React, { useState } from 'react';
import {
  Shield,
  Activity,
  Cpu,
  AlertTriangle,
  Volume2,
  VolumeX,
  FileText,
  Video,
  Layers,
  Menu,
  X
} from 'lucide-react';
import { useVisionSystem } from '../../context/VisionSystemContext';

interface NavbarProps {
  onOpenReportModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenReportModal }) => {
  const {
    metrics,
    risk,
    soundEnabled,
    toggleSound,
    viewportMode,
    setViewportMode
  } = useVisionSystem();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getRiskBadgeColor = () => {
    switch (risk.overallLevel) {
      case 'CRITICAL':
        return 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse';
      case 'HIGH':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
      case 'MEDIUM':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      default:
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    }
  };

  const navLinks = [
    { label: 'Overview', href: '#overview' },
    { label: 'Live Monitor', href: '#monitor' },
    { label: 'Calibration', href: '#calibration' },
    { label: 'Detection', href: '#detection' },
    { label: 'Tracking', href: '#tracking' },
    { label: 'Lanes & Signs', href: '#lanes-signs' },
    { label: 'Risk Engine', href: '#risk-engine' },
    { label: 'Analytics', href: '#analytics' },
    { label: 'Architecture', href: '#architecture' },
    { label: 'Safety', href: '#safety' },
    { label: 'Research', href: '#research' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-navy-950/90 backdrop-blur-md border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 shadow-glow-cyan">
              <Shield className="w-5 h-5 text-cyan-400 animate-pulse" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-navy-950 animate-ping" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-wider bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">
                  VISIONGUARD AI
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-cyan-950/60 text-cyan-300 border border-cyan-800/60 rounded">
                  v1.0-RC
                </span>
              </div>
              <p className="hidden md:block text-[11px] text-slate-400 tracking-tight font-medium">
                Autonomous Road Safety & Intelligent Traffic Monitoring
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1 text-xs font-medium text-slate-300">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="px-2.5 py-1.5 rounded-md hover:text-cyan-400 hover:bg-slate-800/50 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Telemetry Status Badges & Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* System Status Pulse */}
            <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-700/60 text-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-slate-300 font-mono text-[11px]">SYSTEM ONLINE</span>
            </div>

            {/* FPS & Latency */}
            <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-xs font-mono">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-cyan-400 font-bold">{metrics.fps} FPS</span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-300">{metrics.latencyMs}ms</span>
            </div>

            {/* Live Risk Badge */}
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono font-semibold ${getRiskBadgeColor()}`}>
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{risk.overallLevel} RISK</span>
            </div>

            {/* Live WebCam CV / Sim Toggle */}
            <button
              onClick={() => setViewportMode(viewportMode === 'webcam' ? 'perspective' : 'webcam')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                viewportMode === 'webcam'
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-glow-cyan'
                  : 'bg-slate-900/80 text-slate-300 border-slate-700/60 hover:text-cyan-400 hover:border-slate-600'
              }`}
              title="Toggle between Interactive Autonomous Simulation and Live Browser Webcam CV"
            >
              <Video className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{viewportMode === 'webcam' ? 'Live Webcam [ACTIVE]' : 'Live Webcam CV'}</span>
            </button>

            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              className={`p-1.5 rounded-lg border transition-colors ${
                soundEnabled
                  ? 'bg-slate-900/80 text-cyan-400 border-slate-700/80 hover:bg-slate-800'
                  : 'bg-slate-900/80 text-slate-500 border-slate-800 hover:text-slate-400'
              }`}
              title={soundEnabled ? 'Mute Telemetry Audio Chimes' : 'Enable Telemetry Audio Chimes'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Safety Audit Export */}
            <button
              onClick={onOpenReportModal}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 text-xs font-medium transition-all shadow-glow-cyan"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Audit Report</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-navy-900 border-b border-slate-800 px-4 py-3 space-y-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-xs font-medium text-slate-300 hover:text-cyan-400 hover:bg-slate-800/60 rounded-md transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={() => {
                onOpenReportModal();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-medium"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Open Safety Audit Report</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
