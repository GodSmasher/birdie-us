// POST /api/dunning/send
// All-in-one endpoint for n8n: renders birdie template + sends via Brevo SMTP.
// n8n only needs to call THIS instead of Brevo directly.
//
// Body: {
//   stufe: number,                         // 0-5
//   to: { email: string, name: string },   // recipient
//   vars: { companyName, invoiceNumber, invoiceDate, dueDate, amount },
//   attachment?: { content: string, name: string }  // base64 PDF
// }
//
// Returns: { ok: true, messageId, stufe, subject }

import { NextResponse, type NextRequest } from 'next/server';
import { getDunningTemplate, renderTemplate } from '@/app/lib/dunning-server';

export const dynamic = 'force-dynamic';

// n8n param names → birdie placeholder keys
function mapVars(params: Record<string, string>): Record<string, string> {
  const v: Record<string, string> = {};
  if (params.companyName)   v.kunde_name = params.companyName;
  if (params.invoiceNumber) v.rechnungsnummer = params.invoiceNumber;
  if (params.invoiceDate)   v.rechnungsdatum = params.invoiceDate;
  if (params.dueDate)       v.faelligkeitsdatum = params.dueDate;
  if (params.amount)        v.betrag = params.amount;
  // Also accept birdie-native keys
  for (const [k, val] of Object.entries(params)) {
    if (!v[k]) v[k] = val;
  }
  return v;
}

export async function POST(req: NextRequest) {
  const brevoKey = process.env.BREVO_API_KEY;
  if (!brevoKey) {
    return NextResponse.json({ error: 'BREVO_API_KEY not configured' }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { stufe, to, vars: rawVars, attachment } = body;

    // ── Validate ─────────────────────────────────────────────────────
    if (typeof stufe !== 'number' || stufe < 0 || stufe > 5) {
      return NextResponse.json({ error: 'stufe must be 0-5' }, { status: 400 });
    }
    if (!to?.email) {
      return NextResponse.json({ error: 'to.email required' }, { status: 400 });
    }

    // ── Get + render template ────────────────────────────────────────
    const template = await getDunningTemplate(stufe);
    if (!template) {
      return NextResponse.json({ error: 'template not found' }, { status: 404 });
    }
    if (!template.aktiv) {
      return NextResponse.json({ error: 'template disabled', stufe }, { status: 410 });
    }

    const vars = mapVars(rawVars ?? {});

    // Auto-fill fee fields from template
    if (template.gebuehr > 0) {
      if (!vars.gebuehr) vars.gebuehr = `${template.gebuehr.toFixed(2)} €`;
      if (!vars.betrag_mit_gebuehr && vars.betrag) {
        const base = parseFloat(vars.betrag.replace(/[^\d.,]/g, '').replace(',', '.'));
        if (!isNaN(base)) {
          vars.betrag_mit_gebuehr = (base + template.gebuehr).toFixed(2);
        }
      }
    }
    vars.firma_name = vars.firma_name || 'Volta Energietechnik GmbH';

    const rendered = renderTemplate(template, vars);

    // ── Send via Brevo SMTP API ──────────────────────────────────────
    const brevoBody: Record<string, unknown> = {
      sender: { name: 'Volta Solaranlagen', email: 'noreply@volta-solaranlagen.de' },
      to: [{ email: to.email, name: to.name || to.email }],
      subject: rendered.subject,
      htmlContent: rendered.html,
      textContent: rendered.plain,
    };

    // Attach PDF if provided
    if (attachment?.content) {
      brevoBody.attachment = [{
        content: attachment.content,
        name: attachment.name || `Rechnung_${rawVars?.invoiceNumber || 'unknown'}.pdf`,
      }];
    }

    const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': brevoKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(brevoBody),
    });

    if (!brevoRes.ok) {
      const errText = await brevoRes.text();
      console.error('[dunning/send] Brevo error:', brevoRes.status, errText);
      return NextResponse.json(
        { error: 'brevo_send_failed', status: brevoRes.status, detail: errText },
        { status: 502 },
      );
    }

    const brevoResult = await brevoRes.json();

    return NextResponse.json({
      ok: true,
      messageId: brevoResult.messageId,
      stufe: template.stufe,
      subject: rendered.subject,
      to: to.email,
    });
  } catch (err) {
    console.error('[dunning/send] Error:', err);
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }
}
