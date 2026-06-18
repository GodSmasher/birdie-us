import { NextResponse, type NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export async function POST(req: NextRequest) {
  const brevoKey = process.env.BREVO_API_KEY;
  if (!brevoKey) {
    return NextResponse.json({ error: 'not configured' }, { status: 500 });
  }

  const body = await req.json();
  const { firstName, lastName, email, company, experience } = body;

  if (!firstName || !email) {
    return NextResponse.json({ error: 'name and email required' }, { status: 400 });
  }

  const name = `${firstName} ${lastName || ''}`.trim();

  const html = `
    <h2>New Sales Partner Application</h2>
    <table style="border-collapse:collapse;">
      <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Name</td><td>${esc(name)}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Email</td><td>${esc(email)}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Company</td><td>${esc(company || '—')}</td></tr>
    </table>
    ${experience ? `<h3>Solar Experience</h3><p>${esc(experience)}</p>` : ''}
  `;

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': brevoKey,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: 'birdie Careers', email: 'noreply@birdiesolar.com' },
      replyTo: { name, email },
      to: [{ email: 'sarah@birdiesolar.com', name: 'Sarah Vogel' }],
      subject: `Sales Partner Application: ${name}`,
      htmlContent: html,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('[apply] Brevo error:', res.status, err);
    return NextResponse.json({ error: 'send_failed' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
