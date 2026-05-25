/**
 * _eon-group.js — Gemeinsamer Installer-Filler für EON-Gruppe Portale
 *
 * Portale:
 *   Bayernwerk  → bayernwerk-netz.de/de/meinauftragsportal.html
 *   MitNetz     → portal.mitnetz-strom.de/de/meinauftragsportal.html
 *   E.Dis       → e-dis-netz.de/de/meinauftragsportal.html
 *   Avacon      → avacon-netz.de/de/meinauftragsportal.html
 *
 * Technische Basis: SFDC-Installateurportal (meinauftragsportal.html)
 *
 * Ablauf:
 *   1. Zur Auftragsübersicht navigieren, ggf. einloggen
 *   2. "Neuen Auftrag erstellen" → "Energie einspeisen" → Adresse → "Auftrag erstellen"
 *   3. Optional Step 1 "Anlage suchen" (falls neue Instanz nötig)
 *   4. "Messkonzept erstellen": WR-Dialog, PV-Anlage-Dialog, ggf. Speicher-Dialog
 *   5. Weiter → Angaben finalisieren (TODO nach Live-Inspektion)
 *
 * extra-Felder:
 *   extra.ze_id              — ZEREZ-Registernummer des WR (z.B. "ZE-000123456")
 *   extra.wr_leistung_kw     — WR Nennleistung [kW]
 *   extra.wr_scheinleistung  — WR Scheinleistung [kVA]
 *   extra.speicher_hersteller — Speicher-Hersteller
 *   extra.speicher_typ        — Speicher-Typ
 *
 * Stabile Selektoren (via Browser-Inspektion):
 *   WR-Dialog:   #root_identicalInverters, #root_zerezId_text-input,
 *                #root_manufacturer_text-input, #root_inverterType_text-input,
 *                #root_power, #root_apparentPower
 *   PV-Dialog:   #root_totalPowerProduction, #root_location, #root_curtailmentProcedure, #root_feedInType
 *   Speicher:    #root_manufacturer_text-input, #root_storageType_text-input, #root_capacity
 *   Modal-Submit: .Modal button[type="submit"]
 *   Weiter:      button.Button.icon-right.filled
 */

async function loginIfNeeded(page, user, password) {
  const usernameField = await page.waitForSelector(
    '#username, input[id*="username"], input[type="email"]',
    { timeout: 6000 }
  ).catch(() => null);

  if (!usernameField) return;

  await page.fill('#username', user);
  await page.fill('#pwdtxt, input[type="password"]', password);
  await page.click('button[type="submit"], .slds-button[type="submit"], button:has-text("Anmelden")');
  await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 25000 });
}

