#!/usr/bin/env node
// Massentest: AI-Filler fuer alle Projekte x ihre NB-Templates.
// Generiert jedes PDF, extrahiert die gefuellten Felder, prueft Basisregeln.
//
// Usage: node scripts/test-ai-filler.js [--nb "Sachsen Netze"] [--limit 3]

const { PDFDocument } = require('pdf-lib');
const crypto = require('crypto');

const BASE = 'https://birdie-demo.vercel.app';
const PASS = 'sk_live_26052026';
const HASH = crypto.createHash('sha256').update(PASS).digest('hex');
const COOKIE = `birdie_gate=${HASH}`;
const BOT_TOKEN = 'netzbot_GYnfexzcWHJQPuIpO8sR4U1ECw9BjymD';

// Known test projects with their NB (from verify-forms.js + Reonic data)
const PROJECTS = [
  { id: '806bef54-259d-42b7-965f-e1a78db8fc37', name: 'Richard Mueller', nb: 'Sachsen Netze' },
  { id: '651f5b25-d5d1-4b33-bfc0-51cf9404bdbc', name: 'Stefan Reuth', nb: 'Bayernwerk' },
  { id: 'af6f5e89-3b60-4001-b2d9-88658f410a91', name: 'Klaus-Dieter Nickel', nb: 'TEN' },
  { id: '2e669a0a-350e-46ed-abf1-46fa1a1c5361', name: 'Lothar Schreitmueller', nb: 'SW Merseburg' },
];

async function fetchJson(url, headers = {}) {
  const r = await fetch(url, { headers: { Cookie: COOKIE, ...headers } });
  if (!r.ok) return null;
  return r.json();
}

async function fetchPdf(offerId, form) {
  const url = `${BASE}/api/netzanmeldung/document?offerId=${offerId}&form=${encodeURIComponent(form)}`;
  const res = await fetch(url, { headers: { Cookie: COOKIE } });
  if (!res.ok) return { error: res.status };
  const buf = Buffer.from(await res.arrayBuffer());
  return { buf, size: buf.length };
}

async function extractFields(pdfBuf) {
  const doc = await PDFDocument.load(pdfBuf);
  const form = doc.getForm();
  const filled = [], empty = [];
  for (const f of form.getFields()) {
    const name = f.getName();
    const type = f.constructor.name;
    if (type === 'PDFTextField') {
      const val = f.getText() || '';
      if (val) filled.push({ name, val, type: 'text' });
      else empty.push(name);
    } else if (type === 'PDFCheckBox') {
      if (f.isChecked()) filled.push({ name, val: true, type: 'check' });
      else empty.push(name);
    }
  }
  return { filled, empty, total: filled.length + empty.length };
}

function checkQuality(filled, customerName) {
  const checks = [];
  const firstName = customerName.split(' ')[0];

  // 1. Customer name found
  const hasName = filled.some(f => f.type === 'text' && f.val.includes(firstName));
  checks.push(hasName ? 'Name OK' : 'NAME FEHLT');

  // 2. Volta found
  const hasVolta = filled.some(f => f.type === 'text' && f.val.includes('Volta'));
  checks.push(hasVolta ? 'Volta OK' : 'VOLTA FEHLT');

  // 3. Numbers found (kWp, kW etc.)
  const hasNumber = filled.some(f => f.type === 'text' && /\d/.test(f.val));
  checks.push(hasNumber ? 'Zahlen OK' : 'ZAHLEN FEHLEN');

  // 4. No mapping errors (field contains its own name)
  const mappingErr = filled.filter(f => f.type === 'text' && f.val === f.name);
  if (mappingErr.length) checks.push('MAPPING-ERR: ' + mappingErr.map(f => f.name).join(','));
  else checks.push('Mapping OK');

  // 5. Address found
  const hasAddress = filled.some(f => f.type === 'text' && /\d{5}/.test(f.val));
  checks.push(hasAddress ? 'PLZ OK' : 'PLZ FEHLT');

  return checks;
}

