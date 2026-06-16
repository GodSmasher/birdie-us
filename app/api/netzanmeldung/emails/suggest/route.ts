// POST /api/netzanmeldung/emails/suggest
// Generates an AI reply suggestion using project context from Reonic + registration status.
// Body: { emailId, from, subject, body, registrationId? }
// Returns: { suggestion, context }

import { NextResponse } from 'next/server';
import { getProjectData } from '@/app/lib/projektdaten';
import { getRegistrations, STAGES } from '@/app/lib/netzanmeldung';
import { netzbetreiberForPlz } from '@/app/lib/netzbetreiber';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(req: Request) {
  const { from, subject, body, registrationId } = (await req.json()) as {
    from: string;
    subject: string;
    body: string;
    registrationId?: string;
  };

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'No API key' }, { status: 500 });

  // Gather context from all sources
  const contextParts: string[] = [];

  let projectContext = '';
  if (registrationId) {
    const [project, regs] = await Promise.all([
      getProjectData(registrationId),
      getRegistrations(),
    ]);
    const reg = regs.find((r) => r.offerId === registrationId);

    if (project) {
      const nb = netzbetreiberForPlz(project.address?.zip);
      projectContext = [
        `Projekt: ${project.name}`,
        `Kunde: ${project.customerName}`,
        `Adresse: ${project.address?.line}, ${project.address?.zip} ${project.address?.city}`,
        `Anlage: ${project.kwp} kWp, ${project.moduleCount} Module ${project.moduleType ?? ''}`,
        `Wechselrichter: ${project.inverter ?? '—'}`,
        project.battery ? `Speicher: ${project.battery} (${project.batteryKwh} kWh)` : 'Kein Speicher',
        `Netzbetreiber: ${nb?.name ?? reg?.netzbetreiber ?? '—'}`,
      ].join('\n');
      contextParts.push(`📋 REONIC-PROJEKTDATEN:\n${projectContext}`);
    }

    if (reg) {
      const stageLabel = STAGES.find((s) => s.id === reg.status)?.label ?? reg.status;
      contextParts.push(`📊 NETZANMELDUNGS-STATUS:\nAktueller Status: ${stageLabel}\nNetzbetreiber: ${reg.netzbetreiber}\nGestartet: ${new Date(reg.startedAt).toLocaleDateString('de-DE')}\nDok-Status: ${reg.docStatus ?? 'offen'}`);
    }
  }

  const systemPrompt = `Du bist der Netzanmeldungs-Assistent von Volta Energietechnik GmbH (Solarinstallateur in Leipzig).
Du schreibst professionelle, freundliche E-Mail-Antworten auf Deutsch.

Deine Aufgabe: Erstelle einen Antwort-Entwurf für die eingehende E-Mail.

REGELN:
- Kurz und präzise, max. 5-8 Sätze
- Professionell aber freundlich (Du-Form vermeiden, Sie-Form)
- Nutze die Projektdaten um konkrete Infos zu geben (Anlagengröße, Status, etc.)
- Wenn du den Status nicht kennst, schreib dass du nachfragst und dich meldest
- Nenne keine Vermutungen als Fakten
- Unterschreibe mit "Mit freundlichen Grüßen\nVolta Energietechnik GmbH\nNetzanmeldung"
- Kein Betreff nötig, nur den Antwort-Text

${contextParts.length > 0 ? '\nVERFÜGBARER KONTEXT:\n' + contextParts.join('\n\n') : '\nKein Projektkontext verfügbar — halte die Antwort allgemein.'}`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 800,
        system: systemPrompt,
        messages: [{
          role: 'user',
          content: `Eingehende Email:\nVon: ${from}\nBetreff: ${subject}\n\n${body.slice(0, 3000)}`,
        }],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: `API ${res.status}: ${err.slice(0, 200)}` }, { status: 500 });
    }

    const data = (await res.json()) as { content?: { text: string }[] };
    const suggestion = data.content?.[0]?.text ?? '';

    return NextResponse.json({
      suggestion,
      context: contextParts,
      replyTo: from,
      replySubject: subject.startsWith('Re:') ? subject : `Re: ${subject}`,
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
