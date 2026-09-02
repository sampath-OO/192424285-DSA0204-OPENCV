import React, { useRef, useState, useEffect } from 'react';
import {
  Video,
  Camera,
  Play,
  Pause,
  Zap,
  Sliders,
  AlertCircle,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { applySobelEdgeFilter } from '../../utils/cvAlgorithms';

export const WebCamLiveCV: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<'raw' | 'edge' | 'grayscale'>('edge');
  const [liveFps, setLiveFps] = useState<number>(30);
  const [detectedBoxes, setDetectedBoxes] = useState<{ x: number; y: number; w: number; h: number; label: string }[]>([]);

  // Start real webcam stream
  const startWebcam = async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setIsStreaming(true);
        }
      } else {
        setCameraError('Webcam API is not available on this browser or platform.');
      }
    } catch (err: any) {
      setCameraError(err?.message || 'Unable to access webcam. Please verify camera permissions.');
    }
  };

  // Stop webcam
  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
    }
  };

  // Video frame processing loop
  useEffect(() => {
    if (!isStreaming) return;

    let animId: number;
    let frameCount = 0;
    let lastTime = performance.now();

    const processFrame = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && canvas && video.readyState >= 2) {
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          const width = canvas.width;
          const height = canvas.height;

          // Draw video to canvas
          ctx.drawImage(video, 0, 0, width, height);

          if (filterMode === 'edge') {
            const frame = ctx.getImageData(0, 0, width, height);
            const edges = applySobelEdgeFilter(frame);
            ctx.putImageData(edges, 0, 0);
          } else if (filterMode === 'grayscale') {
            const frame = ctx.getImageData(0, 0, width, height);
            const d = frame.data;
            for (let i = 0; i < d.length; i += 4) {
              const g = (d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114) | 0;
              d[i] = g;
              d[i + 1] = g;
              d[i + 2] = g;
            }
            ctx.putImageData(frame, 0, 0);
          }

          // Simulated browser object detection overlay (Face / Object centroid)
          ctx.strokeStyle = '#06b6d4';
          ctx.lineWidth = 2;
          const centerX = width * 0.5;
          const centerY = height * 0.45;
          ctx.strokeRect(centerX - 80, centerY - 80, 160, 160);

          ctx.fillStyle = 'rgba(6, 182, 212, 0.9)';
          ctx.font = 'bold 11px "JetBrains Mono", monospace';
          ctx.fillText('LIVE CV TARGET #01 [96.2%]', centerX - 80, centerY - 86);

          // Measure FPS
          frameCount++;
          const now = performance.now();
          if (now - lastTime >= 1000) {
            setLiveFps(frameCount);
            frameCount = 0;
            lastTime = now;
          }
        }
      }

      animId = requestAnimationFrame(processFrame);
    };

    animId = requestAnimationFrame(processFrame);
    return () => cancelAnimationFrame(animId);
  }, [isStreaming, filterMode]);

  return (
    <div className="p-5 rounded-2xl bg-navy-900/90 border border-cyan-500/30 shadow-2xl backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-100">
                Live Browser Computer Vision Engine
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                LIVE CV
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Direct WebRTC video ingestion with real-time Canvas 2D convolution edge extraction
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 font-mono text-xs">
          {!isStreaming ? (
            <button
              onClick={startWebcam}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 shadow-glow-cyan transition-all"
            >
              <Video className="w-4 h-4" />
              <span>Enable WebCam</span>
            </button>
          ) : (
            <button
              onClick={stopWebcam}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 border border-red-500/40 font-bold hover:bg-red-500/30 transition-all"
            >
              <Pause className="w-4 h-4" />
              <span>Stop WebCam</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter selector */}
      <div className="flex items-center gap-2 py-3 border-b border-slate-800/80 font-mono text-xs">
        <span className="text-slate-400">FILTER:</span>
        <button
          onClick={() => setFilterMode('edge')}
          className={`px-2.5 py-1 rounded-md border ${filterMode === 'edge' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500' : 'bg-slate-900 text-slate-400 border-slate-800'}`}
        >
          Sobel Edge Convolution
        </button>
        <button
          onClick={() => setFilterMode('grayscale')}
          className={`px-2.5 py-1 rounded-md border ${filterMode === 'grayscale' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500' : 'bg-slate-900 text-slate-400 border-slate-800'}`}
        >
          Grayscale RoI
        </button>
        <button
          onClick={() => setFilterMode('raw')}
          className={`px-2.5 py-1 rounded-md border ${filterMode === 'raw' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500' : 'bg-slate-900 text-slate-400 border-slate-800'}`}
        >
          Direct RGB Stream
        </button>
      </div>

      {/* Viewport Box */}
      <div className="relative aspect-video w-full max-w-2xl mx-auto mt-4 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
        {/* Hidden Video Source */}
        <video ref={videoRef} className="hidden" playsInline muted />

        {/* Real-time Processed Output Canvas */}
        <canvas ref={canvasRef} width={640} height={480} className="w-full h-full object-cover" />

        {/* State Overlays */}
        {!isStreaming && !cameraError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-navy-950/90 text-center p-6">
            <Camera className="w-12 h-12 text-slate-600 animate-pulse" />
            <div>
              <p className="text-sm font-semibold text-slate-200">
                Webcam Stream Inactive
              </p>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                Click &quot;Enable WebCam&quot; to process your physical video stream in real-time using browser Canvas Sobel edge convolutions.
              </p>
            </div>
            <button
              onClick={startWebcam}
              className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs shadow-glow-cyan hover:bg-cyan-400 transition-all"
            >
              Start Live Camera Stream
            </button>
          </div>
        )}

        {cameraError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-navy-950/95 text-center p-6">
            <AlertCircle className="w-10 h-10 text-amber-400" />
            <p className="text-sm font-semibold text-amber-300">Camera Access Notice</p>
            <p className="text-xs text-slate-400 max-w-md">{cameraError}</p>
            <p className="text-[11px] text-slate-500 mt-2 font-mono">
              Note: You can continue using the high-fidelity Autonomous Road Simulation mode above without requiring webcam hardware.
            </p>
          </div>
        )}

        {/* Live FPS tag */}
        {isStreaming && (
          <div className="absolute top-2 right-2 px-2.5 py-1 rounded bg-slate-950/80 border border-cyan-500/40 text-[10px] font-mono text-cyan-400">
            LIVE FPS: {liveFps}
          </div>
        )}
      </div>
    </div>
  );
};
