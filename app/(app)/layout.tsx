import { ReactNode } from 'react';

export default function AppLayout({ children }: { children: ReactNode }) {
  return <div className="flex min-h-screen bg-bg text-fg">{children}</div>;
}