async function fillModalInput(page, inputId, value) {
  await page.evaluate(([id, val]) => {
    const input = document.getElementById(id);
    if (!input) return;
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    setter.call(input, val);
    input.dispatchEvent(new Event('input',  { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    input.dispatchEvent(new Event('blur',   { bubbles: true }));
  }, [inputId, String(value)]);
  await page.waitForTimeout(200);
}

async function fillAutocomplete(page, inputId, value) {
  if (!value) return;
  const input = page.locator(`#${inputId}`);
  await input.click();
  await input.fill('');
  await input.pressSequentially(value, { delay: 60 });
  await page.waitForTimeout(1500);

  const suggestion = page.locator(
    '.autosuggest__results-item, [class*="suggestion"] li, ' +
    '[class*="autosuggest"] li, [role="listbox"] [role="option"]'
  ).first();
  if (await suggestion.isVisible({ timeout: 2500 }).catch(() => false)) {
    await suggestion.click();
    await page.waitForTimeout(600);
  }
}

async function selectDropdownOption(page, dropdownId, optionTextFragment) {
  await page.evaluate((id) => {
    document.getElementById(id)?.querySelector('.dropdown-component__select')?.click();
  }, dropdownId);
  await page.waitForTimeout(400);

  const clicked = await page.evaluate(([id, frag]) => {
    const dd = document.getElementById(id);
    const options = dd?.querySelectorAll('.dropdown-component__option');
    const target = Array.from(options || []).find(opt =>
      opt.textContent.trim().toLowerCase().includes(frag.toLowerCase())
    );
    if (target) { target.click(); return true; }
    return false;
  }, [dropdownId, optionTextFragment]);
  await page.waitForTimeout(300);
  return clicked;
}

async function submitModal(page) {
  await page.evaluate(() => {
    document.querySelector('.Modal button[type="submit"]')?.click();
  });
  await page.waitForTimeout(2000);
}

async function clickBearbeitenFor(page, keyword) {
  const clicked = await page.evaluate((kw) => {
    const btns = Array.from(document.querySelectorAll('button'))
      .filter(b => b.textContent.trim() === 'Bearbeiten');
    for (const btn of btns) {
      let el = btn;
      for (let i = 0; i < 8; i++) el = el?.parentElement;
      if (el?.textContent?.includes(kw)) {
        btn.click();
        return true;
      }
    }
    return false;
  }, keyword);
  if (clicked) await page.waitForTimeout(900);
  return clicked;
}

async function clickWeiter(page) {
  await page.evaluate(() => {
    Array.from(document.querySelectorAll('button'))
      .find(b => b.textContent.trim() === 'Weiter' && !b.disabled)
      ?.click();
  });
  await page.waitForTimeout(2000);
}

async function fillWrDialog(page, wr, extra) {
  await fillModalInput(page, 'root_identicalInverters', wr.anzahl || 1);

  if (extra.ze_id) {
    await fillAutocomplete(page, 'root_zerezId_text-input', extra.ze_id);
    await page.waitForTimeout(1200);
  }

  await fillAutocomplete(page, 'root_manufacturer_text-input', wr.hersteller || '');
  await fillAutocomplete(page, 'root_inverterType_text-input', wr.bezeichnung || '');

  const powerVal = String(extra.wr_leistung_kw || wr.leistung_kw || '').replace('.', ',');
  const apparentVal = String(extra.wr_scheinleistung || extra.wr_leistung_kw || wr.leistung_kw || '').replace('.', ',');
  if (powerVal) await fillModalInput(page, 'root_power', powerVal);
  if (apparentVal) await fillModalInput(page, 'root_apparentPower', apparentVal);

  if (extra.speicher_entladeleistung_kw) {
    await fillModalInput(page, 'root_maxDischargePower',
      String(extra.speicher_entladeleistung_kw).replace('.', ','));
  }
  if (extra.speicher_ladeleistung_kw) {
    await fillModalInput(page, 'root_maxChargingPower',
      String(extra.speicher_ladeleistung_kw).replace('.', ','));
  }

  await submitModal(page);
}

async function fillPvDialog(page, pv, extra) {
  const kwpStr = String(pv.leistung_kwp).replace('.', ',');
  await fillModalInput(page, 'root_totalPowerProduction', kwpStr);
  await page.waitForTimeout(300);

  const location = extra.pv_anbringungsort || 'Dachfläche';
  await selectDropdownOption(page, 'root_location', location);
  await selectDropdownOption(page, 'root_curtailmentProcedure', '60%');

  const feedIn = extra.pv_einspeiseart || 'Überschuss';
  await selectDropdownOption(page, 'root_feedInType', feedIn);

  await submitModal(page);
}

async function fillSpeicherDialog(page, bundle, extra) {
  const hersteller = extra.speicher_hersteller || '';
  const typ        = extra.speicher_typ        || '';
  const kwh        = String(bundle.speicher_kwh || '').replace('.', ',');

  if (hersteller) await fillAutocomplete(page, 'root_manufacturer_text-input', hersteller);
  if (typ)        await fillAutocomplete(page, 'root_storageType_text-input',  typ);
  if (kwh)        await fillModalInput(page, 'root_capacity', kwh);

  await selectDropdownOption(page, 'root_energySource', 'Sonne');
  await submitModal(page);
}

async function fillEonGroup({ page, credentials, bundle, extra, snap, portalUrl }) {
  const { user, password } = credentials;
  const s  = bundle.anlagenstandort;
  const pv = bundle.pv;
  const wr = bundle.wechselrichter?.[0] || {};

  await page.goto(portalUrl + '?component=orderoverview', { waitUntil: 'networkidle', timeout: 30000 });
  await snap('01_portal');

  await loginIfNeeded(page, user, password);
  await snap('02_nach_login');

  if (!page.url().includes('orderoverview')) {
    await page.goto(portalUrl + '?component=orderoverview', { waitUntil: 'networkidle', timeout: 20000 });
  }

  await page.getByRole('button', { name: /Neuen Auftrag erstellen/i }).click();
  await page.waitForSelector('.Modal', { timeout: 10000 });
  await snap('03_auftragstyp_modal');

  // "Energie einspeisen" Auswählen
  await page.evaluate(() => {
    const modal = document.querySelector('.Modal');
    const btns  = Array.from(modal?.querySelectorAll('button') || [])
      .filter(b => b.textContent.trim() === 'Auswählen');
    const target = btns.find(btn => {
      let el = btn;
      for (let i = 0; i < 5; i++) el = el?.parentElement;
      return el?.textContent?.includes('Energie einspeisen');
    });
    (target || btns[2])?.click();
  });
  await page.waitForTimeout(800);
  await snap('04_energie_einspeisen');

  // Adressmaske
  const plzField = page.getByLabel(/Postleitzahl oder Ortsname/i);
  await plzField.click();
  await plzField.fill(s.plz);
  await page.waitForTimeout(2000);
  const plzSugg = page.locator('[role="listbox"] [role="option"]').first();
  if (await plzSugg.isVisible({ timeout: 3000 }).catch(() => false)) await plzSugg.click();

  const streetField = page.getByLabel(/^Straße$/i);
  await streetField.click();
  await streetField.fill(s.strasse);
  await page.waitForTimeout(1500);
  const streetSugg = page.locator('[role="listbox"] [role="option"]').first();
  if (await streetSugg.isVisible({ timeout: 3000 }).catch(() => false)) await streetSugg.click();

  await page.getByLabel(/Hausnummer/i).fill(s.hausnummer);
  await page.waitForTimeout(400);
  await snap('05_adresse');

  await page.evaluate(() => {
    document.querySelector('.Modal button.Button.filled')?.click();
  });

  await page.waitForURL(/component=space/, { timeout: 30000 });
  await page.waitForTimeout(2500);
  await snap('06_order_space');

  // Step 1 "Anlage suchen" (optional)
  const anlageSuchenCheckbox = await page.$('#cb-customer-relation-address');
  if (anlageSuchenCheckbox) {
    if (!(await anlageSuchenCheckbox.isChecked())) await anlageSuchenCheckbox.click();
    await page.getByLabel(/Postleitzahl oder Ort/i).fill(s.plz);
    await page.waitForTimeout(1200);
    await page.getByLabel(/^Straße$/i).fill(s.strasse);
    await page.waitForTimeout(800);
    await page.getByLabel(/Hausnummer/i).fill(s.hausnummer);
    await page.waitForTimeout(400);
    await page.getByRole('button', { name: /Suchen/i }).click();
    await page.waitForTimeout(2500);
    const addNew = await page.waitForSelector('#cb-add-new-instance', { timeout: 8000 }).catch(() => null);
    if (addNew) await addNew.click();
    await snap('07_anlage_suchen');
    await clickWeiter(page);
    await page.waitForTimeout(2500);
  }

  await snap('08_messkonzept_start');

  const wrAdded = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button'))
      .find(b => b.textContent.includes('Wechselrichter hinzufügen'));
    if (btn) { btn.click(); return true; }
    return false;
  });
  if (!wrAdded) await clickBearbeitenFor(page, 'Wechselrichter');

  await page.waitForSelector('.Modal', { timeout: 12000 });
  await snap('09_wr_dialog');
  await fillWrDialog(page, wr, extra);
  await snap('10_wr_fertig');

  await clickBearbeitenFor(page, 'PV-Anlage');
  await page.waitForSelector('.Modal', { timeout: 10000 });
  await snap('11_pv_dialog');
  await fillPvDialog(page, pv, extra);
  await snap('12_pv_fertig');

  if (bundle.speicher_kwh) {
    const speicherFound = await clickBearbeitenFor(page, 'Speicher');
    if (speicherFound) {
      await page.waitForSelector('.Modal', { timeout: 8000 });
      await snap('13_speicher_dialog');
      await fillSpeicherDialog(page, bundle, extra);
      await snap('14_speicher_fertig');
    }
  }

  await snap('15_vor_weiter');
  await clickWeiter(page);
  await page.waitForTimeout(2500);
  await snap('16_angaben_finalisieren');

  return {
    portalUrl: page.url(),
    message: [
      'EON-Gruppe: Neuer Auftrag erstellt + Messkonzept ausgefüllt.',
      `Adresse: ${s.strasse} ${s.hausnummer}, ${s.plz} ${s.ort || ''}`.trim(),
      `PV: ${pv.leistung_kwp} kWp`,
      wr.hersteller ? `WR: ${wr.hersteller} ${wr.bezeichnung} (${wr.anzahl || 1}×)` : '',
      bundle.speicher_kwh ? `Speicher: ${bundle.speicher_kwh} kWh` : '',
      extra.ze_id ? `ZEREZ: ${extra.ze_id}` : '',
      'Bitte Angaben finalisieren + Fertigmeldung manuell abschließen.',
    ].filter(Boolean).join(' | '),
  };
}

module.exports = {
  fillEonGroup,
  loginIfNeeded,
  fillModalInput,
  fillAutocomplete,
  selectDropdownOption,
  clickWeiter,
  clickBearbeitenFor,
};
