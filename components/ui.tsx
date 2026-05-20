import { ReactNode } from 'react';

export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <div
      className="flex items-center justify-center bg-accent text-bg font-bold"
      style={{ width: size, height: size, borderRadius: size * 0.32, fontSize: size * 0.7, lineHeight: 1 }}
    >
      .
    </div>
  );
}

export function Brand({ admin = false }: { admin?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <LogoMark />
      <div className="flex items-center">
        <span className="text-accent font-bold text-lg leading-none">.</span>
        <span className="font-semibold text-lg tracking-tightest leading-none">birdie</span>
      </div>
      {admin && (
        <span className="ml-1 px-1.5 py-0.5 rounded bg-accent-bg text-accent font-semibold text-[9px] tracking-[0.16em]">
          ADMIN
        </span>
      )}
    </div>
  );
}

type PillTone = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'accent' | 'purple';
const toneMap: Record<PillTone, { fg: string; bg: string }> = {
  success: { fg: 'text-success', bg: 'bg-success-bg' },
  warning: { fg: 'text-warning', bg: 'bg-warning-bg' },
  error: { fg: 'text-error', bg: 'bg-error-bg' },
  info: { fg: 'text-info', bg: 'bg-info-bg' },
  accent: { fg: 'text-accent', bg: 'bg-accent-bg' },
  purple: { fg: 'text-purple', bg: 'bg-purple-bg' },
  neutral: { fg: 'text-fg2', bg: 'bg-surface-3' },
};
const dotColor: Record<PillTone, string> = {
  success: 'bg-success',
  warning: 'bg-warning',
  error: 'bg-error',
  info: 'bg-info',
  accent: 'bg-accent',
  purple: 'bg-purple',
  neutral: 'bg-fg2',
};

export function Pill({ label, tone = 'info', dot = true }: { label: string; tone?: PillTone; dot?: boolean }) {
  const t = toneMap[tone];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full ${t.bg} ${t.fg} font-medium text-[10px] tracking-[0.16em]`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColor[tone]}`} />}
      {label}
    </span>
  );
}

export function Tag({ label, tone = 'neutral' }: { label: string; tone?: PillTone }) {
  const t = toneMap[tone];
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded ${t.bg} ${t.fg} font-medium text-[10px] tracking-[0.16em]`}>
      {label}
    </span>
  );
}

export function KpiCard({
  label,
  value,
  sub,
  delta,
  deltaTone = 'success',
  valueColor,
}: {
  label: string;
  value: string;
  sub: string;
  delta?: string;
  deltaTone?: 'success' | 'error';
  valueColor?: string;
}) {
  return (
    <div className="flex-1 min-w-0 bg-surface border border-line rounded-xl p-5 flex flex-col gap-2">
      <div className="flex items-center">
        <span className="font-medium text-[10px] text-fg2 tracking-[0.16em]">{label}</span>
        {delta && (
          <span
            className={`ml-auto inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
              deltaTone === 'success' ? 'bg-success-bg text-success' : 'bg-error-bg text-error'
            }`}
          >
            {delta}
          </span>
        )}
      </div>
      <div className={`font-semibold text-[28px] leading-none tracking-tightest ${valueColor ?? 'text-fg'}`}>
        {value}
      </div>
      <div className="text-[11px] text-fg3">{sub}</div>
    </div>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`bg-surface border border-line rounded-xl ${className}`}>{children}</div>;
}

export function CardHeader({ title, right }: { title: string; right?: ReactNode }) {
  return (
    <div className="h-13 px-5 border-b border-line flex items-center" style={{ height: 52 }}>
      <h3 className="font-semibold text-sm text-fg">{title}</h3>
      {right && <div className="ml-auto">{right}</div>}
    </div>
  );
}
