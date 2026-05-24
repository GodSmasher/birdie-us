import { getEntities } from '@/app/lib/db';
import type { RawOffer } from '@/app/lib/reonic-server';

export const dynamic = 'force-dynamic';

const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : 0);
const eur = (n: number) => Math.round(n).toLocaleString('de-DE');
const cell = (v: unknown) => {
  const s = String(v ?? '');
  return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

// Summary CSV: one row per salesperson with KPIs.
export async function GET() {
  const [offers, users] = await Promise.all([
    getEntities<RawOffer>('offer'),
    getEntities<{ id: string; name: string }>('user'),
  ]);
  const names = new Map(users.map((u) => [u.id, u.name]));

  const agg = new Map<string, { won: number; wonVal: number; lost: number; open: number; openVal: number; total: number }>();
  for (const o of offers) {
    const id = o.assignedToId;
    if (!id) continue;
    const a = agg.get(id) ?? { won: 0, wonVal: 0, lost: 0, open: 0, openVal: 0, total: 0 };
    a.total++;
    if (o.state === 'Won') { a.won++; a.wonVal += num(o.totalPlannedPrice); }
    else if (o.state === 'Lost') a.lost++;
    else if (o.state === 'Open') { a.open++; a.openVal += num(o.totalPlannedPrice); }
    agg.set(id, a);
  }

  const rows = [...agg.entries()]
    .map(([id, a]) => ({ name: names.get(id) ?? id, ...a, rate: a.won + a.lost > 0 ? Math.round((a.won / (a.won + a.lost)) * 100) : 0 }))
    .sort((x, y) => y.wonVal - x.wonVal);

  const lines = ['Verkäufer;Angebote;Offen;Pipeline (EUR);Gewonnen;Gewonnen (EUR);Verloren;Abschlussquote (%)'];
  for (const r of rows) {
    lines.push([cell(r.name), r.total, r.open, eur(r.openVal), r.won, eur(r.wonVal), r.lost, r.rate].join(';'));
  }

  return new Response('﻿' + lines.join('\r\n'), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="vertrieb-gesamtreport.csv"`,
    },
  });
}
