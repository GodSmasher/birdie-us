import { getEntities } from '@/app/lib/db';
import type { RawOffer } from '@/app/lib/reonic-server';

export const dynamic = 'force-dynamic';

function csvCell(v: unknown): string {
  const s = String(v ?? '');
  return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function customerName(c: unknown, fallback?: string): string {
  if (typeof c === 'string' && c.trim()) return c;
  if (c && typeof c === 'object') {
    const o = c as Record<string, unknown>;
    const n = [o.firstName, o.lastName].filter(Boolean).join(' ').trim();
    if (n) return n;
    if (typeof o.name === 'string') return o.name;
  }
  return fallback ?? '—';
}

const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : 0);
const eur = (n: number) => n.toLocaleString('de-DE', { maximumFractionDigits: 0 });

export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return new Response('id fehlt', { status: 400 });

  const [offers, users] = await Promise.all([
    getEntities<RawOffer>('offer'),
    getEntities<{ id: string; name: string }>('user'),
  ]);
  const name = users.find((u) => u.id === id)?.name ?? id;
  const mine = offers.filter((o) => o.assignedToId === id);

  const open = mine.filter((o) => o.state === 'Open');
  const won = mine.filter((o) => o.state === 'Won');
  const lost = mine.filter((o) => o.state === 'Lost');
  const sum = (a: RawOffer[]) => a.reduce((s, o) => s + num(o.totalPlannedPrice), 0);
  const closeRate = won.length + lost.length > 0 ? Math.round((won.length / (won.length + lost.length)) * 100) : 0;

  const lines: string[] = [];
  lines.push(`Vertriebsreport;${csvCell(name)}`);
  lines.push(`Erstellt;${new Date().toLocaleDateString('de-DE')}`);
  lines.push('');
  lines.push('Kennzahl;Wert');
  lines.push(`Angebote gesamt;${mine.length}`);
  lines.push(`Offen (Anzahl);${open.length}`);
  lines.push(`Offen (Pipeline EUR);${eur(sum(open))}`);
  lines.push(`Gewonnen (Anzahl);${won.length}`);
  lines.push(`Gewonnen (EUR);${eur(sum(won))}`);
  lines.push(`Verloren (Anzahl);${lost.length}`);
  lines.push(`Abschlussquote (%);${closeRate}`);
  lines.push('');
  lines.push('Angebot;Kunde;Status;State;Wert (EUR)');
  for (const o of mine) {
    lines.push([
      csvCell(o.name ?? ''),
      csvCell(customerName(o.customer, o.customerNumber)),
      csvCell(o.status ?? ''),
      csvCell(o.state ?? ''),
      eur(num(o.totalPlannedPrice)),
    ].join(';'));
  }

  const csv = '﻿' + lines.join('\r\n'); // BOM for Excel UTF-8
  const safe = name.replace(/[^\w.-]+/g, '_');
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="vertrieb-${safe}.csv"`,
    },
  });
}
