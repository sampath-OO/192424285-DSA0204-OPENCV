import React, { useRef, useEffect, useState } from 'react';
import { useVisionSystem } from '../../context/VisionSystemContext';
import { VisionEntity } from '../../types/vision';
import {
  project3DTo2D,
  project3DToBEV,
  applySobelEdgeFilter,
  applyThermalFilter
} from '../../utils/cvAlgorithms';

interface TrafficCanvasProps {
  showBoundingBoxes: boolean;
  showTrails: boolean;
  showLanes: boolean;
  showHorizonGrid: boolean;
}

export const TrafficCanvas: React.FC<TrafficCanvasProps> = ({
  showBoundingBoxes,
  showTrails,
  showLanes,
  showHorizonGrid
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const {
    entities,
    signs,
    camera,
    lane,
    risk,
    weather,
    viewportMode,
    isEmergencyActive,
    selectedEntity,
    setSelectedEntity
  } = useVisionSystem();

  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  // Animation frame rendering loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    let animId: number;
    let roadDashOffset = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const horizonY = height * camera.vanishingPointY;
      roadDashOffset = (roadDashOffset + 2.5) % 40;

      // 1. Clear background
      ctx.fillStyle = '#060913';
      ctx.fillRect(0, 0, width, height);

      if (viewportMode === 'bev') {
        // ==================== BIRD'S-EYE VIEW (BEV) TOP-DOWN RADAR ====================
        renderBEVMode(ctx, width, height, entities, lane, risk);
      } else {
        // ==================== PERSPECTIVE FRONT CAMERA VIEW ====================
        renderPerspectiveRoad(
          ctx,
          width,
          height,
          horizonY,
          roadDashOffset,
          camera,
          lane,
          weather,
          showHorizonGrid,
          showLanes
        );

        // Draw Road Signs in scene
        renderRoadSigns(ctx, width, height, camera, signs);

        // Draw Moving Entities (Vehicles, Pedestrians, Cyclists)
        renderEntities(
          ctx,
          width,
          height,
          camera,
          entities,
          showBoundingBoxes,
          showTrails,
          selectedEntity,
          isEmergencyActive
        );

        // Draw Weather Overlays (Rain, Fog, Night Lighting)
        renderWeatherEffects(ctx, width, height, weather);

        // Apply Pixel Filters (Sobel Edge or Thermal IR) if active
        if (viewportMode === 'edge') {
          const frameData = ctx.getImageData(0, 0, width, height);
          const edgeData = applySobelEdgeFilter(frameData);
          ctx.putImageData(edgeData, 0, 0);
          drawCVOverlayHUD(ctx, width, height, 'SOBEL GRADIENT EDGE FILTER [CV PIPELINE]');
        } else if (viewportMode === 'thermal') {
          const frameData = ctx.getImageData(0, 0, width, height);
          const thermalData = applyThermalFilter(frameData);
          ctx.putImageData(thermalData, 0, 0);
          drawCVOverlayHUD(ctx, width, height, 'LONG-WAVE THERMAL INFRARED (LWIR) [NIGHT PEDESTRIAN CV]');
        }
      }

      // Draw Top HUD Info Bar
      renderCanvasHUD(ctx, width, height, risk, weather, entities.length, isEmergencyActive);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [
    entities,
    signs,
    camera,
    lane,
    risk,
    weather,
    viewportMode,
    isEmergencyActive,
    selectedEntity,
    showBoundingBoxes,
    showTrails,
    showLanes,
    showHorizonGrid
  ]);

  // Handle canvas click to select/inspect entity
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    // Find clicked entity
    let found: VisionEntity | null = null;
    for (const ent of entities) {
      if (
        clickX >= ent.bbox.x &&
        clickX <= ent.bbox.x + ent.bbox.width &&
        clickY >= ent.bbox.y &&
        clickY <= ent.bbox.y + ent.bbox.height
      ) {
        found = ent;
        break;
      }
    }
    setSelectedEntity(found);
  };

  return (
    <div className="relative w-full aspect-[16/10] bg-navy-950 overflow-hidden rounded-b-2xl border border-slate-800 shadow-2xl">
      <canvas
        ref={canvasRef}
        width={960}
        height={600}
        onClick={handleCanvasClick}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        }}
        onMouseLeave={() => setMousePos(null)}
        className="w-full h-full object-cover cursor-crosshair"
      />

      {/* Crosshair Cursor Coordinates Tooltip */}
      {mousePos && (
        <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-slate-950/80 border border-slate-800 text-[10px] font-mono text-cyan-400 pointer-events-none">
          X: {Math.round(mousePos.x)}px | Y: {Math.round(mousePos.y)}px | FOV: {camera.fovHorizontal}°
        </div>
      )}
    </div>
  );
};

