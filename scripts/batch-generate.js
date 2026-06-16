#!/usr/bin/env node
// Batch: Generate AI documents for all projects and set status to "Bitte prüfen".
// This triggers enrichment + AI form filling + records the draft.

const crypto = require('crypto');
const BASE = 'https://birdie-demo.vercel.app';
const HASH = crypto.createHash('sha256').update('sk_live_26052026').digest('hex');
const COOKIE = `birdie_gate=${HASH}`;

const PROJECTS = [
  { id: 'af6f5e89-3b60-4001-b2d9-88658f410a91', name: 'Klaus-Dieter Nickel', nb: 'TEN' },
  { id: '806bef54-259d-42b7-965f-e1a78db8fc37', name: 'Richard Müller', nb: 'Sachsen Netze' },
  { id: '651f5b25-d5d1-4b33-bfc0-51cf9404bdbc', name: 'Stefan Reuth', nb: 'Bayernwerk' },
  { id: '2e669a0a-350e-46ed-abf1-46fa1a1c5361', name: 'Lothar Schreitmüller', nb: 'SW Merseburg' },
  { id: '47c1415f-56e5-5de3-b2ea-3f8a3d8c349b', name: 'Thomas Lärz', nb: 'TEN' },
  { id: '1428badf-c1fb-496b-b3a3-08c8021cc161', name: 'Degen Manfred', nb: 'TEN' },
  { id: '4230e3e1-9e8f-58d2-ae6d-07d416873185', name: 'Wollny Olaf', nb: 'TEN' },
  { id: '15734885-8c45-5381-95ec-4d69757cbada', name: 'Körner Gerd', nb: 'TEN' },
  { id: '1c3434cf-fe08-554b-b1b8-ebea3a8896a9', name: 'Hans Joachim Mosch', nb: 'TEN' },
  { id: 'f95e42e4-5663-4fdf-8298-5ad15e1738ec', name: 'Peter Döhnert', nb: 'TEN' },
  { id: 'afc4de3b-35a6-41a7-9ef8-e3d0bed11d27', name: 'Nick Dittrich', nb: 'TEN' },
  { id: '56b7e249-58d1-4981-a75d-48ffca68a2bd', name: 'Uwe Schmidt', nb: 'TEN' },
  { id: '592d4120-a89f-4439-81c1-eb88f18bb49d', name: 'Artur Biermann', nb: 'TEN' },
  { id: '9375b9e5-c750-4d10-855d-4a460c065ae3', name: 'Patrick Thiel', nb: 'TEN' },
];

async function getTemplates(nb) {
  const r = await fetch(`${BASE}/api/netzanmeldung/templates?nb=${encodeURIComponent(nb)}`, { headers: { Cookie: COOKIE } });
  const d = await r.json();
  // Only ANA + FM, no WP
  return (d.templates || []).filter(t => t.phase === 'ANA' || t.phase === 'FM');
}

async function generateAndRecord(offerId, form) {
  // 1. Generate the PDF (triggers enrichment + AI fill)
  const url = `${BASE}/api/netzanmeldung/document?offerId=${offerId}&form=${encodeURIComponent(form)}`;
  const r = await fetch(url, { headers: { Cookie: COOKIE } });
  if (!r.ok) return { ok: false, status: r.status };
  const size = (await r.arrayBuffer()).byteLength;

  // 2. Record draft → sets docStatus to "pruefen" (Bitte prüfen)
  const rec = await fetch(`${BASE}/api/netzanmeldung`, {
    method: 'POST',
    headers: { Cookie: COOKIE, 'Content-Type': 'application/json' },
    body: JSON.stringify({ offerId, recordDraft: form }),
  });

  return { ok: true, size };
}

async function main() {
  console.log('='.repeat(90));
  console.log('BATCH: Dokumente generieren + Status "Bitte prüfen" setzen');
  console.log('='.repeat(90));

  let total = 0, success = 0, errors = 0;

  for (const p of PROJECTS) {
    console.log(`\n── ${p.name} (${p.nb}) ──`);

    const templates = await getTemplates(p.nb);
    if (!templates.length) {
      console.log('  ⏭️  Keine Templates für ' + p.nb);
      continue;
    }

    // Generate ANA templates
    const anaTemplates = templates.filter(t => t.phase === 'ANA');
    const fmTemplates = templates.filter(t => t.phase === 'FM');

    for (const t of anaTemplates) {
      total++;
      const form = `ai:${t.path}`;
      process.stdout.write(`  📄 ANA: ${t.label.slice(0, 45).padEnd(47)} `);
      const start = Date.now();
      try {
        const result = await generateAndRecord(p.id, form);
        const elapsed = ((Date.now() - start) / 1000).toFixed(1);
        if (result.ok) {
          console.log(`✅ ${(result.size / 1024).toFixed(0)}KB (${elapsed}s)`);
          success++;
        } else {
          console.log(`❌ HTTP ${result.status} (${elapsed}s)`);
          errors++;
        }
      } catch (e) {
        console.log(`❌ ${e.message?.slice(0, 40)}`);
        errors++;
      }
    }

    // Also generate FM templates (Inbetriebnahme)
    for (const t of fmTemplates) {
      total++;
      const form = `ai:${t.path}`;
      process.stdout.write(`  📄 FM:  ${t.label.slice(0, 45).padEnd(47)} `);
      const start = Date.now();
      try {
        const result = await generateAndRecord(p.id, form);
        const elapsed = ((Date.now() - start) / 1000).toFixed(1);
        if (result.ok) {
          console.log(`✅ ${(result.size / 1024).toFixed(0)}KB (${elapsed}s)`);
          success++;
        } else {
          console.log(`❌ HTTP ${result.status} (${elapsed}s)`);
          errors++;
        }
      } catch (e) {
        console.log(`❌ ${e.message?.slice(0, 40)}`);
        errors++;
      }
    }
  }

  console.log('\n' + '='.repeat(90));
  console.log(`FERTIG: ${success}/${total} Dokumente generiert | ${errors} Fehler`);
  console.log('Alle Projekte stehen jetzt auf "Bitte prüfen" im Kanban.');
  console.log('='.repeat(90));
}

main().catch(console.error);
