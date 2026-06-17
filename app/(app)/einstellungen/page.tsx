import Link from 'next/link';
import { Sidebar } from '@/components/sidebar';
import { TopBar } from '@/components/topbar';
import { Card, Pill } from '@/components/ui';
import { getConnectorStatuses } from '@/app/lib/connector-status';
import { isDemoMode } from '@/app/lib/demo-mode';
import { DemoView } from '@/components/birdie-guide';

export const dynamic = 'force-dynamic';

export default async function EinstellungenPage() {
  if (isDemoMode()) {
    return (
      <>
        <Sidebar active="einstellungen" />
        <main className="flex-1 min-w-0 flex flex-col bg-bg">
          <TopBar title="Settings" subtitle="Profile · Connectors · Security" />
          <DemoView message="Your control panel — company profile, connected tools, security settings. Everything configurable once you're set up.">
            <div className="flex flex-col gap-4 max-w-[820px]">
              <Card className="p-5 flex flex-col gap-4 opacity-75">
                <h3 className="font-semibold text-[13px] text-fg">Profile</h3>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-bg font-semibold">SV</div>
                  <div className="flex flex-col"><span className="text-sm font-medium text-fg">Alex Rivera</span><span className="text-xs text-fg2">Volta Solar Systems · Administrator</span></div>
                </div>
              </Card>
              <Card className="p-5 flex flex-col gap-3 opacity-75">
                <h3 className="font-semibold text-[13px] text-fg">Security</h3>
                {['Password access (Gate)','2FA for login','Data hosting — US / SOC 2','Connector secrets — encrypted'].map(s => (
                  <div key={s} className="flex items-center text-xs text-fg2 py-1 border-t border-line first:border-0">{s}</div>
                ))}
              </Card>
            </div>
          </DemoView>
        </main>
      </>
    );
  }
  const { connected } = await getConnectorStatuses();
  return (
    <>
      <Sidebar active="einstellungen" />
      <main className="flex-1 min-w-0 flex flex-col bg-bg">
        <TopBar title="Settings" subtitle="Profile · Connectors · Security" />
        <div className="flex-1 px-8 py-7 flex flex-col gap-6 max-w-[820px]">
          <Card className="p-5 flex flex-col gap-4">
            <h3 className="font-semibold text-[13px] text-fg">Profile</h3>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-bg font-semibold">SV</div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-fg">Alex Rivera</span>
                <span className="text-xs text-fg2">Volta Solar Systems · Administrator</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <Row k="Company" v="Volta Solar Systems" />
              <Row k="Industry" v="Solar" />
              <Row k="Region" v="Austin, TX (US)" />
              <Row k="Language" v="English" />
            </div>
          </Card>

          <Card className="p-5 flex flex-col gap-4">
            <div className="flex items-center">
              <h3 className="font-semibold text-[13px] text-fg">Connected Connectors</h3>
              <Link href="/connectors" className="ml-auto text-[11px] font-medium text-accent">View all →</Link>
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
              <h3 className="font-semibold text-[13px] text-fg">Files & Knowledge</h3>
              <Link href="/dateien" className="ml-auto text-[11px] font-medium text-accent">Open →</Link>
            </div>
            <p className="text-xs text-fg2 leading-[18px]">
              Your Drive storage by area — guides, operating procedures, records. Browsable directly from .birdie.
            </p>
          </Card>

          <Card className="p-5 flex flex-col gap-4">
            <h3 className="font-semibold text-[13px] text-fg">Security</h3>
            <div className="flex flex-col gap-2.5">
              <SecRow label="Password access (Gate)" status="active" tone="success" />
              <SecRow label="2FA for login" status="recommended" tone="warning" />
              <SecRow label="Data hosting" status="US / SOC 2" tone="success" />
              <SecRow label="Connector secrets" status="encrypted (Vercel)" tone="success" />
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