// ==================== RENDERING SUB-ROUTINES ====================

function renderPerspectiveRoad(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  horizonY: number,
  roadDashOffset: number,
  camera: any,
  lane: any,
  weather: string,
  showGrid: boolean,
  showLanes: boolean
) {
  // Sky Gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
  skyGrad.addColorStop(0, weather === 'night' ? '#02040a' : '#070f26');
  skyGrad.addColorStop(1, weather === 'night' ? '#091124' : '#142548');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, width, horizonY);

  // Distant city mountains silhouette
  ctx.fillStyle = '#0a1329';
  ctx.beginPath();
  ctx.moveTo(0, horizonY);
  ctx.lineTo(80, horizonY - 25);
  ctx.lineTo(190, horizonY - 10);
  ctx.lineTo(320, horizonY - 35);
  ctx.lineTo(480, horizonY - 15);
  ctx.lineTo(650, horizonY - 40);
  ctx.lineTo(820, horizonY - 18);
  ctx.lineTo(width, horizonY - 28);
  ctx.lineTo(width, horizonY);
  ctx.closePath();
  ctx.fill();

  // Road Ground Asphalt Polygon
  const roadGrad = ctx.createLinearGradient(0, horizonY, 0, height);
  roadGrad.addColorStop(0, '#151c2e');
  roadGrad.addColorStop(1, '#0e1422');
  ctx.fillStyle = roadGrad;

  // Vanishing point X center
  const vpX = width * 0.5;

  ctx.beginPath();
  ctx.moveTo(vpX - 40, horizonY);
  ctx.lineTo(vpX + 40, horizonY);
  ctx.lineTo(width * 1.15, height);
  ctx.lineTo(-width * 0.15, height);
  ctx.closePath();
  ctx.fill();

  // Grass / Shoulder road sides
  ctx.fillStyle = '#0a161f';
  ctx.beginPath();
  ctx.moveTo(0, horizonY);
  ctx.lineTo(vpX - 40, horizonY);
  ctx.lineTo(-width * 0.15, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(width, horizonY);
  ctx.lineTo(vpX + 40, horizonY);
  ctx.lineTo(width * 1.15, height);
  ctx.lineTo(width, height);
  ctx.closePath();
  ctx.fill();

  // Calibration Grid Lines if enabled
  if (showGrid) {
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.18)';
    ctx.lineWidth = 1;
    for (let x = -12; x <= 12; x += 3) {
      const pNear = project3DTo2D(x, 4, 0, width, height, camera);
      const pFar = project3DTo2D(x, 80, 0, width, height, camera);
      ctx.beginPath();
      ctx.moveTo(pNear.screenX, pNear.screenY);
      ctx.lineTo(pFar.screenX, pFar.screenY);
      ctx.stroke();
    }
    for (let y = 10; y <= 80; y += 15) {
      const pL = project3DTo2D(-12, y, 0, width, height, camera);
      const pR = project3DTo2D(12, y, 0, width, height, camera);
      ctx.beginPath();
      ctx.moveTo(pL.screenX, pL.screenY);
      ctx.lineTo(pR.screenX, pR.screenY);
      ctx.stroke();
    }
  }

  // Crosswalk (Zebra Stripes at Y = 20m distance)
  const cwNear = project3DTo2D(-6.5, 19, 0, width, height, camera);
  const cwFar = project3DTo2D(6.5, 21, 0, width, height, camera);
  ctx.fillStyle = 'rgba(241, 245, 249, 0.35)';
  for (let s = -6.0; s <= 6.0; s += 1.2) {
    const s1 = project3DTo2D(s, 19, 0, width, height, camera);
    const s2 = project3DTo2D(s + 0.6, 21, 0, width, height, camera);
    ctx.fillRect(s1.screenX, s2.screenY, Math.max(6, s2.screenX - s1.screenX), Math.max(4, s1.screenY - s2.screenY));
  }

  // Lane Dividers (Dashed Moving Lines)
  const laneOffsets = [-4.0, 0.0, 4.0];
  laneOffsets.forEach((laneX) => {
    ctx.strokeStyle = 'rgba(248, 250, 252, 0.75)';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([16, 18]);
    ctx.lineDashOffset = -roadDashOffset;

    const pNear = project3DTo2D(laneX, 3.5, 0, width, height, camera);
    const pFar = project3DTo2D(laneX, 85, 0, width, height, camera);

    ctx.beginPath();
    ctx.moveTo(pNear.screenX, pNear.screenY);
    ctx.lineTo(pFar.screenX, pFar.screenY);
    ctx.stroke();
    ctx.setLineDash([]);
  });

  // Polynomial Lane Detection Boundaries (Cyan Overlays)
  if (showLanes) {
    const laneDepartureColor =
      lane.departureRisk === 'DEPARTURE_WARNING'
        ? 'rgba(239, 68, 68, 0.9)'
        : lane.departureRisk === 'DRIFTING'
        ? 'rgba(245, 158, 11, 0.9)'
        : 'rgba(6, 182, 212, 0.85)';

    ctx.strokeStyle = laneDepartureColor;
    ctx.lineWidth = 4;
    ctx.shadowColor = laneDepartureColor;
    ctx.shadowBlur = 10;

    // Left Lane boundary line
    ctx.beginPath();
    for (let yDist = 3; yDist <= 75; yDist += 3) {
      const p = project3DTo2D(-2.0 - (lane.centerOffsetCm / 100), yDist, 0, width, height, camera);
      if (yDist === 3) ctx.moveTo(p.screenX, p.screenY);
      else ctx.lineTo(p.screenX, p.screenY);
    }
    ctx.stroke();

    // Right Lane boundary line
    ctx.beginPath();
    for (let yDist = 3; yDist <= 75; yDist += 3) {
      const p = project3DTo2D(2.0 - (lane.centerOffsetCm / 100), yDist, 0, width, height, camera);
      if (yDist === 3) ctx.moveTo(p.screenX, p.screenY);
      else ctx.lineTo(p.screenX, p.screenY);
    }
    ctx.stroke();

    // Lane Center Track
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    for (let yDist = 3; yDist <= 75; yDist += 4) {
      const p = project3DTo2D(0 - (lane.centerOffsetCm / 100), yDist, 0, width, height, camera);
      if (yDist === 3) ctx.moveTo(p.screenX, p.screenY);
      else ctx.lineTo(p.screenX, p.screenY);
    }
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.shadowBlur = 0;
  }
}

