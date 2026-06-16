#!/usr/bin/env node
// Scan all registrations: check files + data completeness.
// Uses the document API to trigger enrichment and check actual ProjectData.

const crypto = require('crypto');
const BASE = 'https://birdie-demo.vercel.app';
const HASH = crypto.createHash('sha256').update('sk_live_26052026').digest('hex');
const COOKIE = `birdie_gate=${HASH}`;

async function main() {
  // Sync first
  await fetch(`${BASE}/api/sync?key=sk_live_26052026`);

  // Get all offer IDs from the kanban page
  const r = await fetch(`${BASE}/netzanmeldung`, { headers: { Cookie: COOKIE } });
  const html = await r.text();
  const allIds = [...new Set([...html.matchAll(/netzanmeldung\/([a-f0-9-]{36})/g)].map(m => m[1]))];
  console.log(`${allIds.length} Projekte gefunden\n`);

  const results = [];

  for (const id of allIds) {
    // Get files
    const fr = await fetch(`${BASE}/api/netzanmeldung/files?offerId=${id}`, { headers: { Cookie: COOKIE } });
    const fd = await fr.json();
    const fileCount = fd.files?.length || 0;

    // Get project data via E2 generation (triggers enrichment, shows actual data in fields)
    // Actually just check the API fields endpoint which returns project data
    const dr = await fetch(`${BASE}/api/netzanmeldung/document?offerId=${id}&form=e2`, { headers: { Cookie: COOKIE } });

    // Parse the detail page for structured data
    const pg = await fetch(`${BASE}/netzanmeldung/${id}`, { headers: { Cookie: COOKIE } });
    const pgHtml = await pg.text();

    // Extract customer name from the h1 tag
    const h1Match = pgHtml.match(/<h1[^>]*>[^<]*<\/span>\s*([^<]+)/s) || pgHtml.match(/tracking-tightest[^>]*>\s*([^<]{2,})/);
    const name = (h1Match?.[1] || '?').trim();

    // Check completeness pill
    const isReady = pgHtml.includes('DATEN VOLLSTÄNDIG');
    const missingMatch = pgHtml.match(/(\d+)\s*FEHLT/);
    const missingCount = missingMatch ? parseInt(missingMatch[1]) : (isReady ? 0 : -1);

    // Extract kWp value
    const kwpMatch = pgHtml.match(/Anlagengröße[\s\S]*?(\d+[.,]\d+)\s*kWp/i) || pgHtml.match(/(\d+[.,]\d+)\s*kWp/);
    const kwp = kwpMatch?.[1] || '—';

    // Check for WR
    const wrMatch = pgHtml.match(/Wechselrichter[\s\S]{0,200}/);
    const wrText = wrMatch?.[0]?.replace(/<[^>]+>/g, ' ').trim() || '';
    const hasWR = /EcoFlow|Solplanet|Sungrow|Fronius|SMA|Kostal|Huawei|Growatt|PowerOcean/i.test(wrText);

    // Check for address (5-digit PLZ)
    const hasAddr = /\d{5}\s+[A-ZÄÖÜa-zäöü]/.test(pgHtml);

    // Check for NB
    const nbMatch = pgHtml.match(/<option[^>]*selected[^>]*>([^<]{3,})/);
    const nb = nbMatch?.[1]?.trim() || '—';

    // Check for "no files" warning
    const noFiles = pgHtml.includes('Keine Dateien in Reonic');

    const complete = isReady && fileCount >= 3 && nb !== '—';

    results.push({ id, name, fileCount, kwp, hasWR, hasAddr, nb, isReady, missingCount, complete });

    const status = complete ? '✅' : '⬜';
    console.log(
      `${status} ${name.slice(0, 25).padEnd(27)} ${String(fileCount).padEnd(4)} Dateien  ${kwp.padEnd(7)} kWp  ${hasWR ? 'WR✅' : 'WR❌'}  ${hasAddr ? 'Adr✅' : 'Adr❌'}  ${nb.slice(0, 18).padEnd(20)} ${missingCount === 0 ? 'KOMPLETT' : missingCount > 0 ? missingCount + ' fehlt' : '?'}`
    );
  }

  // Summary
  const good = results.filter(r => r.complete);
  const partial = results.filter(r => !r.complete && r.fileCount >= 3);
  const empty = results.filter(r => r.fileCount < 3);

  console.log(`\n${'='.repeat(100)}`);
  console.log(`KOMPLETT: ${good.length} | TEILWEISE: ${partial.length} | WENIG DATEIEN: ${empty.length}`);
  console.log(`${'='.repeat(100)}`);

  if (good.length > 0) {
    console.log('\n✅ BEREIT FÜR DOKUMENTE:');
    for (const g of good) {
      console.log(`  ${g.name.padEnd(27)} ${g.nb.padEnd(20)} ${g.kwp} kWp  ${g.fileCount} Dateien  ${g.id}`);
    }
  }

  if (partial.length > 0) {
    console.log('\n⬜ DATEIEN DA, ABER DATEN FEHLEN:');
    for (const p of partial) {
      console.log(`  ${p.name.padEnd(27)} ${p.nb.padEnd(20)} ${p.missingCount} fehlt  ${p.fileCount} Dateien  ${p.id}`);
    }
  }

  // Output JSON for the batch script
  const fs = require('fs');
  fs.writeFileSync('scripts/complete-projects.json', JSON.stringify(good, null, 2));
  console.log(`\n→ ${good.length} komplette Projekte gespeichert in scripts/complete-projects.json`);
}

main().catch(console.error);
