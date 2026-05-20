import { ReactNode } from 'react';
import { CommandPalette } from '@/components/command-palette';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-bg text-fg">
      {children}
      <CommandPalette />
    </div>
  );
}
