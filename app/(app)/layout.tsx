import { ReactNode } from 'react';
import { CommandPalette } from '@/components/command-palette';
import { DemoBookCTA } from '@/components/birdie-guide';
import { isDemoMode } from '@/app/lib/demo-mode';

export default function AppLayout({ children }: { children: ReactNode }) {
  const demo = isDemoMode();
  return (
    <div className="flex min-h-screen bg-bg text-fg">
      {children}
      <CommandPalette />
      {demo && <DemoBookCTA />}
    </div>
  );
}
