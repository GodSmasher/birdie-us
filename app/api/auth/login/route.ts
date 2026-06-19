import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return NextResponse.json({ ok: false, message: 'Auth not configured' }, { status: 500 });
  }

  const { email, password } = (await req.json().catch(() => ({}))) as {
    email?: string;
    password?: string;
  };
  if (!email || !password) {
    return NextResponse.json({ ok: false, message: 'Email and password required' }, { status: 400 });
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.session) {
    return NextResponse.json({ ok: false, message: 'Invalid credentials' }, { status: 401 });
  }

  // Look up tenant from profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, name, role, tenants(slug, name)')
    .eq('id', data.user.id)
    .single();

  const res = NextResponse.json({
    ok: true,
    user: { email: data.user.email, name: profile?.name },
    tenant: profile?.tenants ?? null,
  });
  res.cookies.set('birdie_session', data.session.access_token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  if (profile?.tenant_id) {
    res.cookies.set('birdie_tenant', profile.tenant_id, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
  }
  return res;
}
