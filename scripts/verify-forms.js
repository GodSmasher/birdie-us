#!/usr/bin/env node
// Automated form verification: generates PDFs for all NTS/IBN projects,
// extracts filled field values, and reports mismatches.
//
// Usage: node scripts/verify-forms.js [offerId] [form]
//   Without args: tests all projects × their NB-specific forms
//   With args: tests one specific project + form

const { PDFDocument } = require('pdf-lib');
const crypto = require('crypto');

const BASE = 'https://birdie-demo.vercel.app';
const PASS = 'sk_live_26052026';
const HASH = crypto.createHash('sha256').update(PASS).digest('hex');
const COOKIE = `birdie_gate=${HASH}`;

async function fetchPdf(offerId, form) {
  const url = `${BASE}/api/netzanmeldung/document?offerId=${offerId}&form=${form}`;
  const res = await fetch(url, { headers: { Cookie: COOKIE } });
  if (!res.ok) return null;
  return Buffer.from(await res.arrayBuffer());
}

async function extractFields(pdfBytes) {
  const doc = await PDFDocument.load(pdfBytes);
  const form = doc.getForm();
  const result = {};
  for (const field of form.getFields()) {
    const name = field.getName();
    if (field.constructor.name === 'PDFTextField') {
      result[name] = { type: 'text', value: field.getText() || '' };
    } else if (field.constructor.name === 'PDFCheckBox') {
      result[name] = { type: 'check', value: field.isChecked() };
    }
  }
  return result;
}

async function testForm(offerId, form, customerName) {
  const pdf = await fetchPdf(offerId, form);
  if (!pdf) {
    console.log(`  ❌ ${form}: HTTP error (could not generate)`);
    return;
  }

  const fields = await extractFields(pdf);
  const filled = Object.entries(fields).filter(([, f]) => f.type === 'text' ? f.value : f.value === true);
  const empty = Object.entries(fields).filter(([, f]) => f.type === 'text' ? !f.value : f.value === false);

  console.log(`  ${form}: ${filled.length} filled, ${empty.length} empty`);

  // Check critical fields
  const checks = [];
  // Name should appear somewhere
  const hasName = filled.some(([, f]) => f.type === 'text' && f.value.includes(customerName.split(' ')[0]));
  checks.push(hasName ? '✅ Name found' : '⚠️  Name NOT found');

  // Volta should appear
  const hasVolta = filled.some(([, f]) => f.type === 'text' && f.value.includes('Volta'));
  checks.push(hasVolta ? '✅ Volta found' : '⚠️  Volta NOT found');

  // kWp/kW should be a number
  const hasNumber = filled.some(([, f]) => f.type === 'text' && /^\d/.test(f.value));
  checks.push(hasNumber ? '✅ Numbers found' : '⚠️  No numbers');

  // No field should contain a PDF field name (mapping error!)
  const hasMappingError = filled.some(([name, f]) => f.type === 'text' && f.value === name);
  checks.push(hasMappingError ? '❌ MAPPING ERROR (field contains its own name!)' : '✅ No mapping errors');

  console.log('    ' + checks.join(' | '));

  // Show filled text fields
  for (const [name, f] of filled.filter(([, f]) => f.type === 'text').slice(0, 8)) {
    console.log(`    ${name.padEnd(30)} = ${f.value.slice(0, 50)}`);
  }
}

// NB → forms mapping
const NB_FORMS = {
  'TEN': ['an005', 'ans', 'an002'],
  'Sachsen Netze': ['sn-eza', 'sn-speicher', 'sn-svr', 'sn-ibn'],
  'Sachsennetze': ['sn-eza', 'sn-speicher', 'sn-svr', 'sn-ibn'],
  'Bayernwerk': ['bw-e8', 'bw-uesb'],
  'Netze Magdeburg': ['nm-db', 'nm-e2', 'nm-e3', 'nm-e8', 'nm-inbe'],
  'Werra Energie': ['we-e2', 'we-e3', 'we-e8'],
  'default': ['e2', 'e3'],
};

async function main() {
  const [, , specificId, specificForm] = process.argv;

  if (specificId && specificForm) {
    console.log(`Testing ${specificId} form=${specificForm}`);
    await testForm(specificId, specificForm, 'Unknown');
    return;
  }

  // Fetch all registrations
  const syncRes = await fetch(`${BASE}/api/sync?key=${PASS}&resource=registrations`);
  const sync = await syncRes.json();
  console.log(`Registrations: ${sync.synced?.registration?.ntsOffers ?? 0}`);

  // Test a few known projects
  const projects = [
    { id: '806bef54-259d-42b7-965f-e1a78db8fc37', name: 'Richard Müller', nb: 'Sachsen Netze' },
    { id: '651f5b25-d5d1-4b33-bfc0-51cf9404bdbc', name: 'Stefan Reuth', nb: 'Bayernwerk' },
    { id: 'af6f5e89-3b60-4001-b2d9-88658f410a91', name: 'Klaus-Dieter Nickel', nb: 'TEN' },
    { id: '2e669a0a-350e-46ed-abf1-46fa1a1c5361', name: 'Lothar Schreitmüller', nb: 'default' },
  ];

  for (const p of projects) {
    console.log(`\n=== ${p.name} (${p.nb}) ===`);
    const forms = NB_FORMS[p.nb] ?? NB_FORMS['default'];
    for (const form of forms) {
      await testForm(p.id, form, p.name);
    }
  }
}

main().catch(console.error);
