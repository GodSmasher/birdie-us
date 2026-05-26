// POST /api/dunning/render
// Called by n8n to get a fully rendered dunning email.
// Body: { stufe: number, vars: { kunde_name, rechnungsnummer, ... } }
// Returns: { subject, htmlContent, textContent, sender: { name, email } }
//
// n8n then forwards this directly to Brevo's /v3/smtp/email with htmlContent
// instead of templateId — so birdie controls all templates.

import { NextResponse, type NextRequest } from 'next/server';
import { getDunningTemplate, renderTemplate } from '@/app/lib/dunning-server';

export const dynamic = 'force-dynamic';

// Brevo params → birdie placeholder mapping
// n8n sends Brevo-style param names; we map them to birdie's {{...}} keys.
function mapN8nVars(params: Record<string, string>): Record<string, string> {
  const vars: Record<string, string> = {};
  // Direct mappings from n8n's existing params
  if (params.companyName)    vars.kunde_name = params.companyName;
  if (params.invoiceNumber)  vars.rechnungsnummer = params.invoiceNumber;
  if (params.invoiceDate)    vars.rechnungsdatum = params.invoiceDate;
  if (params.dueDate)        vars.faelligkeitsdatum = params.dueDate;
  if (params.amount)         vars.betrag = params.amount;
  // Also accept birdie-native keys directly (for future n8n updates)
  for (const [k, v] of Object.entries(params)) {
    if (!vars[k]) vars[k] = v;
  }
  return vars;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { stufe, vars: rawVars } = body;

    if (typeof stufe !== 'number' || stufe < 0 || stufe > 5) {
      return NextResponse.json({ error: 'stufe must be 0-5' }, { status: 400 });
    }

    const template = await getDunningTemplate(stufe);
    if (!template) {
      return NextResponse.json({ error: 'template not found' }, { status: 404 });
    }

    if (!template.aktiv) {
      return NextResponse.json({ error: 'template is disabled', stufe }, { status: 410 });
    }

    // Map n8n's Brevo-style params to birdie placeholders
    const vars = mapN8nVars(rawVars ?? {});

    // Auto-fill computed fields from template
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

    return NextResponse.json({
      subject: rendered.subject,
      htmlContent: rendered.html,
      textContent: rendered.plain,
      sender: { name: 'Volta Solaranlagen', email: 'noreply@volta-solaranlagen.de' },
      stufe: template.stufe,
      name: template.name,
      gebuehr: template.gebuehr,
    });
  } catch {
    return NextResponse.json({ error: 'invalid request body' }, { status: 400 });
  }
}
