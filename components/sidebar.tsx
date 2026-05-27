'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Brand } from './ui';

type NavKey =
  | 'dashboard' | 'anlagen' | 'vertrieb' | 'katalog' | 'postfach' | 'kalender'
  | 'bots' | 'workflows' | 'connectors' | 'finance' | 'netzanmeldung' | 'dateien' | 'team' | 'einstellungen' | 'support';

const items: { label: string; icon: string; href: string; key: NavKey }[] = [
  { label: 'Dashboard', icon: '◇', href: '/dashboard', key: 'dashboard' },
  { label: 'Anlagen', icon: '☀', href: '/anlagen', key: 'anlagen' },
  { label: 'Vertrieb', icon: '↗', href: '/vertrieb', key: 'vertrieb' },
  { label: 'Netzanmeldung', icon: '⚡', href: '/netzanmeldung', key: 'netzanmeldung' },
  { label: 'Katalog', icon: '▦', href: '/katalog', key: 'katalog' },
  { label: 'Postfach', icon: '✉', href: '/postfach', key: 'postfach' },
  { label: 'Kalender', icon: '◷', href: '/kalender', key: 'kalender' },
  { label: 'Bots', icon: '◈', href: '/bots', key: 'bots' },
  { label: 'Workflows', icon: '→', href: '/workflows', key: 'workflows' },
  { label: 'Connectoren', icon: '⌘', href: '/connectors', key: 'connectors' },
  { label: 'Finanzen', icon: '₣', href: '/finance', key: 'finance' },
];

const accountItems: { label: string; icon: string; href: string; key: NavKey }[] = [
  { label: 'Team', icon: '○', href: '/team', key: 'team' },
  { label: 'Einstellungen', icon: '✱', href: '/einstellungen', key: 'einstellungen' },
  { label: 'Support', icon: '?', href: '/support', key: 'support' },
];

function NavItem({ label, icon, href, active, onClick }: { label: string; icon: string; href: string; active: boolean; onClick?: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-2.5 h-9 px-2.5 rounded-lg ${
        active ? 'bg-surface-2 text-fg' : 'text-fg2 hover:text-fg hover:bg-surface'
      }`}
    >
      <span className={`text-sm ${active ? 'text-accent' : 'text-fg2'}`}>{icon}</span>
      <span className={`text-[13px] ${active ? 'font-medium' : ''}`}>{label}</span>
    </Link>
  );
}

function SidebarContent({ active, onNavigate }: { active: NavKey; onNavigate?: () => void }) {
  return (
    <>
      <Brand />
      <div className="mt-7" />

      <p className="text-[10px] font-medium text-fg4 tracking-[0.16em] mb-2">MENU</p>
      <nav className="flex flex-col gap-0.5">
        {items.map((it) => (
          <NavItem key={it.label} label={it.label} icon={it.icon} href={it.href} active={it.key === active} onClick={onNavigate} />
        ))}
      </nav>

      <p className="text-[10px] font-medium text-fg4 tracking-[0.16em] mb-2 mt-6">ACCOUNT</p>
      <nav className="flex flex-col gap-0.5">
        {accountItems.map((it) => (
          <NavItem key={it.label} label={it.label} icon={it.icon} href={it.href} active={it.key === active} onClick={onNavigate} />
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-3">
        <div className="bg-surface rounded-lg p-3 flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-success" />
            <span className="text-xs font-medium text-fg">Alle Systeme online</span>
          </div>
          <span className="text-[11px] text-fg2">n8n · Supabase · Connectoren</span>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-bg font-semibold text-[11px]">
            SV
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-xs font-medium text-fg">Sarah Vogel</span>
            <span className="text-[11px] text-fg2">Alpen Energie GmbH</span>
          </div>
        </div>
      </div>
    </>
  );
}

export function Sidebar({ active }: { active: NavKey }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile sidebar on navigation
  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-[220px] xl:w-[248px] shrink-0 bg-bg border-r border-line flex-col py-6 px-4 xl:px-5 h-screen sticky top-0">
        <SidebarContent active={active} />
      </aside>

      {/* Mobile hamburger button — rendered by TopBar via global state */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-surface border border-line rounded-lg flex items-center justify-center text-fg2 hover:text-fg"
        aria-label="Menu"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
      </button>

      {/* Mobile overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="relative w-[280px] bg-bg border-r border-line flex flex-col py-6 px-5 h-screen overflow-y-auto z-50">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-surface border border-line flex items-center justify-center text-fg2 hover:text-fg"
              aria-label="Schliessen"
            >
              ✕
            </button>
            <SidebarContent active={active} onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}
    </>
  );
}
