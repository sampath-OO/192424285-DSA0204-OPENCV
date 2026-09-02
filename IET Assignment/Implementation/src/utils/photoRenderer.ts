import { PresetScenario } from '../data/presetScenarios';
import { applySobelEdgeFilter, applyThermalFilter } from './cvAlgorithms';

export type FilterMode = 'original' | 'edge' | 'bev' | 'thermal' | 'threshold';

export interface OverlayToggles {
  showBoundingBoxes: boolean;
  showLanes: boolean;
  showSigns: boolean;
  showCalibrationGrid: boolean;
  showRiskZones: boolean;
}

/**
 * Draws the realistic photo background onto the canvas.
 * Supports built-in photographic scenery synthesis and custom user-uploaded Image objects.
 */
export function drawPhotoBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  scenario: PresetScenario,
  customImage: HTMLImageElement | null,
  isLaneDepartureSim: boolean,
  laneOffsetCm: number
) {
  if (customImage) {
    // Draw user-uploaded real photo
    ctx.drawImage(customImage, 0, 0, width, height);
    return;
  }

  const bg = scenario.backgroundType;

  // Sky & Horizon
  const horizonY = height * 0.42;
  const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);

  if (bg === 'night_road') {
    skyGrad.addColorStop(0, '#02040a');
    skyGrad.addColorStop(1, '#091124');
  } else if (bg === 'rain_highway') {
    skyGrad.addColorStop(0, '#1e293b');
    skyGrad.addColorStop(1, '#334155');
  } else {
    skyGrad.addColorStop(0, '#0c2340');
    skyGrad.addColorStop(1, '#2563eb');
  }
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, width, horizonY);

  // Distant City / Highway Horizon Skyline
  ctx.fillStyle = bg === 'night_road' ? '#040814' : '#0f172a';
  ctx.beginPath();
  ctx.moveTo(0, horizonY);
  ctx.lineTo(80, horizonY - 30);
  ctx.lineTo(160, horizonY - 15);
  ctx.lineTo(240, horizonY - 45);
  ctx.lineTo(340, horizonY - 20);
  ctx.lineTo(460, horizonY - 50);
  ctx.lineTo(580, horizonY - 25);
  ctx.lineTo(700, horizonY - 40);
  ctx.lineTo(820, horizonY - 15);
  ctx.lineTo(width, horizonY - 35);
  ctx.lineTo(width, horizonY);
  ctx.closePath();
  ctx.fill();

  // Road Asphalt Ground Polygon
  const roadGrad = ctx.createLinearGradient(0, horizonY, 0, height);
  if (bg === 'rain_highway') {
    roadGrad.addColorStop(0, '#111827');
    roadGrad.addColorStop(0.7, '#1f2937');
    roadGrad.addColorStop(1, '#0f172a');
  } else {
    roadGrad.addColorStop(0, '#1e293b');
    roadGrad.addColorStop(1, '#0f172a');
  }
  ctx.fillStyle = roadGrad;

  // Road trapezoid vanishing towards horizon
  ctx.beginPath();
  ctx.moveTo(width * 0.46, horizonY);
  ctx.lineTo(width * 0.54, horizonY);
  ctx.lineTo(width * 1.15, height);
  ctx.lineTo(-width * 0.15, height);
  ctx.closePath();
  ctx.fill();

  // Curbs & Shoulders
  ctx.fillStyle = '#0a161f';
  ctx.beginPath();
  ctx.moveTo(0, horizonY);
  ctx.lineTo(width * 0.46, horizonY);
  ctx.lineTo(-width * 0.15, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(width, horizonY);
  ctx.lineTo(width * 0.54, horizonY);
  ctx.lineTo(width * 1.15, height);
  ctx.lineTo(width, height);
  ctx.closePath();
  ctx.fill();

  // Chessboard calibration ground pattern if calibration mode
  if (bg === 'chessboard_grid') {
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
    ctx.lineWidth = 1.5;
    for (let x = -8; x <= 8; x += 2) {
      ctx.beginPath();
      ctx.moveTo(width * 0.5 + x * 8, horizonY);
      ctx.lineTo(width * 0.5 + x * 65, height);
      ctx.stroke();
    }
    for (let yStep = 0.1; yStep <= 1.0; yStep += 0.15) {
      const lineY = horizonY + (height - horizonY) * Math.pow(yStep, 1.6);
      ctx.beginPath();
      ctx.moveTo(0, lineY);
      ctx.lineTo(width, lineY);
      ctx.stroke();
    }
  }

  // Crosswalk Zebra Stripes if crosswalk mode
  if (bg === 'crosswalk' || bg === 'city_day') {
    const cwY1 = horizonY + (height - horizonY) * 0.45;
    const cwY2 = horizonY + (height - horizonY) * 0.62;
    ctx.fillStyle = 'rgba(248, 250, 252, 0.45)';
    for (let x = width * 0.15; x < width * 0.85; x += 38) {
      ctx.fillRect(x, cwY1, 20, cwY2 - cwY1);
    }
  }

  // Lane Dividers (Dashed road markings)
  [-0.15, 0.15].forEach((offset) => {
    ctx.strokeStyle = 'rgba(248, 250, 252, 0.8)';
    ctx.lineWidth = 3;
    ctx.setLineDash([16, 20]);
    ctx.beginPath();
    ctx.moveTo(width * (0.5 + offset * 0.2), horizonY);
    ctx.lineTo(width * (0.5 + offset * 2.2), height);
    ctx.stroke();
    ctx.setLineDash([]);
  });

  // Rain weather streaks
  if (bg === 'rain_highway') {
    ctx.strokeStyle = 'rgba(186, 230, 253, 0.3)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 90; i++) {
      const rx = (i * 37) % width;
      const ry = (i * 53) % height;
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx - 6, ry + 18);
      ctx.stroke();
    }
  }

  // Night headlights illumination
  if (bg === 'night_road') {
    const coneGrad = ctx.createRadialGradient(width / 2, height, 40, width / 2, height * 0.5, 380);
    coneGrad.addColorStop(0, 'rgba(254, 240, 138, 0.28)');
    coneGrad.addColorStop(0.7, 'rgba(254, 240, 138, 0.05)');
    coneGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = coneGrad;
    ctx.fillRect(0, 0, width, height);
  }
}

