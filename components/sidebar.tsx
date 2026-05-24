import Link from 'next/link';
import { Brand } from './ui';

type NavKey = 'dashboard' | 'anlagen' | 'bots' | 'connectors' | 'finance' | 'workflows' | 'activity';

const items: { label: string; icon: string; href: string; key: NavKey }[] = [
  { label: 'Dashboard', icon: '◇', href: '/dashboard', key: 'dashboard' },
  { label: 'Anlagen', icon: '☀', href: '/anlagen', key: 'anlagen' },
  { label: 'Bots', icon: '◈', href: '/bots', key: 'bots' },
  { label: 'Connectoren', icon: '⌘', href: '/connectors', key: 'connectors' },
  { label: 'Finanzen', icon: '₣', href: '/finance', key: 'finance' },
  { label: 'Workflows', icon: '→', href: '/dashboard', key: 'workflows' },
  { label: 'Aktivität', icon: '≡', href: '/dashboard', key: 'activity' },
];

const accountItems = [
  { label: 'Team', icon: '○' },
  { label: 'Einstellungen', icon: '✱' },
  { label: 'Support', icon: '?' },
];

function NavItem({ label, icon, href, active }: { label: string; icon: string; href: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2.5 h-9 px-2.5 rounded-lg ${
        active ? 'bg-surface-2 text-fg' : 'text-fg2 hover:text-fg hover:bg-surface'
      }`}
    >
      <span className={`text-sm ${active ? 'text-accent' : 'text-fg2'}`}>{icon}</span>
      <span className={`text-[13px] ${active ? 'font-medium' : ''}`}>{label}</span>
    </Link>
  );
}

export function Sidebar({ active }: { active: NavKey }) {
  return (
    <aside className="w-[248px] shrink-0 bg-bg border-r border-line flex flex-col py-6 px-5 h-screen sticky top-0">
      <Brand />
      <div className="mt-7" />

      <p className="text-[10px] font-medium text-fg4 tracking-[0.16em] mb-2">MENÜ</p>
      <nav className="flex flex-col gap-0.5">
        {items.map((it) => (
          <NavItem key={it.label} label={it.label} icon={it.icon} href={it.href} active={it.key === active} />
        ))}
      </nav>

      <p className="text-[10px] font-medium text-fg4 tracking-[0.16em] mb-2 mt-6">ACCOUNT</p>
      <nav className="flex flex-col gap-0.5">
        {accountItems.map((it) => (
          <NavItem key={it.label} label={it.label} icon={it.icon} href="/dashboard" active={false} />
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
    </aside>
  );
}
