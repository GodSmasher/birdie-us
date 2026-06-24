'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BirdieLogo } from './ui';

type NavKey = 'dashboard' | 'interconnection' | 'sales' | 'fleet';

const mainItems = [
  { label: 'Dashboard', icon: '◇', href: '/demo/dashboard', key: 'dashboard' as NavKey },
  { label: 'Interconnection', icon: '⚡', href: '/demo/interconnection', key: 'interconnection' as NavKey },
  { label: 'Sales', icon: '↗', href: '/demo/dashboard', key: 'sales' as NavKey },
  { label: 'Fleet', icon: '☀', href: '/demo/dashboard', key: 'fleet' as NavKey },
];

const autoItems = [
  { label: 'Bots', icon: '◈', href: '/demo/dashboard' },
  { label: 'Workflows', icon: '→', href: '/demo/dashboard' },
  { label: 'Connectors', icon: '⌘', href: '/demo/dashboard' },
];

function NavItem({ label, icon, href, active }: { label: string; icon: string; href: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2.5 h-9 px-2.5 rounded-lg transition-colors ${
        active ? 'bg-surface-2 text-fg font-medium' : 'text-fg2 hover:text-fg hover:bg-surface'
      }`}
    >
      <span className={`text-sm w-5 text-center ${active ? 'text-accent' : 'text-fg3'}`}>{icon}</span>
      <span className="text-[13px]">{label}</span>
    </Link>
  );
}

export function DemoSidebar({ active }: { active: NavKey }) {
  const pathname = usePathname();
  const resolvedActive = pathname.includes('/interconnection') ? 'interconnection' : active;

  return (
    <>
      <button className="lg:hidden fixed top-3 left-3 z-30 w-10 h-10 rounded-lg bg-surface border border-line flex items-center justify-center text-fg2">
        ☰
      </button>
      <aside className="hidden lg:flex w-[220px] shrink-0 border-r border-line bg-bg flex-col py-5 px-3 sticky top-0 h-screen overflow-y-auto">
        <div className="flex items-center gap-2 px-2.5 mb-6">
          <BirdieLogo variant="dark" className="h-7 dark:hidden" />
          <BirdieLogo variant="light" className="h-7 hidden dark:block" />
        </div>
        <div className="mb-5">
          <p className="text-[9px] font-semibold text-fg4 tracking-[0.18em] uppercase mb-1.5 px-2.5">MAIN</p>
          <nav className="flex flex-col gap-0.5">
            {mainItems.map(it => (
              <NavItem key={it.key} label={it.label} icon={it.icon} href={it.href} active={it.key === resolvedActive} />
            ))}
          </nav>
        </div>
        <div className="mb-5">
          <p className="text-[9px] font-semibold text-fg4 tracking-[0.18em] uppercase mb-1.5 px-2.5">AUTOMATION</p>
          <nav className="flex flex-col gap-0.5">
            {autoItems.map(it => (
              <NavItem key={it.label} label={it.label} icon={it.icon} href={it.href} active={false} />
            ))}
          </nav>
        </div>
        <div className="mt-auto px-2.5">
          <div className="rounded-xl bg-accent-bg p-3 flex flex-col gap-1.5">
            <span className="text-[10px] font-semibold text-accent tracking-wider">DEMO MODE</span>
            <span className="text-[10px] text-fg2 leading-tight">Live preview with sample Oncor data</span>
          </div>
        </div>
      </aside>
    </>
  );
}