/**
 * Applies real-time computer vision filters directly to the canvas ImageData
 */
export function applySelectedFilter(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  filter: FilterMode
) {
  if (filter === 'original') return;

  const frameData = ctx.getImageData(0, 0, width, height);

  if (filter === 'edge') {
    const edges = applySobelEdgeFilter(frameData);
    ctx.putImageData(edges, 0, 0);
  } else if (filter === 'thermal') {
    const thermal = applyThermalFilter(frameData);
    ctx.putImageData(thermal, 0, 0);
  } else if (filter === 'threshold') {
    // Binary Grayscale Thresholding
    const d = frameData.data;
    for (let i = 0; i < d.length; i += 4) {
      const gray = (d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114) | 0;
      const val = gray > 110 ? 255 : 15;
      d[i] = val === 255 ? 6 : 11;
      d[i + 1] = val === 255 ? 182 : 15;
      d[i + 2] = val === 255 ? 212 : 25;
      d[i + 3] = 255;
    }
    ctx.putImageData(frameData, 0, 0);
  } else if (filter === 'bev') {
    // Top-Down Bird's Eye View Warp
    ctx.fillStyle = 'rgba(7, 11, 20, 0.85)';
    ctx.fillRect(0, 0, width, height);

    // Draw top-down radar rings
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.3)';
    ctx.lineWidth = 1;
    [width * 0.15, width * 0.3, width * 0.45].forEach((rad, idx) => {
      ctx.beginPath();
      ctx.arc(width / 2, height * 0.9, rad, Math.PI, 0);
      ctx.stroke();
      ctx.fillStyle = 'rgba(56, 189, 248, 0.7)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillText(`${(idx + 1) * 20}m`, width / 2 + 10, height * 0.9 - rad + 4);
    });

    // Ego vehicle icon
    ctx.fillStyle = '#06b6d4';
    ctx.fillRect(width / 2 - 12, height * 0.88, 24, 40);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('EGO', width / 2, height * 0.93);
  }
}

