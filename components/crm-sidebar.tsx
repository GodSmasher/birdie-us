'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { BirdieLogo } from './ui';

export type CrmNavKey =
  | 'dashboard' | 'leads' | 'pipeline' | 'projects' | 'interconnection'
  | 'schedule' | 'inbox' | 'reports' | 'automations' | 'integrations' | 'settings';

const navDef: [string, [CrmNavKey, string, string, string][]][] = [
  ['Overview', [['dashboard', 'Dashboard', '◇', '']]],
  ['Acquire', [['leads', 'Leads', '◎', '247'], ['pipeline', 'Pipeline', '↗', '17']]],
  ['Deliver', [['projects', 'Projects', '▤', '12'], ['interconnection', 'Interconnection', '⚡', '3'], ['schedule', 'Schedule', '▦', '']]],
  ['Operate', [['inbox', 'Inbox', '✉', '3'], ['reports', 'Reports', '◈', '']]],
  ['System', [['automations', 'Automations', '◆', ''], ['integrations', 'Integrations', '⌘', ''], ['settings', 'Settings', '✱', '']]],
];

function NavItem({ label, icon, href, active, badge, navOpen }: {
  label: string; icon: string; href: string; active: boolean; badge: string; navOpen: boolean;
}) {
  const alertKeys = ['interconnection', 'inbox'];
  const isAlert = alertKeys.some(k => href.includes(k));
  return (
    <Link
      href={href}
      className={`flex items-center gap-[11px] h-[35px] rounded-lg cursor-pointer transition-colors ${
        navOpen ? 'px-2.5' : 'px-0 justify-center'
      } ${active ? 'bg-surface-2 text-fg font-medium' : 'text-fg2 hover:text-fg hover:bg-surface'}`}
    >
      <span className={`text-[13px] w-[17px] text-center ${active ? 'text-accent' : 'text-fg3'}`}>{icon}</span>
      {navOpen && <span className="text-[13px] flex-1">{label}</span>}
      {navOpen && badge && (
        <span
          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full min-w-[20px] text-center ${
            active ? 'bg-accent text-bg' : isAlert ? 'bg-error-bg text-error' : 'bg-surface-3 text-fg2'
          }`}
        >
          {badge}
        </span>
      )}
    </Link>
  );
}

function SidebarContent({ active, navOpen }: { active: CrmNavKey; navOpen: boolean }) {
  return (
    <>
      <div className={`pb-[22px] flex items-center ${navOpen ? 'px-1.5' : 'justify-center'}`}>
        {navOpen ? (
          <BirdieLogo variant="light" className="h-[22px]" />
        ) : (
          <div className="w-7 h-7 rounded-[9px] bg-accent flex items-center justify-center text-bg font-bold text-[18px] leading-none">.</div>
        )}
      </div>

      {navDef.map(([group, items]) => (
        <div key={group} className="mb-5">
          {navOpen && (
            <p className="text-[9px] font-semibold text-fg4 tracking-[0.18em] uppercase mb-1.5 px-2.5">{group}</p>
          )}
          <nav className="flex flex-col gap-0.5">
            {items.map(([key, label, icon, badge]) => (
              <NavItem
                key={key}
                label={label}
                icon={icon}
                href={`/demo/${key === 'dashboard' ? 'dashboard' : key}`}
                active={active === key}
                badge={badge}
                navOpen={navOpen}
              />
            ))}
          </nav>
        </div>
      ))}

      <div className="mt-auto" />

      <div className={`flex items-center gap-2.5 py-2 rounded-lg hover:bg-surface transition-colors cursor-pointer ${navOpen ? 'px-2.5' : 'justify-center'}`}>
        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-bg font-semibold text-[11px] shrink-0">
          SV
        </div>
        {navOpen && (
          <div className="flex flex-col leading-tight">
            <span className="text-[12px] font-medium text-fg">Sarah Vogel</span>
            <span className="text-[10px] text-fg3">Volta Solar</span>
          </div>
        )}
      </div>
    </>
  );
}

export function CrmSidebar({ active }: { active: CrmNavKey }) {
  const [navOpen, setNavOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const resolvedActive: CrmNavKey = (() => {
    const seg = pathname.split('/').pop() || '';
    const keys: CrmNavKey[] = ['dashboard','leads','pipeline','projects','interconnection','schedule','inbox','reports','automations','integrations','settings'];
    return keys.find(k => k === seg) || active;
  })();

  return (
    <>
      {/* Desktop */}
      <aside
        className={`hidden lg:flex shrink-0 bg-bg border-r border-line flex-col h-screen sticky top-0 z-30 transition-[width] duration-150 ease-out ${
          navOpen ? 'w-[230px] py-[18px] px-[14px]' : 'w-[66px] py-[18px] px-[12px]'
        }`}
      >
        <SidebarContent active={resolvedActive} navOpen={navOpen} />
        <button
          onClick={() => setNavOpen(o => !o)}
          className="absolute -right-3 top-7 w-6 h-6 rounded-full bg-surface-2 border border-line flex items-center justify-center text-fg3 hover:text-fg text-[10px]"
        >
          {navOpen ? '◂' : '▸'}
        </button>
      </aside>

      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-surface border border-line rounded-lg flex items-center justify-center text-fg2 hover:text-fg"
        aria-label="Menu"
      >
        ☰
      </button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-[280px] bg-bg border-r border-line flex flex-col py-5 px-5 h-screen overflow-y-auto z-50">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-surface border border-line flex items-center justify-center text-fg2 hover:text-fg"
            >
              ✕
            </button>
            <SidebarContent active={resolvedActive} navOpen={true} />
          </aside>
        </div>
      )}
    </>
  );
}
