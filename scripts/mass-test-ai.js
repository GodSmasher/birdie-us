#!/usr/bin/env node
// Mass test: AI form filler for 15 projects.
// Tests the first ANA template per NB, checks key fields.

const { PDFDocument } = require('pdf-lib');
const crypto = require('crypto');

const BASE = 'https://birdie-demo.vercel.app';
const HASH = crypto.createHash('sha256').update('sk_live_26052026').digest('hex');
const COOKIE = `birdie_gate=${HASH}`;

const PROJECTS = [
  { id: 'af6f5e89-3b60-4001-b2d9-88658f410a91', name: 'Klaus-Dieter Nickel', nb: 'TEN' },
  { id: '806bef54-259d-42b7-965f-e1a78db8fc37', name: 'Richard Mueller', nb: 'Sachsen Netze' },
  { id: '651f5b25-d5d1-4b33-bfc0-51cf9404bdbc', name: 'Stefan Reuth', nb: 'Bayernwerk' },
  { id: '2e669a0a-350e-46ed-abf1-46fa1a1c5361', name: 'Lothar Schreitmueller', nb: 'SW Merseburg' },
  { id: '47c1415f-56e5-5de3-b2ea-3f8a3d8c349b', name: 'Thomas Laerz', nb: 'auto' },
  { id: '1428badf-c1fb-496b-b3a3-08c8021cc161', name: 'Degen Manfred', nb: 'auto' },
  { id: '4230e3e1-9e8f-58d2-ae6d-07d416873185', name: 'Wollny Olaf', nb: 'auto' },
  { id: '15734885-8c45-5381-95ec-4d69757cbada', name: 'Koerner Gerd', nb: 'auto' },
  { id: '1c3434cf-fe08-554b-b1b8-ebea3a8896a9', name: 'Hans Joachim Mosch', nb: 'auto' },
  { id: 'f95e42e4-5663-4fdf-8298-5ad15e1738ec', name: 'Peter Doehnert', nb: 'auto' },
  { id: '93018e32-efc0-4325-ac19-1a00a39f0a6c', name: 'Peter Gebhardt', nb: 'auto' },
  { id: 'afc4de3b-35a6-41a7-9ef8-e3d0bed11d27', name: 'Nick Dittrich', nb: 'auto' },
  { id: '56b7e249-58d1-4981-a75d-48ffca68a2bd', name: 'Uwe Schmidt', nb: 'auto' },
  { id: '592d4120-a89f-4439-81c1-eb88f18bb49d', name: 'Artur Biermann', nb: 'auto' },
  { id: '9375b9e5-c750-4d10-855d-4a460c065ae3', name: 'Patrick Thiel', nb: 'auto' },
];

async function findNb(id) {
  // Scrape NB from project detail page
  const r = await fetch(`${BASE}/netzanmeldung/${id}`, { headers: { Cookie: COOKIE } });
  if (!r.ok) return null;
  const html = await r.text();
  // Look for selected option in NB dropdown
  const m = html.match(/id="nb-select"[\s\S]*?<option[^>]*selected[^>]*>([^<]+)/);
  if (m) return m[1].trim();
  // Fallback: look for any NB mention
  const m2 = html.match(/(?:TEN|Sachsen Netze|Bayernwerk|MITNETZ|Netze Magdeburg|Werra Energie|SW \w+|SWW \w+)/i);
  return m2?.[0] || null;
}

async function getTemplates(nb) {
  const r = await fetch(`${BASE}/api/netzanmeldung/templates?nb=${encodeURIComponent(nb)}`, { headers: { Cookie: COOKIE } });
  const d = await r.json();
  return (d.templates || []).filter(t => t.phase !== 'WP'); // Exclude WP
}

