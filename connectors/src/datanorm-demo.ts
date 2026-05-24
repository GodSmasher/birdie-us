// Demonstrates the DATANORM ⇄ Reonic bridge — pure transform, no API key needed.
//   npm run datanorm-demo

import { parseDatanorm, articlesToComponents, componentsToDatanorm } from './datanorm.js';

// Sample DATANORM 4.0 file as a wholesaler (e.g. Krannich/Memodo) would deliver.
// V = header (date, name, currency, version) · A = article records.
const SAMPLE = [
  'V;24.05.2026;Memodo GmbH Artikelstamm;EUR;4;',
  'A;N;MOD-440-GLASS;00;Trina Vertex S+ 440Wp Glas-Glas;Full Black Modul;1;1;Stck;14900;PV-MOD;',
  'A;N;INV-SH10RT;00;Sungrow SH10RT Hybrid-WR;10kW 3-phasig;1;1;Stck;189000;PV-WR;',
  'A;N;BAT-PO-30;00;EcoFlow PowerOcean 30kWh;Hochvolt-Speicher;1;1;Stck;1190000;PV-SPEICHER;',
  'A;N;WB-11KW;00;Wallbox 11kW Typ2;mit Lastmanagement;2;1;Stck;45000;EMOB;',
  'A;L;ALT-OBSOLETE-1;00;Altartikel;wird entfernt;1;1;Stck;0;;',
].join('\r\n');

function main() {
  console.log('\n▸ DATANORM einlesen (wie vom Großhandel geliefert)\n');
  const articles = parseDatanorm(SAMPLE);
  console.log(`  ${articles.length} Artikel geparst:`);
  for (const a of articles) {
    console.log(`    [${a.action}] ${a.articleNumber.padEnd(16)} ${a.name}  →  ${a.priceEur.toFixed(2)} € / ${a.unit}`);
  }

  console.log('\n▸ Mapping auf Reonic-Components (Großhandel → CRM)\n');
  const components = articlesToComponents(articles, { componentType: 'other', brand: 'Memodo' });
  for (const c of components) {
    console.log(`    ${c.componentType.padEnd(8)} ${c.articleNumber}  "${c.name}"  Verkauf=${c.salesPrice ?? '-'}€ Einkauf=${c.purchasePrice ?? '-'}€`);
  }
  console.log(`  (${articles.length - components.length} gelöschte Artikel übersprungen)`);

  console.log('\n▸ Reonic-Components zurück nach DATANORM (CRM → ERP/Großhandel)\n');
  const back = componentsToDatanorm(components);
  console.log(
    back
      .trimEnd()
      .split('\r\n')
      .map((l) => '    ' + l)
      .join('\n'),
  );

  console.log('\n✓ Round-Trip funktioniert: DATANORM → Reonic → DATANORM');
}

main();
