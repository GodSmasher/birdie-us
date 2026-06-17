import { NextResponse } from 'next/server';

export async function POST() {
  const res = NextResponse.json({ ok: true });

  res.cookies.set('birdie_demo', '1', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 86400, // 24 hours
  });

  return res;
}
