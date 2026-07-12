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

  const authClient = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await authClient.auth.signInWithPassword({ email, password });

  if (error || !data.session) {
    return NextResponse.json({ ok: false, message: 'Invalid credentials' }, { status: 401 });
  }

  // Fresh admin client for DB queries (signInWithPassword taints the auth context)
  const db = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: profile } = await db
    .from('profiles')
    .select('tenant_id, name, role')
    .eq('id', data.user.id)
    .single();

  let tenant: { slug?: string; name?: string } | null = null;
  if (profile?.tenant_id) {
    const { data: t } = await db
      .from('tenants')
      .select('slug, name')
      .eq('id', profile.tenant_id)
      .single();
    tenant = t;
  }

  const isDemo = tenant?.slug === 'demo';

  const res = NextResponse.json({
    ok: true,
    user: { email: data.user.email, name: profile?.name },
    tenant,
    redirect: isDemo ? '/demo/dashboard' : '/dashboard',
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
  if (isDemo) {
    res.cookies.set('birdie_demo', '1', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 86400,
    });
  }
  return res;
}