async function testProject(project) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`${project.name} | NB: ${project.nb} | ${project.id.slice(0, 8)}...`);
  console.log('='.repeat(70));

  // Get AI templates for this NB
  const tmplData = await fetchJson(`${BASE}/api/netzanmeldung/templates?nb=${encodeURIComponent(project.nb)}`);
  const templates = tmplData?.templates || [];
  console.log(`Templates gefunden: ${templates.length} (Ordner: ${tmplData?.folder || '-'})`);

  if (!templates.length) {
    console.log('  SKIP: keine Templates vorhanden');
    return { project: project.name, nb: project.nb, results: [] };
  }

  const results = [];

  for (const tmpl of templates) {
    const form = `ai:${tmpl.path}`;
    const shortLabel = tmpl.label.slice(0, 50);
    process.stdout.write(`  ${tmpl.phase} ${shortLabel.padEnd(52)} `);

    const start = Date.now();
    const pdf = await fetchPdf(project.id, form);
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);

    if (pdf.error) {
      console.log(`ERR ${pdf.error} (${elapsed}s)`);
      results.push({ label: shortLabel, phase: tmpl.phase, status: 'ERROR', error: pdf.error });
      continue;
    }

    try {
      const { filled, empty, total } = await extractFields(pdf.buf);
      const checks = checkQuality(filled, project.name);
      const pass = !checks.some(c => c.includes('FEHLT') || c.includes('ERR'));
      const status = pass ? 'OK' : 'WARN';

      console.log(`${filled.length}/${total} Felder | ${checks.join(' | ')} (${elapsed}s)`);

      // Show sample filled fields
      const textFields = filled.filter(f => f.type === 'text').slice(0, 4);
      for (const f of textFields) {
        console.log(`    ${f.name.padEnd(35)} = ${String(f.val).slice(0, 45)}`);
      }

      results.push({
        label: shortLabel,
        phase: tmpl.phase,
        status,
        filled: filled.length,
        total,
        checks,
        elapsed,
      });
    } catch (e) {
      console.log(`PARSE-ERR: ${e.message} (${elapsed}s)`);
      results.push({ label: shortLabel, phase: tmpl.phase, status: 'PARSE_ERROR', error: e.message });
    }
  }

  return { project: project.name, nb: project.nb, results };
}

async function main() {
  const args = process.argv.slice(2);
  const nbFilter = args.includes('--nb') ? args[args.indexOf('--nb') + 1] : null;
  const limit = args.includes('--limit') ? parseInt(args[args.indexOf('--limit') + 1]) : 999;

  let projects = PROJECTS;
  if (nbFilter) {
    projects = projects.filter(p => p.nb.toLowerCase().includes(nbFilter.toLowerCase()));
  }
  projects = projects.slice(0, limit);

  console.log(`AI-Filler Massentest: ${projects.length} Projekte`);
  console.log(`Basis: ${BASE}`);

  const allResults = [];
  for (const p of projects) {
    const r = await testProject(p);
    allResults.push(r);
  }

  // Summary
  console.log(`\n${'='.repeat(70)}`);
  console.log('ZUSAMMENFASSUNG');
  console.log('='.repeat(70));
  let totalOK = 0, totalWarn = 0, totalErr = 0;
  for (const { project, nb, results } of allResults) {
    const ok = results.filter(r => r.status === 'OK').length;
    const warn = results.filter(r => r.status === 'WARN').length;
    const err = results.filter(r => r.status === 'ERROR' || r.status === 'PARSE_ERROR').length;
    totalOK += ok;
    totalWarn += warn;
    totalErr += err;
    console.log(`${project.padEnd(25)} ${nb.padEnd(20)} ${ok} OK  ${warn} WARN  ${err} ERR  (${results.length} total)`);
  }
  console.log(`\nGesamt: ${totalOK} OK | ${totalWarn} WARN | ${totalErr} ERR`);
}

main().catch(console.error);
