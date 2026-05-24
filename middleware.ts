import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Lightweight access gate. Active only when BIRDIE_ACCESS_PASSWORD is set
// (i.e. on the production deploy that carries real Reonic data). Without the
// env var the app stays open as the public mock demo.

const PUBLIC_PREFIXES = ['/gate', '/api/gate', '/api/sync'];

async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function middleware(req: NextRequest) {
  const password = process.env.BIRDIE_ACCESS_PASSWORD;
  if (!password) return NextResponse.next();

  const { pathname } = req.nextUrl;
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) return NextResponse.next();

  const cookie = req.cookies.get('birdie_gate')?.value;
  const expected = await sha256Hex(password);
  if (cookie === expected) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = '/gate';
  url.searchParams.set('next', pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
