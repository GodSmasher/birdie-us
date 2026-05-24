// Real connector status — derived from configured env credentials + DB sync state,
// not a hardcoded list. Drives the Connectoren page.

import { getDb, tenantId } from './db';

export interface ConnStatus {
  id: string;
  name: string;
  category: string;
  protocol: string;
  connected: boolean;
  detail: string;
  lastSync?: string;
}

function env(...keys: string[]): boolean {
  return keys.every((k) => !!process.env[k]);
}

export async function getConnectorStatuses(): Promise<{ connected: ConnStatus[]; available: ConnStatus[] }> {
  const reonic = env('REONIC_API_KEY', 'REONIC_CLIENT_ID');
  const google = env('GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN');
  const sevdesk = env('SEVDESK_API_KEY');
  const ecoflow = env('ECOFLOW_ACCESS_KEY', 'ECOFLOW_SECRET_KEY');
  const db = env('SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY');

  // Reonic detail from DB (entity counts + last sync)
  let reonicDetail = 'Leads · Angebote · Komponenten';
  let reonicLastSync: string | undefined;
  if (reonic && db) {
    const client = getDb();
    const tid = await tenantId('volta');
    if (client && tid) {
      const counts: Record<string, number> = {};
      for (const kind of ['component', 'offer', 'contact']) {
        const { count } = await client.from('entities').select('external_id', { count: 'exact', head: true }).eq('tenant_id', tid).eq('kind', kind);
        counts[kind] = count ?? 0;
      }
      reonicDetail = `${counts.offer ?? 0} Angebote · ${counts.contact ?? 0} Kontakte · ${counts.component ?? 0} Artikel`;
      const { data } = await client.from('sync_runs').select('finished_at').eq('tenant_id', tid).eq('connector', 'reonic').order('started_at', { ascending: false }).limit(1);
      reonicLastSync = data?.[0]?.finished_at ?? undefined;
    }
  }

  const all: ConnStatus[] = [
    { id: 'reonic', name: 'Reonic CRM', category: 'CRM / ERP', protocol: 'REST v2', connected: reonic, detail: reonicDetail, lastSync: reonicLastSync },
    { id: 'gmail', name: 'Gmail', category: 'Kommunikation', protocol: 'Gmail API', connected: google, detail: 'Posteingang · Versand' },
    { id: 'google-calendar', name: 'Google Calendar', category: 'Termine', protocol: 'Calendar API', connected: google, detail: 'Alle Workspace-Kalender' },
    { id: 'google-drive', name: 'Google Drive', category: 'Dateien / Wissen', protocol: 'Drive API', connected: google, detail: 'Ordner & Dokumente pro Bereich' },
    { id: 'supabase', name: 'Supabase', category: 'Datenbank', protocol: 'Postgres', connected: db, detail: 'Persistenz · Time-Series' },
    { id: 'sevdesk', name: 'sevDesk', category: 'Buchhaltung', protocol: 'REST v1', connected: sevdesk, detail: 'Rechnungen · Mahnwesen' },
    { id: 'ecoflow', name: 'EcoFlow', category: 'Speicher / WR', protocol: 'IoT API', connected: ecoflow, detail: 'PV · Batterie live' },
    { id: 'awattar', name: 'aWATTar', category: 'Stromtarif', protocol: 'REST', connected: false, detail: 'Dynamische Börsenpreise' },
    { id: 'tibber', name: 'Tibber', category: 'Stromtarif', protocol: 'GraphQL', connected: false, detail: 'Echtzeit-Tarife' },
    { id: 'solcast', name: 'Solcast', category: 'Prognose', protocol: 'REST', connected: false, detail: 'PV-Ertragsprognose' },
    { id: 'fronius', name: 'Fronius', category: 'Wechselrichter', protocol: 'Solar.web / Modbus', connected: false, detail: 'geplant' },
    { id: 'sma', name: 'SMA', category: 'Wechselrichter', protocol: 'ennexOS / Modbus', connected: false, detail: 'geplant' },
    { id: 'datev', name: 'DATEV', category: 'Lohnbüro', protocol: 'DATEVconnect', connected: false, detail: 'geplant' },
  ];

  return {
    connected: all.filter((c) => c.connected),
    available: all.filter((c) => !c.connected),
  };
}