/**
 * Draws high-precision computer vision overlays (BBoxes, Lanes, Signs, Grid, Halos)
 */
export function drawPerceptionOverlays(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  scenario: PresetScenario,
  overlays: OverlayToggles,
  isEmergencyActive: boolean,
  isOcclusionActive: boolean,
  isLaneDepartureSim: boolean,
  selectedId: string | null
) {
  const horizonY = height * 0.42;

  // 1. Calibration Vanishing Point Grid
  if (overlays.showCalibrationGrid) {
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.35)';
    ctx.lineWidth = 1;
    const vpX = width * 0.5;

    // Horizon line
    ctx.beginPath();
    ctx.moveTo(0, horizonY);
    ctx.lineTo(width, horizonY);
    ctx.stroke();

    // Perspective rays
    for (let px = 0; px <= width; px += width / 8) {
      ctx.beginPath();
      ctx.moveTo(vpX, horizonY);
      ctx.lineTo(px, height);
      ctx.stroke();
    }

    // Vanishing Point Reticle
    ctx.fillStyle = '#06b6d4';
    ctx.beginPath();
    ctx.arc(vpX, horizonY, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(11, 15, 25, 0.85)';
    ctx.strokeStyle = '#06b6d4';
    ctx.strokeRect(vpX - 85, horizonY - 24, 170, 18);
    ctx.fillRect(vpX - 85, horizonY - 24, 170, 18);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 9px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('VANISHING POINT (Y=42%)', vpX, horizonY - 12);
  }

  // 2. Polynomial Lane Boundaries (LDW)
  if (overlays.showLanes) {
    const laneOffset = isLaneDepartureSim ? 45 : scenario.laneOffsetCm;
    const isDrifting = Math.abs(laneOffset) > 30;
    const laneColor = isDrifting ? 'rgba(239, 68, 68, 0.9)' : 'rgba(6, 182, 212, 0.85)';

    ctx.strokeStyle = laneColor;
    ctx.lineWidth = 3.5;
    ctx.shadowColor = laneColor;
    ctx.shadowBlur = 8;

    // Left lane boundary curve
    ctx.beginPath();
    ctx.moveTo(width * 0.45, horizonY);
    ctx.quadraticCurveTo(width * 0.38 - laneOffset * 0.8, height * 0.7, width * 0.2 - laneOffset * 1.5, height);
    ctx.stroke();

    // Right lane boundary curve
    ctx.beginPath();
    ctx.moveTo(width * 0.55, horizonY);
    ctx.quadraticCurveTo(width * 0.62 - laneOffset * 0.8, height * 0.7, width * 0.8 - laneOffset * 1.5, height);
    ctx.stroke();

    // Lane Center Track
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(width * 0.5, horizonY);
    ctx.quadraticCurveTo(width * 0.5 - laneOffset * 0.8, height * 0.7, width * 0.5 - laneOffset * 1.5, height);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.shadowBlur = 0;
  }

  // 3. Road Sign Radar Scans
  if (overlays.showSigns) {
    scenario.signs.forEach((s) => {
      const sx = (s.xPct / 100) * width;
      const sy = (s.yPct / 100) * height;

      // Radar pulse ring
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.85)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(sx, sy, 18, 0, Math.PI * 2);
      ctx.stroke();

      // Info badge
      ctx.fillStyle = 'rgba(11, 15, 25, 0.9)';
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1;
      const bw = 120;
      const bh = 28;
      ctx.fillRect(sx - bw / 2, sy - 36, bw, bh);
      ctx.strokeRect(sx - bw / 2, sy - 36, bw, bh);

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 9px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`🛑 ${s.name} (${s.confidence}%)`, sx, sy - 24);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '8px "JetBrains Mono", monospace';
      ctx.fillText(`${s.distanceM}m | ${s.action}`, sx, sy - 12);
    });
  }

  // 4. Detected Objects Bounding Boxes & Threat Halos
  if (overlays.showBoundingBoxes) {
    scenario.detections.forEach((d) => {
      const bx = (d.xPct / 100) * width;
      const by = (d.yPct / 100) * height;
      const bw = (d.wPct / 100) * width;
      const bh = (d.hPct / 100) * height;

      let strokeColor = '#38bdf8'; // Blue for vehicles
      let badgeBg = 'rgba(2, 132, 199, 0.9)';
      if (d.class === 'pedestrian') {
        strokeColor = '#10b981'; // Green for pedestrians
        badgeBg = 'rgba(5, 150, 105, 0.9)';
      } else if (d.class === 'bicycle') {
        strokeColor = '#a855f7'; // Purple for cyclists
        badgeBg = 'rgba(147, 51, 234, 0.9)';
      }

      // Emergency or high threat override
      const isCritical = isEmergencyActive && d.class === 'pedestrian';
      if (isCritical || d.threat === 'HIGH' || d.threat === 'CRITICAL') {
        strokeColor = '#ef4444';
        badgeBg = 'rgba(220, 38, 38, 0.95)';
      }

      // Occlusion Ghost state simulation
      const isOccluded = isOcclusionActive && d.id === 'CAR #01';

      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = isOccluded ? 1.5 : 2;
      if (isOccluded) ctx.setLineDash([4, 4]);

      // Precision Corner Brackets
      const cLen = Math.min(10, bw * 0.3, bh * 0.3);
      ctx.beginPath();
      // Top-Left
      ctx.moveTo(bx, by + cLen);
      ctx.lineTo(bx, by);
      ctx.lineTo(bx + cLen, by);
      // Top-Right
      ctx.moveTo(bx + bw - cLen, by);
      ctx.lineTo(bx + bw, by);
      ctx.lineTo(bx + bw, by + cLen);
      // Bottom-Right
      ctx.moveTo(bx + bw, by + bh - cLen);
      ctx.lineTo(bx + bw, by + bh);
      ctx.lineTo(bx + bw - cLen, by + bh);
      // Bottom-Left
      ctx.moveTo(bx + cLen, by + bh);
      ctx.lineTo(bx, by + bh);
      ctx.lineTo(bx, by + bh - cLen);
      ctx.stroke();
      ctx.setLineDash([]);

      // Top Tag Badge
      const tagText = isOccluded ? `${d.id} [OCCLUDED]` : `${d.id} | ${d.confidence.toFixed(1)}%`;
      ctx.font = 'bold 9px "JetBrains Mono", monospace';
      const tw = ctx.measureText(tagText).width + 8;
      ctx.fillStyle = badgeBg;
      ctx.fillRect(bx, by - 16, tw, 16);

      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'left';
      ctx.fillText(tagText, bx + 4, by - 4);

      // Distance & Speed bottom badge
      const distText = `${d.distanceM}m | ${d.speedKmh} km/h`;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(bx, by + bh, tw, 14);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '8px "JetBrains Mono", monospace';
      ctx.fillText(distText, bx + 4, by + bh + 10);

      // Threat Halo if Risk Zones enabled
      if (overlays.showRiskZones && (d.threat === 'HIGH' || isCritical)) {
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(bx + bw / 2, by + bh / 2, Math.max(bw, bh) * 0.8, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Target selection ring
      if (selectedId === d.id) {
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(bx + bw / 2, by + bh / 2, Math.max(bw, bh) * 0.9, 0, Math.PI * 2);
        ctx.stroke();
      }
    });
  }
}
