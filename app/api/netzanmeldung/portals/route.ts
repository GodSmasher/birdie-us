// /api/netzanmeldung/portals — Portal-Credentials verwalten.
// Gated by middleware (cookie) — nur eingeloggte User können Portale pflegen.

import { NextResponse } from 'next/server';
import { savePortalCredentials, getPortals, deletePortal } from '@/app/lib/netzanmeldung';

export const dynamic = 'force-dynamic';

// GET → Liste aller Portale (ohne Passwörter, nur Status)
export async function GET() {
  const portals = await getPortals();
  // Passwörter nie an den Client senden — nur ob eins vorhanden ist
  const safe = portals.map((p) => ({
    name: p.name,
    username: p.username ?? null,
    portalUrl: p.portalUrl ?? null,
    hasPassword: p.hasPassword,
  }));
  return NextResponse.json(safe);
}

// POST → Credentials speichern
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    name?: string;
    username?: string;
    password?: string;
    portalUrl?: string;
  };
  if (!body.name || !body.username || !body.password || !body.portalUrl) {
    return NextResponse.json(
      { ok: false, message: 'name, username, password und portalUrl sind Pflicht' },
      { status: 400 },
    );
  }
  const ok = await savePortalCredentials(body.name, {
    username: body.username,
    password: body.password,
    portalUrl: body.portalUrl,
  });
  return NextResponse.json({ ok }, { status: ok ? 200 : 500 });
}

// DELETE → Portal-Eintrag löschen
export async function DELETE(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { name?: string };
  if (!body.name) {
    return NextResponse.json({ ok: false, message: 'name ist Pflicht' }, { status: 400 });
  }
  const ok = await deletePortal(body.name);
  return NextResponse.json({ ok }, { status: ok ? 200 : 404 });
}
