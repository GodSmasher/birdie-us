import { ReactNode } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: 'birdie — %s',
    default: 'birdie CRM',
  },
};

export default function DemoLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-bg text-fg">
      {children}
    </div>
  );
}
