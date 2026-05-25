/**
 * _lovion.js — Gemeinsamer Filler für Lovion-Portale
 *
 * Portale:
 *   SW Suhl/Zella-Mehlis → netzportal.swsz-netz.de/public/login.html
 *   SW Bayreuth           → stadtwerke-bayreuth.de/installateurportal/public/login.html
 *
 * Plattform: Lovion (jQuery + Handlebars + OpenLayers)
 *   Login: #username + #password + #login_button (stabil)
 *
 * Antrag-Schritte (live inspiziert 2026-05-20):
 *   1. Lage               — Adresssuche
 *   2. Anlagenbetreiber   — Kontaktdaten
 *   3. Einspeiserkomponenten — Radio Ja/Nein
 *   4. Photovoltaikanlage — PV-Daten
 *   5. Einverständnis     — 3× Radio-Ja
 *   6. Sonstige Angaben   — Bemerkung (optional)
 *   7. Dokumente          — manuell
 *   8. Zusammenfassung
 *
 * bundle.pv-Felder (Lovion-spezifisch):
 *   pv.montageort_lovion   ('roof'|'open_area'|'facade')
 *   pv.einspeiseart_lovion ('overflow'|'full')
 *   pv.spannungsebene_lovion ('low'|'mid')
 */

async function loginLovion(page, user, password) {
  await page.waitForSelector('#username', { timeout: 10000 });
  await page.fill('#username', user);
  await page.fill('#password', password);
  await page.click('#login_button');
  await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 25000 });
}

async function searchAndSelectAddress(page, s) {
  const searchField = page.locator('input[id$="-search-field"]');
  await searchField.waitFor({ timeout: 8000 });
  await searchField.click();
  await searchField.fill('');

  const searchStr = `${s.strasse} ${s.hausnummer} ${s.ort || s.plz}`;
  await searchField.pressSequentially(searchStr, { delay: 80 });

  await page.waitForSelector('ul.search-result-list li', { timeout: 8000 });
  await page.waitForTimeout(600);

  const items = page.locator('ul.search-result-list li');
  const count = await items.count();

  let clicked = false;
  for (let i = 0; i < Math.min(count, 8); i++) {
    const text = (await items.nth(i).textContent() || '').trim();
    if (text.includes(s.strasse) && text.includes(String(s.hausnummer))) {
      await items.nth(i).click();
      clicked = true;
      break;
    }
  }
  if (!clicked && count > 0) await items.first().click();

  await page.waitForTimeout(1200);
}

async function clickWeiter(page) {
  const btn = page.locator('a.btn-next:not(.disabled), button.btn-next:not(:disabled)');
  if (await btn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await btn.click();
    await page.waitForTimeout(1500);
    return true;
  }
  return false;
}

async function saveEntwurf(page) {
  const btn = page.locator('a:has-text("Entwurf speichern"), button:has-text("Entwurf speichern"), a.btn-save');
  if (await btn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await btn.click();
    await page.waitForTimeout(1000);
  }
}

async function fillIfExists(page, selector, value) {
  if (!value && value !== 0) return;
  const el = page.locator(selector).first();
  if (await el.isVisible({ timeout: 1500 }).catch(() => false)) await el.fill(String(value));
}

async function selectIfExists(page, selector, value) {
  if (!value) return;
  const el = page.locator(selector).first();
  if (await el.isVisible({ timeout: 1500 }).catch(() => false)) {
    await el.selectOption(String(value)).catch(() => {});
  }
}

async function clickRadio(page, nameContains, value) {
  const el = page.locator(`input[type="radio"][name*="${nameContains}"][value="${value}"]`).first();
  if (await el.isVisible({ timeout: 1500 }).catch(() => false)) {
    await el.click();
    await page.waitForTimeout(300);
  }
}

