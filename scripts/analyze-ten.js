const { PDFDocument } = require('pdf-lib');
const fs = require('fs');

async function dump(file, label) {
  const pdf = await PDFDocument.load(fs.readFileSync(file));
  const form = pdf.getForm();
  const fields = form.getFields();
  console.log('\n========== ' + label + ' (' + fields.length + ' Felder) ==========');
  for (const f of fields) {
    const type = f.constructor.name.replace('PDF', '');
    const name = f.getName();
    let extra = '';
    if (type === 'Dropdown') {
      try { extra = ' opts=[' + f.getOptions().join(', ') + ']'; } catch {}
    }
    console.log('  ' + type.padEnd(12) + ' | ' + name + extra);
  }
}

(async () => {
  await dump('nb-templates/TEN/ANA/AN005_Antragstellung_Erzeugung_und_Speicher_einschl_30kW.pdf', 'TEN ANA: Antragstellung EZA+Speicher <=30kW');
  await dump('nb-templates/TEN/FM/AN002_Inbetriebsetzungsprotokoll_bis_30kW.pdf', 'TEN FM: Inbetriebsetzungsprotokoll <=30kW');
})();
