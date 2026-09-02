import { SystemMetrics, TrafficRiskSummary, VisionEntity } from '../types/vision';
import { SystemAlert } from '../types/telemetry';

/**
 * Exports current detection entities and telemetry as a CSV file
 */
export function exportTelemetryCSV(
  entities: VisionEntity[],
  metrics: SystemMetrics,
  risk: TrafficRiskSummary
) {
  const timestamp = new Date().toISOString();
  
  let csv = 'VisionGuard AI - Telemetry Export Log\n';
  csv += `Export Timestamp,${timestamp}\n`;
  csv += `System FPS,${metrics.fps}\n`;
  csv += `Average Latency (ms),${metrics.latencyMs}\n`;
  csv += `Overall Risk Level,${risk.overallLevel}\n`;
  csv += `Collision Probability (%),${risk.collisionProbability}\n`;
  csv += `Active Objects Tracked,${entities.length}\n\n`;

  csv += 'Entity ID,Class,Confidence (%),Distance (m),Lateral X (m),Speed (km/h),Track Status,TTC (s),Proximity Risk\n';
  
  entities.forEach((e) => {
    csv += `"${e.id}","${e.class}",${e.confidence.toFixed(1)},${e.distanceMeters.toFixed(1)},${e.x.toFixed(2)},${e.speedKmh.toFixed(1)},"${e.trackStatus}",${e.ttcSeconds ?? 'N/A'},"${e.proximityRisk}"\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `visionguard_telemetry_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Exports full system audit data as a JSON file
 */
export function exportSystemAuditJSON(
  entities: VisionEntity[],
  metrics: SystemMetrics,
  risk: TrafficRiskSummary,
  alerts: SystemAlert[]
) {
  const auditReport = {
    system: 'VisionGuard AI — Autonomous Road Safety & Intelligent Traffic Monitoring System',
    version: '1.0.0',
    exportTimestamp: new Date().toISOString(),
    systemMetrics: metrics,
    riskEngineState: risk,
    trackedEntities: entities,
    recentAlerts: alerts,
    evaluationMetadata: {
      type: 'Prototype Academic & Educational Demonstration',
      standardReference: 'ISO 26262 Road Vehicles Functional Safety / ISO 21448 SOTIF Guidelines',
      disclaimer: 'Demonstration and simulated benchmark telemetry. Not certified for autonomous vehicle actuation.'
    }
  };

  const jsonStr = JSON.stringify(auditReport, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `visionguard_audit_${Date.now()}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
