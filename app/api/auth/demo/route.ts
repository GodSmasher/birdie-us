import { NextResponse } from 'next/server';

const DEMO_PASSWORD = process.env.DEMO_PASSWORD || 'renew2026';

export async function POST(req: Request) {
  try {
    const { password } = await req.json();

    if (password !== DEMO_PASSWORD) {
      return NextResponse.json({ ok: false, error: 'Invalid access code' }, { status: 401 });
    }

    const res = NextResponse.json({ ok: true });

    res.cookies.set('birdie_demo', '1', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 86400,
    });

    return res;
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 });
  }
}
