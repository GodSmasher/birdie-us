import Link from 'next/link';
import { Sidebar } from '@/components/sidebar';
import { TopBar } from '@/components/topbar';
import { Card, Pill } from '@/components/ui';
import { getConnectorStatuses } from '@/app/lib/connector-status';

export const dynamic = 'force-dynamic';

export default async function EinstellungenPage() {
  const { connected } = await getConnectorStatuses();
  return (
    <>
      <Sidebar active="einstellungen" />
      <main className="flex-1 min-w-0 flex flex-col bg-bg">
        <TopBar title="Einstellungen" subtitle="Profil · Connectoren · Sicherheit" />
        <div className="flex-1 px-8 py-7 flex flex-col gap-6 max-w-[820px]">
          <Card className="p-5 flex flex-col gap-4">
            <h3 className="font-semibold text-[13px] text-fg">Profil</h3>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-bg font-semibold">SV</div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-fg">Sarah Vogel</span>
                <span className="text-xs text-fg2">Volta Solaranlagen · Administrator</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <Row k="Firma" v="Volta Solaranlagen" />
              <Row k="Branche" v="Solar" />
              <Row k="Region" v="Frankfurt (EU)" />
              <Row k="Sprache" v="Deutsch" />
            </div>
          </Card>

          <Card className="p-5 flex flex-col gap-4">
            <div className="flex items-center">
              <h3 className="font-semibold text-[13px] text-fg">Verbundene Connectoren</h3>
              <Link href="/connectors" className="ml-auto text-[11px] font-medium text-accent">Alle ansehen →</Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {connected.map((c) => (
                <span key={c.id} className="inline-flex items-center gap-2 px-3 py-1.5 bg-surface-2 border border-line rounded-lg text-xs text-fg">
                  <span className="w-1.5 h-1.5 rounded-full bg-success" /> {c.name}
                </span>
              ))}
            </div>
          </Card>

          <Card className="p-5 flex flex-col gap-3">
            <div className="flex items-center">
              <h3 className="font-semibold text-[13px] text-fg">Dateien & Wissen</h3>
              <Link href="/dateien" className="ml-auto text-[11px] font-medium text-accent">Öffnen →</Link>
            </div>
            <p className="text-xs text-fg2 leading-[18px]">
              Eure Drive-Ablage pro Bereich — Anleitungen, Dienstanweisungen, Belege. Direkt aus .birdie durchblätterbar.
            </p>
          </Card>

          <Card className="p-5 flex flex-col gap-4">
            <h3 className="font-semibold text-[13px] text-fg">Sicherheit</h3>
            <div className="flex flex-col gap-2.5">
              <SecRow label="Passwort-Zugang (Gate)" status="aktiv" tone="success" />
              <SecRow label="2FA für Login" status="empfohlen" tone="warning" />
              <SecRow label="Daten-Hosting" status="EU / DSGVO" tone="success" />
              <SecRow label="Connectoren-Secrets" status="verschlüsselt (Vercel)" tone="success" />
            </div>
          </Card>
        </div>
      </main>
    </>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between bg-surface-2 rounded-lg px-3 py-2">
      <span className="text-fg3">{k}</span>
      <span className="text-fg font-medium">{v}</span>
    </div>
  );
}

function SecRow({ label, status, tone }: { label: string; status: string; tone: 'success' | 'warning' }) {
  return (
    <div className="flex items-center">
      <span className="text-xs text-fg2">{label}</span>
      <span className="ml-auto"><Pill label={status.toUpperCase()} tone={tone} /></span>
    </div>
  );
}
