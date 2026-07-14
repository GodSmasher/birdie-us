import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PREFIXES = [
  '/gate', '/api/gate', '/api/auth',
  '/api/sync', '/api/netzanmeldung/bot', '/api/netzanmeldung/emails',
  '/api/dunning', '/api/emails', '/sign', '/api/sign',
  '/api/crm',
  '/demo',
];

async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname === '/' ||
    pathname === '/login' ||
    pathname.startsWith('/pricing') ||
    pathname.startsWith('/case-studies') ||
    pathname.startsWith('/partner') ||
    pathname.startsWith('/careers') ||
    pathname.startsWith('/impressum') ||
    pathname.startsWith('/datenschutz') ||
    pathname.startsWith('/de') ||
    pathname.startsWith('/use-cases')
  ) {
    return NextResponse.next();
  }
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Check for session cookie (new auth)
  const session = req.cookies.get('birdie_session')?.value;
  if (session) return NextResponse.next();

  // Demo mode cookie
  const demo = req.cookies.get('birdie_demo')?.value;
  if (demo === '1') return NextResponse.next();

  // Legacy gate cookie fallback
  const password = process.env.BIRDIE_ACCESS_PASSWORD;
  if (password) {
    const gate = req.cookies.get('birdie_gate')?.value;
    const expected = await sha256Hex(password);
    if (gate === expected) return NextResponse.next();
  }

  const url = req.nextUrl.clone();
  url.pathname = '/login';
  url.searchParams.set('next', pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