async function testDoc(id, form) {
  const url = `${BASE}/api/netzanmeldung/document?offerId=${id}&form=${encodeURIComponent(form)}`;
  const start = Date.now();
  const r = await fetch(url, { headers: { Cookie: COOKIE } });
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  if (!r.ok) return { ok: false, status: r.status, elapsed };

  const buf = Buffer.from(await r.arrayBuffer());
  try {
    const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
    const fm = doc.getForm();
    const filled = [];
    let hasName = false, hasVolta = false, hasEcoflow = false, hasPlz = false;
    for (const f of fm.getFields()) {
      if (f.constructor.name === 'PDFTextField') {
        const v = f.getText() || '';
        if (v) {
          filled.push({ name: f.getName(), val: v });
          if (/\d{5}/.test(v)) hasPlz = true;
          if (v.includes('Volta')) hasVolta = true;
          if (v.includes('EcoFlow') || v.includes('ecoflow')) hasEcoflow = true;
        }
      } else if (f.constructor.name === 'PDFCheckBox' && f.isChecked()) {
        filled.push({ name: f.getName(), val: '[X]' });
      }
    }
    // Check for customer name (first word)
    const firstNames = filled.filter(f => typeof f.val === 'string' && f.val.length > 3 && !f.val.includes('Volta') && !f.val.includes('Schenkberg'));
    hasName = firstNames.length > 0;

    return { ok: true, filled: filled.length, total: fm.getFields().length, hasName, hasVolta, hasEcoflow, hasPlz, elapsed };
  } catch (e) {
    return { ok: false, error: e.message?.slice(0, 40), elapsed };
  }
}

async function main() {
  console.log('='.repeat(110));
  console.log('MASSENTEST AI-FILLER: 15 Projekte');
  console.log('='.repeat(110));
  console.log('Projekt'.padEnd(25) + 'NB'.padEnd(22) + 'Template'.padEnd(30) + 'Felder     Checks');
  console.log('-'.repeat(110));

  let ok = 0, warn = 0, err = 0;

  for (const p of PROJECTS) {
    // Find NB if not known
    let nb = p.nb;
    if (nb === 'auto') {
      nb = await findNb(p.id) || 'unbekannt';
    }

    // Get first ANA template for this NB
    const templates = await getTemplates(nb);
    const anaTemplate = templates.find(t => t.phase === 'ANA');

    if (!anaTemplate) {
      console.log(p.name.padEnd(25) + nb.padEnd(22) + '(keine ANA-Templates)'.padEnd(30) + 'SKIP');
      continue;
    }

    const form = `ai:${anaTemplate.path}`;
    const result = await testDoc(p.id, form);

    if (!result.ok) {
      console.log(p.name.padEnd(25) + nb.padEnd(22) + anaTemplate.label.slice(0, 28).padEnd(30) + `ERR:${result.status || result.error}  (${result.elapsed}s)`);
      err++;
      continue;
    }

    const checks = [];
    if (result.hasName) checks.push('Name');
    if (result.hasVolta) checks.push('Volta');
    if (result.hasEcoflow) checks.push('EcoFlow');
    if (result.hasPlz) checks.push('PLZ');
    if (!result.hasName && !result.hasVolta) checks.push('LEER');

    const status = (result.hasName && (result.hasVolta || result.hasEcoflow)) ? 'OK' : (result.hasName || result.hasVolta) ? 'TEIL' : 'WARN';
    if (status === 'OK') ok++;
    else warn++;

    console.log(
      p.name.padEnd(25) +
      nb.padEnd(22) +
      anaTemplate.label.slice(0, 28).padEnd(30) +
      `${result.filled}/${result.total}`.padEnd(11) +
      checks.join(',').padEnd(20) +
      `${status}  (${result.elapsed}s)`
    );
  }

  console.log('\n' + '='.repeat(110));
  console.log(`ERGEBNIS: ${ok} OK | ${warn} WARN | ${err} ERR von ${PROJECTS.length} Projekten`);
  console.log('='.repeat(110));
}

main().catch(console.error);