function renderRoadSigns(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  camera: any,
  signs: any[]
) {
  signs.forEach((s) => {
    // Position roadside sign posts on right or left curb
    const isLeft = s.type === 'STOP' || s.type === 'SPEED_LIMIT_80';
    const posX = isLeft ? -7.2 : 7.2;
    const pBase = project3DTo2D(posX, s.distanceMeters, 0, width, height, camera);
    const pTop = project3DTo2D(posX, s.distanceMeters, 3.2, width, height, camera);

    if (pBase.isVisible && pTop.isVisible) {
      // Post Pole
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(pBase.screenX, pBase.screenY);
      ctx.lineTo(pTop.screenX, pTop.screenY);
      ctx.stroke();

      // Sign Board
      const signSize = Math.max(18, (pBase.screenY - pTop.screenY) * 0.45);
      ctx.fillStyle = s.type === 'STOP' ? '#dc2626' : '#f8fafc';
      ctx.strokeStyle = s.type === 'STOP' ? '#ffffff' : '#dc2626';
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.arc(pTop.screenX, pTop.screenY, signSize / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Sign Label
      ctx.fillStyle = s.type === 'STOP' ? '#ffffff' : '#0f172a';
      ctx.font = `bold ${Math.max(8, signSize * 0.42)}px 'JetBrains Mono', monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(s.icon, pTop.screenX, pTop.screenY);

      // Optical Recognition Radar Pulse Effect
      if (s.activeScan) {
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.8)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(pTop.screenX, pTop.screenY, signSize * 0.8, 0, Math.PI * 2);
        ctx.stroke();

        // Sign Info Tag
        ctx.fillStyle = 'rgba(11, 15, 25, 0.85)';
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.6)';
        ctx.lineWidth = 1;
        const tagW = 90;
        const tagH = 22;
        ctx.fillRect(pTop.screenX - tagW / 2, pTop.screenY - signSize - 16, tagW, tagH);
        ctx.strokeRect(pTop.screenX - tagW / 2, pTop.screenY - signSize - 16, tagW, tagH);

        ctx.fillStyle = '#38bdf8';
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.fillText(`${s.name}`, pTop.screenX, pTop.screenY - signSize - 5);
      }
    }
  });
}

function renderEntities(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  camera: any,
  entities: VisionEntity[],
  showBoxes: boolean,
  showTrails: boolean,
  selectedEntity: VisionEntity | null,
  isEmergencyActive: boolean
) {
  // Sort entities by distance Y descending (draw far entities first, near entities on top)
  const sorted = [...entities].sort((a, b) => b.y - a.y);

  sorted.forEach((e) => {
    // 1. Draw Motion Trail
    if (showTrails && e.trail.length > 1) {
      ctx.strokeStyle =
        e.class === 'pedestrian'
          ? 'rgba(16, 185, 129, 0.5)'
          : e.class === 'bicycle'
          ? 'rgba(168, 85, 247, 0.5)'
          : 'rgba(56, 189, 248, 0.45)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      e.trail.forEach((pt, idx) => {
        if (idx === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.stroke();
    }

    // 2. Render 3D Wireframe / Vehicle Body
    const pBase = project3DTo2D(e.x, e.y, 0, width, height, camera);
    const pTop = project3DTo2D(e.x, e.y, e.height, width, height, camera);

    if (!pBase.isVisible) return;

    const boxW = Math.max(14, e.bbox.width);
    const boxH = Math.max(16, e.bbox.height);
    const boxX = pBase.screenX - boxW / 2;
    const boxY = pTop.screenY;

    // Determine Box Color Scheme
    let strokeColor = '#38bdf8'; // Blue for vehicles
    let badgeBg = 'rgba(2, 132, 199, 0.85)';
    if (e.class === 'pedestrian') {
      strokeColor = '#10b981'; // Green for pedestrians
      badgeBg = 'rgba(5, 150, 105, 0.85)';
    } else if (e.class === 'bicycle' || e.class === 'motorcycle') {
      strokeColor = '#a855f7'; // Purple for cyclists
      badgeBg = 'rgba(147, 51, 234, 0.85)';
    } else if (e.class === 'bus' || e.class === 'truck') {
      strokeColor = '#06b6d4'; // Cyan for heavy vehicles
      badgeBg = 'rgba(8, 145, 178, 0.85)';
    }

    // Threat overrides
    if (e.proximityRisk === 'CRITICAL' || (isEmergencyActive && e.isEmergencyTarget)) {
      strokeColor = '#ef4444'; // Red for critical threat
      badgeBg = 'rgba(220, 38, 38, 0.95)';
    } else if (e.proximityRisk === 'HIGH') {
      strokeColor = '#f59e0b'; // Amber for high warning
      badgeBg = 'rgba(217, 119, 6, 0.9)';
    }

    // Occluded ghost styling
    const isOccluded = e.trackStatus === 'occluded';
    if (isOccluded) {
      strokeColor = 'rgba(245, 158, 11, 0.7)';
      badgeBg = 'rgba(180, 83, 9, 0.85)';
    }

    // Vehicle/Pedestrian Silhouette Drawing
    if (e.class === 'pedestrian') {
      // Walking Pedestrian Figure
      ctx.fillStyle = strokeColor;
      // Head
      ctx.beginPath();
      ctx.arc(pBase.screenX, boxY + boxH * 0.2, boxW * 0.35, 0, Math.PI * 2);
      ctx.fill();
      // Torso & Legs
      ctx.fillRect(pBase.screenX - boxW * 0.25, boxY + boxH * 0.35, boxW * 0.5, boxH * 0.45);
      // Legs stride
      ctx.lineWidth = 2;
      ctx.strokeStyle = strokeColor;
      ctx.beginPath();
      ctx.moveTo(pBase.screenX - boxW * 0.2, boxY + boxH * 0.8);
      ctx.lineTo(pBase.screenX - boxW * 0.35, pBase.screenY);
      ctx.moveTo(pBase.screenX + boxW * 0.2, boxY + boxH * 0.8);
      ctx.lineTo(pBase.screenX + boxW * 0.35, pBase.screenY);
      ctx.stroke();
    } else {
      // Vehicle 3D block
      ctx.fillStyle = isOccluded ? 'rgba(30, 41, 59, 0.4)' : '#1e293b';
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1.5;

      // Body box
      ctx.fillRect(boxX, boxY, boxW, boxH);
      ctx.strokeRect(boxX, boxY, boxW, boxH);

      // Headlights / Taillights
      ctx.fillStyle = e.vy > 0 ? '#ef4444' : '#fef08a'; // Red if leading, yellow if approaching
      const lightSize = Math.max(3, boxW * 0.15);
      ctx.fillRect(boxX + 2, pBase.screenY - lightSize - 2, lightSize, lightSize);
      ctx.fillRect(boxX + boxW - lightSize - 2, pBase.screenY - lightSize - 2, lightSize, lightSize);
    }

    // 3. Draw Bounding Box & Target Reticle HUD
    if (showBoxes) {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = isOccluded ? 1.5 : 2;
      if (isOccluded) ctx.setLineDash([4, 4]);

      // Draw high-precision corner brackets
      const cornerLen = Math.min(8, boxW * 0.3, boxH * 0.3);
      ctx.beginPath();
      // Top-Left
      ctx.moveTo(boxX, boxY + cornerLen);
      ctx.lineTo(boxX, boxY);
      ctx.lineTo(boxX + cornerLen, boxY);
      // Top-Right
      ctx.moveTo(boxX + boxW - cornerLen, boxY);
      ctx.lineTo(boxX + boxW, boxY);
      ctx.lineTo(boxX + boxW, boxY + cornerLen);
      // Bottom-Right
      ctx.moveTo(boxX + boxW, boxY + boxH - cornerLen);
      ctx.lineTo(boxX + boxW, boxY + boxH);
      ctx.lineTo(boxX + boxW - cornerLen, boxY + boxH);
      // Bottom-Left
      ctx.moveTo(boxX + cornerLen, boxY + boxH);
      ctx.lineTo(boxX, boxY + boxH);
      ctx.lineTo(boxX, boxY + boxH - cornerLen);
      ctx.stroke();
      ctx.setLineDash([]);

      // Top Tag Badge
      const tagText = isOccluded
        ? `${e.id} [OCCLUDED]`
        : `${e.id} | ${e.confidence.toFixed(0)}%`;
      ctx.font = 'bold 9px "JetBrains Mono", monospace';
      const textMetrics = ctx.measureText(tagText);
      const tagWidth = textMetrics.width + 8;
      const tagHeight = 14;

      ctx.fillStyle = badgeBg;
      ctx.fillRect(boxX, boxY - tagHeight, tagWidth, tagHeight);

      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(tagText, boxX + 4, boxY - tagHeight / 2);

      // Distance & Speed bottom badge
      const distText = `${e.distanceMeters}m | ${e.speedKmh}km/h`;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(boxX, boxY + boxH, textMetrics.width + 6, 12);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '8px "JetBrains Mono", monospace';
      ctx.fillText(distText, boxX + 3, boxY + boxH + 6);
    }

    // Selected Entity Highlight Reticle
    if (selectedEntity?.id === e.id) {
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(pBase.screenX, boxY + boxH / 2, Math.max(boxW, boxH) * 0.8, 0, Math.PI * 2);
      ctx.stroke();
    }
  });
}

function renderBEVMode(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  entities: VisionEntity[],
  lane: any,
  risk: any
) {
  // Top-Down Tactical Grid
  ctx.fillStyle = '#070b14';
  ctx.fillRect(0, 0, width, height);

  // Radar Concentric Distance Rings (10m, 20m, 30m, 40m, 60m, 80m)
  const centerX = width / 2;
  const bottomY = height * 0.92;
  ctx.strokeStyle = 'rgba(6, 182, 212, 0.2)';
  ctx.lineWidth = 1;

  [15, 30, 45, 60, 80].forEach((dist) => {
    const { bevY } = project3DToBEV(0, dist, width, height);
    const radius = bottomY - bevY;
    ctx.beginPath();
    ctx.arc(centerX, bottomY, radius, Math.PI, 0);
    ctx.stroke();

    ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillText(`${dist}m`, centerX + 8, bevY - 4);
  });

  // Top-Down Road Lanes
  [-3.8, 0, 3.8].forEach((lx) => {
    const p1 = project3DToBEV(lx, 2, width, height);
    const p2 = project3DToBEV(lx, 85, width, height);
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([8, 10]);
    ctx.beginPath();
    ctx.moveTo(p1.bevX, p1.bevY);
    ctx.lineTo(p2.bevX, p2.bevY);
    ctx.stroke();
    ctx.setLineDash([]);
  });

  // Ego-Vehicle at Bottom Center
  ctx.fillStyle = '#06b6d4';
  ctx.fillRect(centerX - 12, bottomY - 24, 24, 42);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 9px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('EGO', centerX, bottomY - 4);

  // Ego Safety Corridor Fan
  ctx.fillStyle = 'rgba(6, 182, 212, 0.08)';
  ctx.beginPath();
  ctx.moveTo(centerX - 16, bottomY);
  ctx.lineTo(centerX - 60, height * 0.2);
  ctx.lineTo(centerX + 60, height * 0.2);
  ctx.lineTo(centerX + 16, bottomY);
  ctx.closePath();
  ctx.fill();

  // Render Entities on Radar Map
  entities.forEach((e) => {
    const { bevX, bevY } = project3DToBEV(e.x, e.y, width, height);

    let color = '#38bdf8';
    if (e.class === 'pedestrian') color = '#10b981';
    else if (e.class === 'bicycle') color = '#a855f7';
    if (e.proximityRisk === 'CRITICAL') color = '#ef4444';

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(bevX, bevY, e.class === 'bus' || e.class === 'truck' ? 8 : 5, 0, Math.PI * 2);
    ctx.fill();

    // Velocity Vector Ray
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(bevX, bevY);
    ctx.lineTo(bevX + e.vx * 8, bevY - e.vy * 8);
    ctx.stroke();

    // Label
    ctx.fillStyle = '#f1f5f9';
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.fillText(`${e.id} (${e.distanceMeters}m)`, bevX + 8, bevY);
  });
}

function renderWeatherEffects(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  weather: string
) {
  if (weather === 'rain') {
    // Dynamic rain drops
    ctx.strokeStyle = 'rgba(186, 230, 253, 0.25)';
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 70; i++) {
      const rx = Math.random() * width;
      const ry = Math.random() * height;
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx - 4, ry + 16);
      ctx.stroke();
    }
  } else if (weather === 'fog') {
    // Dense fog mist overlay
    const fogGrad = ctx.createLinearGradient(0, 0, 0, height);
    fogGrad.addColorStop(0, 'rgba(148, 163, 184, 0.45)');
    fogGrad.addColorStop(0.5, 'rgba(148, 163, 184, 0.3)');
    fogGrad.addColorStop(1, 'rgba(148, 163, 184, 0.1)');
    ctx.fillStyle = fogGrad;
    ctx.fillRect(0, 0, width, height);
  } else if (weather === 'night') {
    // Headlight cone illumination
    const coneGrad = ctx.createRadialGradient(
      width / 2,
      height,
      30,
      width / 2,
      height * 0.5,
      350
    );
    coneGrad.addColorStop(0, 'rgba(254, 240, 138, 0.25)');
    coneGrad.addColorStop(0.6, 'rgba(254, 240, 138, 0.08)');
    coneGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = coneGrad;
    ctx.fillRect(0, 0, width, height);
  }
}

function renderCanvasHUD(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  risk: any,
  weather: string,
  entityCount: number,
  isEmergencyActive: boolean
) {
  // Top HUD Bar
  ctx.fillStyle = 'rgba(6, 9, 19, 0.85)';
  ctx.fillRect(0, 0, width, 32);
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, 32);
  ctx.lineTo(width, 32);
  ctx.stroke();

  // Status text left
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 11px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('CAM 01 // HIGHWAY PERCEPTION VIEW', 12, 16);

  // Center threat status
  ctx.textAlign = 'center';
  if (isEmergencyActive) {
    ctx.fillStyle = '#ef4444';
    ctx.fillText('CRITICAL ROAD SAFETY EVENT — AEB ENGAGED', width / 2, 16);
  } else {
    ctx.fillStyle = risk.overallLevel === 'LOW' ? '#10b981' : '#f59e0b';
    ctx.fillText(`THREAT LEVEL: ${risk.overallLevel} | TTC: ${risk.ttcSeconds}s`, width / 2, 16);
  }

  // Right info
  ctx.textAlign = 'right';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(`TRACKED: ${entityCount} | WEATHER: ${weather.toUpperCase()}`, width - 12, 16);
}

function drawCVOverlayHUD(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  filterName: string
) {
  ctx.fillStyle = 'rgba(6, 182, 212, 0.9)';
  ctx.font = 'bold 12px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`[LIVE CV FILTER] ${filterName}`, width / 2, 50);
}
