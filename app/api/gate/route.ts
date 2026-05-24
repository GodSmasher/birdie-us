import { NextResponse } from 'next/server';

async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function POST(req: Request) {
  const expected = process.env.BIRDIE_ACCESS_PASSWORD;
  if (!expected) return NextResponse.json({ ok: true });

  const { password } = (await req.json().catch(() => ({}))) as { password?: string };
  if (!password || password !== expected) {
    return NextResponse.json({ ok: false, message: 'Falsches Passwort' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set('birdie_gate', await sha256Hex(expected), {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