async function fillLovion({ page, credentials, bundle, extra, snap, loginUrl }) {
  const { user, password } = credentials;
  const s  = bundle.anlagenstandort;
  const pv = bundle.pv;
  const b  = bundle.betreiber || {};
  const sp = bundle.speicher;

  await page.goto(loginUrl, { waitUntil: 'networkidle', timeout: 30000 });
  await snap('01_login');
  await loginLovion(page, user, password);
  await snap('02_nach_login');

  const jetzt = page.locator('a:has-text("Jetzt starten")').first();
  await jetzt.waitFor({ timeout: 8000 });
  await jetzt.click();
  await page.waitForSelector('a:has-text("Beantragen")', { timeout: 10000 });
  await snap('03_consumer');

  const beantragen = page.locator('a:has-text("Beantragen"), button:has-text("Beantragen")');
  await beantragen.nth(2).click();
  await page.waitForURL(/showRwo/, { timeout: 15000 });
  await page.waitForTimeout(1500);
  await snap('04_step1_lage');

  // Step 1: Lage
  const jaRadio = page.locator('input[name^="df_address_information"][value="true"]');
  if (await jaRadio.isVisible({ timeout: 3000 }).catch(() => false)) {
    await jaRadio.click();
    await page.waitForTimeout(400);
  }
  await searchAndSelectAddress(page, s);
  await saveEntwurf(page);
  await snap('05_step1_lage_fertig');
  await clickWeiter(page);

  // Step 2: Anlagenbetreiber
  await page.waitForTimeout(1000);
  await snap('06_step2_betreiber');

  await selectIfExists(page, 'select[name="address_form"]', b.anrede || 'Herr');
  await fillIfExists(page, 'input[name="first_name"]',   b.vorname || '');
  await fillIfExists(page, 'input[name="name"]',          b.nachname || '');
  await fillIfExists(page, 'input[name="street"]',        b.strasse || s.strasse);
  await fillIfExists(page, 'input[name="house_number"]',  b.hausnummer || s.hausnummer);
  await fillIfExists(page, 'input[name="zip_code"]',      b.plz || s.plz);
  await fillIfExists(page, 'input[name="locality"]',      b.ort || s.ort || '');
  await fillIfExists(page, 'input[name="phone_number"]',  b.telefon || '');
  // mobile_number ist Pflichtfeld!
  await fillIfExists(page, 'input[name="mobile_number"]', b.mobil || b.telefon || extra?.mobil || '01234567890');
  await fillIfExists(page, 'input[name="email_address"]', b.email || user);

  await saveEntwurf(page);
  await snap('07_step2_betreiber_fertig');
  await clickWeiter(page);

  // Step 3: Einspeiserkomponenten
  await page.waitForTimeout(1000);
  await snap('08_step3_einspeiser');

  await clickRadio(page, 'create_pc_el_pv', 'true');
  if (sp) await clickRadio(page, 'create_pc_el_battery', 'true');

  await saveEntwurf(page);
  await snap('09_step3_einspeiser_fertig');
  await clickWeiter(page);

  // Step 4: Photovoltaikanlage
  await page.waitForTimeout(1000);
  await snap('10_step4_pv');

  await selectIfExists(page, 'select[name="photovoltaic_location"]',
    pv.montageort_lovion || 'roof');
  await fillIfExists(page, 'input[name="gross_power_kwp"]',
    String(pv.leistung_kwp).replace('.', ','));
  await selectIfExists(page, 'select[name="supply_type_v"]',
    pv.einspeiseart_lovion || 'overflow');
  if (pv.spannungsebene_lovion) {
    await selectIfExists(page, 'select[name="voltage_level_transfer_point"]',
      pv.spannungsebene_lovion);
  }

  await saveEntwurf(page);
  await snap('11_step4_pv_fertig');
  await clickWeiter(page);

  // Step 4b: Batteriespeicher (falls vorhanden)
  if (sp) {
    await page.waitForTimeout(1000);
    const isBatteryStep = await page.locator('input[name*="battery_capacity"], input[name*="storage_capacity"]')
      .isVisible({ timeout: 3000 }).catch(() => false);

    if (isBatteryStep) {
      await snap('11b_step4b_speicher');
      await fillIfExists(page, 'input[name*="storage_capacity"], input[name*="battery_capacity"]',
        String(sp.kapazitaet_kwh || '').replace('.', ','));
      await fillIfExists(page, 'input[name*="storage_power"], input[name*="battery_power"]',
        String(sp.leistung_kw || '').replace('.', ','));
      await saveEntwurf(page);
      await clickWeiter(page);
    }
  }

  // Step 5: Einverständnis — Radio-Buttons, NICHT Checkboxen!
  await page.waitForTimeout(1000);
  await snap('12_step5_einverstaendnis');

  await clickRadio(page, 'agreement_personal_data', 'true');
  await clickRadio(page, 'agreement_disclaimer', 'true');
  await clickRadio(page, 'agreement_eeg_nav_tab', 'true');

  await saveEntwurf(page);
  await snap('13_step5_einverstaendnis_fertig');
  await clickWeiter(page);

  // Step 6: Sonstige Angaben
  await page.waitForTimeout(800);
  await snap('14_step6_sonstige');

  if (extra?.bemerkung) {
    const remark = page.locator('textarea[name="remark"]');
    if (await remark.isVisible({ timeout: 2000 }).catch(() => false)) {
      await remark.fill(extra.bemerkung);
    }
  }

  await saveEntwurf(page);
  await clickWeiter(page);

  // Step 7: Dokumente — manuell durch Team
  await page.waitForTimeout(800);
  await snap('15_step7_dokumente');
  await saveEntwurf(page);

  // Step 8: Zusammenfassung
  await page.waitForTimeout(800);
  await snap('16_step8_zusammenfassung');

  return {
    portalUrl: page.url(),
    message: [
      'Lovion: Antrag dezentrale Einspeisung als Entwurf gespeichert.',
      'Bitte Dokumente hochladen + Formular manuell einreichen.',
      `Adresse: ${s.strasse} ${s.hausnummer}, ${s.plz} ${s.ort || ''}`.trim(),
      `PV: ${pv?.leistung_kwp} kWp`,
      sp ? `Speicher: ${sp.kapazitaet_kwh} kWh` : null,
    ].filter(Boolean).join(' | '),
  };
}

module.exports = { fillLovion, loginLovion, searchAndSelectAddress, clickWeiter, saveEntwurf };
