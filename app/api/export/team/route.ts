import { getEntities } from '@/app/lib/db';
import type { RawOffer } from '@/app/lib/reonic-server';

export const dynamic = 'force-dynamic';

const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : 0);
const eur = (n: number) => Math.round(n).toLocaleString('de-DE');
const cell = (v: unknown) => {
  const s = String(v ?? '');
  return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
function customerName(c: unknown, fb?: string): string {
  if (typeof c === 'string' && c.trim()) return c;
  if (c && typeof c === 'object') {
    const o = c as Record<string, unknown>;
    const n = [o.firstName, o.lastName].filter(Boolean).join(' ').trim();
    if (n) return n;
    if (typeof o.name === 'string') return o.name;
  }
  return fb ?? '—';
}

export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return new Response('id fehlt', { status: 400 });

  const [offers, teams] = await Promise.all([
    getEntities<RawOffer>('offer'),
    getEntities<{ id: string; name: string }>('team'),
  ]);
  const name = teams.find((t) => t.id === id)?.name ?? id;
  const mine = offers.filter((o) => o.assignedTeamIds?.includes(id));

  const open = mine.filter((o) => o.state === 'Open');
  const won = mine.filter((o) => o.state === 'Won');
  const lost = mine.filter((o) => o.state === 'Lost');
  const sum = (a: RawOffer[]) => a.reduce((s, o) => s + num(o.totalPlannedPrice), 0);
  const rate = won.length + lost.length > 0 ? Math.round((won.length / (won.length + lost.length)) * 100) : 0;

  const lines = [
    `Team-Report;${cell(name)}`,
    `Erstellt;${new Date().toLocaleDateString('de-DE')}`,
    '',
    'Kennzahl;Wert',
    `Angebote gesamt;${mine.length}`,
    `Offen;${open.length}`,
    `Pipeline (EUR);${eur(sum(open))}`,
    `Gewonnen;${won.length}`,
    `Gewonnen (EUR);${eur(sum(won))}`,
    `Verloren;${lost.length}`,
    `Abschlussquote (%);${rate}`,
    '',
    'Angebot;Kunde;Status;State;Wert (EUR)',
    ...mine.map((o) => [cell(o.name ?? ''), cell(customerName(o.customer, o.customerNumber)), cell(o.status ?? ''), cell(o.state ?? ''), eur(num(o.totalPlannedPrice))].join(';')),
  ];

  const safe = name.replace(/[^\w.-]+/g, '_');
  return new Response('﻿' + lines.join('\r\n'), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="team-${safe}.csv"`,
    },
  });
}
