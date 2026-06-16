export type AnomalyType = 'setter_call_volume_drop' | 'setter_call_volume_spike' | 'reach_rate_drop' | 'appointment_rate_drop' | 'lead_ingestion_stopped' | 'project_phase_stuck' | 'invoice_overdue_spike' | 'connector_sync_failure' | 'call_quality_drop' | 'offer_win_rate_drop' | 'stalled_projects' | 'revenue_drop';
export type AnomalySeverity = 'critical' | 'warning' | 'info';
export interface Anomaly {
    id: string;
    tenantId: string;
    type: AnomalyType;
    severity: AnomalySeverity;
    entityId: string | null;
    entityName: string | null;
    metric: string;
    currentValue: number;
    baselineValue: number;
    deviationPct: number;
    message: string;
    detectedAt: string;
    resolvedAt: string | null;
    isActive: boolean;
}
export declare const ANOMALY_TYPE_LABELS: Record<AnomalyType, string>;
export declare const ANOMALY_SEVERITY_LABELS: Record<AnomalySeverity, string>;
//# sourceMappingURL=anomaly.d.ts.map