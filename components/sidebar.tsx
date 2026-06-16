'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { BirdieLogo } from './ui';

type NavKey =
  | 'dashboard' | 'anlagen' | 'vertrieb' | 'katalog' | 'postfach' | 'kalender'
  | 'bots' | 'workflows' | 'connectors' | 'finance' | 'netzanmeldung' | 'dateien' | 'team' | 'einstellungen' | 'support';

const mainItems = [
  { label: 'Dashboard', icon: '◇', href: '/dashboard', key: 'dashboard' as NavKey },
  { label: 'Interconnection', icon: '⚡', href: '/netzanmeldung', key: 'netzanmeldung' as NavKey },
  { label: 'Sales', icon: '↗', href: '/vertrieb', key: 'vertrieb' as NavKey },
  { label: 'Finance', icon: '₣', href: '/finance', key: 'finance' as NavKey },
];

const monitorItems = [
  { label: 'Fleet', icon: '☀', href: '/anlagen', key: 'anlagen' as NavKey },
  { label: 'Inbox', icon: '✉', href: '/postfach', key: 'postfach' as NavKey },
];

const autoItems = [
  { label: 'Bots', icon: '◈', href: '/bots', key: 'bots' as NavKey },
  { label: 'Workflows', icon: '→', href: '/workflows', key: 'workflows' as NavKey },
  { label: 'Connectors', icon: '⌘', href: '/connectors', key: 'connectors' as NavKey },
];

const accountItems = [
  { label: 'Settings', icon: '✱', href: '/einstellungen', key: 'einstellungen' as NavKey },
  { label: 'Support', icon: '?', href: '/support', key: 'support' as NavKey },
];

function NavItem({ label, icon, href, active, onClick }: { label: string; icon: string; href: string; active: boolean; onClick?: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-2.5 h-9 px-2.5 rounded-lg transition-colors ${
        active ? 'bg-surface-2 text-fg font-medium' : 'text-fg2 hover:text-fg hover:bg-surface'
      }`}
    >
      <span className={`text-sm w-5 text-center ${active ? 'text-accent' : 'text-fg3'}`}>{icon}</span>
      <span className="text-[13px]">{label}</span>
    </Link>
  );
}

function NavGroup({ label, items, active, onNavigate }: { label: string; items: typeof mainItems; active: NavKey; onNavigate?: () => void }) {
  return (
    <div className="mb-5">
      <p className="text-[9px] font-semibold text-fg4 tracking-[0.18em] uppercase mb-1.5 px-2.5">{label}</p>
      <nav className="flex flex-col gap-0.5">
        {items.map(it => (
          <NavItem key={it.key} label={it.label} icon={it.icon} href={it.href} active={it.key === active} onClick={onNavigate} />
        ))}
      </nav>
    </div>
  );
}

function SidebarContent({ active, onNavigate }: { active: NavKey; onNavigate?: () => void }) {
  return (
    <>
      <div className="px-1 mb-8">
        <BirdieLogo variant="light" className="h-[22px]" />
      </div>

      <NavGroup label="Core" items={mainItems} active={active} onNavigate={onNavigate} />
      <NavGroup label="Monitoring" items={monitorItems} active={active} onNavigate={onNavigate} />
      <NavGroup label="Automation" items={autoItems} active={active} onNavigate={onNavigate} />

      <div className="mt-auto" />

      <div className="bg-surface rounded-xl p-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-success shrink-0" />
          <span className="text-[11px] font-medium text-fg">All systems online</span>
        </div>
        <span className="text-[10px] text-fg3 mt-1 block pl-4">n8n &middot; Supabase &middot; Connectors</span>
      </div>

      <nav className="flex flex-col gap-0.5 mb-4">
        {accountItems.map(it => (
          <NavItem key={it.key} label={it.label} icon={it.icon} href={it.href} active={it.key === active} onClick={onNavigate} />
        ))}
      </nav>

      <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-surface transition-colors cursor-pointer">
        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-bg font-semibold text-[11px]">
          SV
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-[12px] font-medium text-fg">Sarah Vogel</span>
          <span className="text-[10px] text-fg3">birdie</span>
        </div>
      </div>
    </>
  );
}

export function Sidebar({ active }: { active: NavKey }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <>
      <aside className="hidden lg:flex w-[230px] shrink-0 bg-bg border-r border-line flex-col py-5 px-4 h-screen sticky top-0">
        <SidebarContent active={active} />
      </aside>

      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-surface border border-line rounded-lg flex items-center justify-center text-fg2 hover:text-fg"
        aria-label="Menu"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
      </button>

      {open && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="relative w-[280px] bg-bg border-r border-line flex flex-col py-5 px-5 h-screen overflow-y-auto z-50">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-surface border border-line flex items-center justify-center text-fg2 hover:text-fg"
              aria-label="Close"
            >
              &#x2715;
            </button>
            <SidebarContent active={active} onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}
    </>
  );
}
