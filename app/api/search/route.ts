import { getDb, tenantId } from '@/app/lib/db';

export const dynamic = 'force-dynamic';

interface Hit { id: string; label: string; category: string; icon: string; href: string }

export async function GET(req: Request) {
  const raw = (new URL(req.url).searchParams.get('q') || '').trim();
  const q = raw.replace(/[^\p{L}\p{N}\s.@#-]/gu, '').slice(0, 60);
  if (q.length < 2) return Response.json({ results: [] });

  const db = getDb();
  const tid = await tenantId('volta');
  if (!db || !tid) return Response.json({ results: [] });

  const like = `%${q}%`;
  const star = `*${q}*`;
  const results: Hit[] = [];

  const base = () => db.from('entities').select('data').eq('tenant_id', tid);

  const [offers, comps, contacts] = await Promise.all([
    base().eq('kind', 'offer').ilike('data->>name', like).limit(5),
    base().eq('kind', 'component').ilike('data->>name', like).limit(5),
    base().eq('kind', 'contact').or(`data->>firstName.ilike.${star},data->>lastName.ilike.${star}`).limit(5),
  ]);

  for (const r of offers.data ?? []) {
    const d = (r as { data: { name?: string } }).data;
    results.push({ id: 'o' + results.length, label: d.name || 'Angebot', category: 'Angebot', icon: '₣', href: '/vertrieb' });
  }
  for (const r of comps.data ?? []) {
    const d = (r as { data: { name?: string; brand?: string } }).data;
    results.push({ id: 'c' + results.length, label: d.name || 'Artikel', category: d.brand ? `Artikel · ${d.brand}` : 'Artikel', icon: '▦', href: '/katalog' });
  }
  for (const r of contacts.data ?? []) {
    const d = (r as { data: { firstName?: string; lastName?: string; city?: string } }).data;
    const name = [d.firstName, d.lastName].filter(Boolean).join(' ').trim() || 'Kontakt';
    results.push({ id: 'k' + results.length, label: d.city ? `${name} · ${d.city}` : name, category: 'Kontakt', icon: '◉', href: '/vertrieb' });
  }

  return Response.json({ results });
}
