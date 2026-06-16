"use strict";
// =============================================================================
// Enura Group Multi-Tenant BI Platform — Anomaly Types
// =============================================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.ANOMALY_SEVERITY_LABELS = exports.ANOMALY_TYPE_LABELS = void 0;
exports.ANOMALY_TYPE_LABELS = {
    setter_call_volume_drop: 'Anrufvolumen gesunken',
    setter_call_volume_spike: 'Anrufvolumen-Spitze',
    reach_rate_drop: 'Erreichbarkeitsrate gesunken',
    appointment_rate_drop: 'Terminquote gesunken',
    lead_ingestion_stopped: 'Lead-Eingang gestoppt',
    project_phase_stuck: 'Projekt blockiert',
    invoice_overdue_spike: 'Überfällige Rechnungen gestiegen',
    connector_sync_failure: 'Connector-Sync fehlgeschlagen',
    call_quality_drop: 'Anrufqualität gesunken',
    offer_win_rate_drop: 'Abschlussquote gesunken',
    stalled_projects: 'Projekte blockiert',
    revenue_drop: 'Umsatzrückgang',
};
exports.ANOMALY_SEVERITY_LABELS = {
    critical: 'Kritisch',
    warning: 'Warnung',
    info: 'Information',
};
//# sourceMappingURL=anomaly.js.map