/**
 * Stromnetz Berlin GmbH — Portal-Filler
 * Portal: https://services.stromnetz.berlin/anlagen
 *
 * Plattform: Spring Boot / Angular SPA
 *   Auth: Azure AD B2C (Custom Policy: B2C_1A_S_L)
 *   B2C-Domain: kundenportal.stromnetz.berlin (Custom Domain!)
 *
 * Login-Flow (live inspiziert 2026-05-20):
 *   1. /anlagen öffnen → Auth Guard → B2C Redirect
 *   2. B2C-Formular (stabile IDs):
 *      #signInName  (E-Mail)
 *      #password
 *      #next        (Submit — NICHT button[type="submit"], 2 Buttons vorhanden!)
 *   3. Redirect zurück zu services.stromnetz.berlin
 *
 * Anlagentyp: kWp ≤ 30 → "bis 30 kVA", kWp > 30 → "30 kVA bis 100 kWp"
 */

const ANLAGEN_URL = 'https://services.stromnetz.berlin/anlagen';

async function fill({ page, credentials, bundle, extra, snap }) {
  const { user, password } = credentials;
  const s  = bundle.anlagenstandort;
  const pv = bundle.pv || {};
  const b  = bundle.betreiber || {};
  const sp = bundle.speicher;
  const kwp = parseFloat(pv.leistung_kwp) || 0;

  // ── 1. Login via Azure B2C ────────────────────────────────────────────────
  await page.goto(ANLAGEN_URL, { waitUntil: 'networkidle', timeout: 30000 });
  await snap('01_b2c_login');

  const signInName = page.locator('#signInName');
  await signInName.waitFor({ timeout: 15000 });
  await signInName.fill(user);
  await page.locator('#password').fill(password);
  // #next verwenden — NICHT button[type="submit"] (2 Buttons vorhanden!)
  await page.locator('#next').click();

  await page.waitForURL(/services\.stromnetz\.berlin/, { timeout: 30000 })
    .catch(() => page.waitForTimeout(5000));
  await snap('02_nach_login');

  // ── 2. Zur Anlagenverwaltung ──────────────────────────────────────────────
  await page.goto(ANLAGEN_URL, { waitUntil: 'networkidle', timeout: 25000 });
  await snap('03_anlagen_liste');

  // ── 3. Neue Anlage anmelden ────────────────────────────────────────────────
  const anlageBtn = page.locator(
    'button:has-text("Anlage anmelden"), a:has-text("Anlage anmelden"), ' +
    'button:has-text("Neue Anlage"), button:has-text("Neuen Antrag")'
  ).first();
  await anlageBtn.waitFor({ timeout: 10000 });
  await anlageBtn.click();
  await page.waitForTimeout(1500);
  await snap('04_antrag_typ');

  // ── 4. Anlagentyp auswählen (je nach Leistung) ────────────────────────────
  const typLabel = kwp <= 30
    ? /bis 30 kVA|bis 30|kleinere|PV.*30/i
    : /30 kVA bis 100|größere|PV.*100/i;

  const typCard = page.locator('[class*="card"], [class*="option"], button, a').filter({ hasText: typLabel }).first();
  if (await typCard.isVisible({ timeout: 5000 }).catch(() => false)) {
    await typCard.click();
    await page.waitForTimeout(1000);
  }
  await snap('05_formular_start');

  // ── 5. Angular-Formular ausfüllen ─────────────────────────────────────────

  async function fillIfExists(sel, val) {
    if (!val && val !== 0) return;
    const el = page.locator(sel).first();
    if (await el.isVisible({ timeout: 1500 }).catch(() => false)) await el.fill(String(val));
  }

  async function clickIfExists(sel) {
    const el = page.locator(sel).first();
    if (await el.isVisible({ timeout: 1500 }).catch(() => false)) await el.click();
  }

  async function clickWeiter() {
    const btn = page.locator(
      'button:has-text("Weiter"), button:has-text("Nächster"), ' +
      'button[type="submit"]:not(:disabled), [class*="next"]'
    ).first();
    if (await btn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await btn.click();
      await page.waitForTimeout(1500);
    }
  }

  // Standort / Adresse
  await fillIfExists('[formcontrolname="street"], [name="street"], input[placeholder*="Straße"]', s.strasse);
  await fillIfExists('[formcontrolname="houseNumber"], [name="houseNumber"], input[placeholder*="Hausnr"]', s.hausnummer);
  await fillIfExists('[formcontrolname="zipCode"], [name="zipCode"], input[placeholder*="PLZ"]', s.plz);
  await fillIfExists('[formcontrolname="city"], [name="city"], input[placeholder*="Ort"]', s.ort || '');
  await snap('06_adresse');
  await clickWeiter();

  // PV-Daten
  await fillIfExists('[formcontrolname="powerKwp"], [name="powerKwp"], input[placeholder*="kWp"]', pv.leistung_kwp);
  await fillIfExists('[formcontrolname="manufacturer"], input[placeholder*="Hersteller"]',
    pv.modul_hersteller || extra?.modul_hersteller || '');
  await fillIfExists('[formcontrolname="inverterPower"], input[placeholder*="Wechselrichter"]',
    pv.pa_max_kw || pv.leistung_kwp || '');

  if (pv.einspeiseart_ten === 'full') {
    await clickIfExists('[value="Volleinspeisung"], [formcontrolname="feedInType"] input[value*="voll" i]');
  } else {
    await clickIfExists('[value="Überschusseinspeisung"], [formcontrolname="feedInType"] input[value*="über" i]');
  }
  await snap('07_pv_daten');
  await clickWeiter();

  // Speicher (falls vorhanden)
  if (sp) {
    await fillIfExists('[formcontrolname="storageCapacity"], input[placeholder*="Kapazität"]', sp.kapazitaet_kwh);
    await fillIfExists('[formcontrolname="storagePower"], input[placeholder*="Leistung"]', sp.leistung_kw || '');
    await snap('08_speicher');
    await clickWeiter();
  }

  // Betreiber
  const inst = bundle.installateur || {};
  await fillIfExists('[formcontrolname="firstName"], [name="firstName"]', b.vorname || '');
  await fillIfExists('[formcontrolname="lastName"], [name="lastName"]', b.nachname || '');
  await fillIfExists('[formcontrolname="email"], [type="email"]', b.email || user);
  await fillIfExists('[formcontrolname="phone"], [type="tel"]', b.telefon || extra?.telefon || '');
  await snap('09_betreiber');
  await clickWeiter();

  // Installateur
  await fillIfExists('[formcontrolname="installerCompany"], [name="installerCompany"]',
    inst.firma || extra?.installateur_firma || '');
  await fillIfExists('[formcontrolname="installerEmail"], input[placeholder*="Installateur"]',
    inst.email || user);
  await snap('10_installateur');
  await clickWeiter();

  // Zusammenfassung / Entwurf speichern
  await snap('11_zusammenfassung');

  const saveBtn = page.locator(
    'button:has-text("Entwurf"), button:has-text("Speichern"), button:has-text("Zwischenspeichern")'
  ).first();
  if (await saveBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await saveBtn.click();
    await page.waitForTimeout(1500);
  }
  await snap('12_entwurf_gespeichert');

  return {
    portalUrl: page.url(),
    message: [
      'Stromnetz Berlin: Antrag als Entwurf gespeichert.',
      'Bitte Dokumente hochladen und manuell einreichen.',
      `Adresse: ${s.strasse} ${s.hausnummer}, ${s.plz} ${s.ort || ''}`.trim(),
      `PV: ${pv.leistung_kwp} kWp`,
      sp ? `Speicher: ${sp.kapazitaet_kwh} kWh` : null,
    ].filter(Boolean).join(' | '),
  };
}

module.exports = { fill };
