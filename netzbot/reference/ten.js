/**
 * Thüringer Energienetze GmbH (TEN) — Portal-Filler
 * Portal: https://www.ten-netzkundenportal.de/uebersicht
 *
 * Plattform: Azure AD B2C (MSAL.js v4.30.0)
 *   B2C-Policy: tennkpprod.b2clogin.com/.../B2C_1A_TEN_NKP_MFA_Signin
 *   ACHTUNG: MFA möglich → extra.mfa_code mitgeben oder MFA im Konto deaktivieren!
 *
 * Login (live inspiziert 2026-05-20):
 *   E-Mail:    input[placeholder="E-Mail-Adresse"]
 *   Passwort:  input[placeholder="Passwort"]
 *   Submit:    button[type="submit"]   (nur EINER — Standard!)
 *
 * Einspeisung-Antragsstrecke:
 *   URL: /einspeisung/antragsstrecke/startseite
 *
 * Step 1 — bestätigte IDs:
 *   #radiobutton-customerType-installer
 *   #radiobutton-service-newConstruction
 *   #dropdown-plantSize (smallest/small/medium/big)
 *   #button-Weiter
 */

const PORTAL_URL      = 'https://www.ten-netzkundenportal.de/uebersicht';
const EINSPEISUNG_URL = 'https://www.ten-netzkundenportal.de/einspeisung/antragsstrecke/startseite';

function plantSizeValue(kwp) {
  const k = parseFloat(kwp) || 0;
  if (k <= 10)  return 'smallest';
  if (k <= 30)  return 'small';
  if (k <= 100) return 'medium';
  return 'big';
}

async function fill({ page, credentials, bundle, extra, snap }) {
  const { user, password } = credentials;
  const s    = bundle.anlagenstandort;
  const pv   = bundle.pv   || {};
  const b    = bundle.betreiber || {};
  const inst = bundle.installateur || {};
  const sp   = bundle.speicher;

  // ── 1. Portal öffnen → Azure B2C Redirect ─────────────────────────────────
  await page.goto(PORTAL_URL, { waitUntil: 'networkidle', timeout: 30000 });
  await snap('01_b2c_login');

  const emailField = page.locator('input[placeholder="E-Mail-Adresse"]');
  await emailField.waitFor({ timeout: 15000 });
  await emailField.fill(user);
  await page.locator('input[placeholder="Passwort"]').fill(password);
  await page.locator('button[type="submit"]').click();
  await page.waitForTimeout(3000);
  await snap('02_nach_passwort');

  // ── 2. MFA (falls B2C_1A_TEN_NKP_MFA_Signin MFA triggert) ────────────────
  const mfaField = page.locator(
    'input[autocomplete="one-time-code"], input[placeholder*="Code"], ' +
    'input[placeholder*="OTP"], input[placeholder*="Bestätigungscode"]'
  );
  if (await mfaField.isVisible({ timeout: 8000 }).catch(() => false)) {
    const mfaCode = extra?.mfa_code || '';
    if (mfaCode) {
      await mfaField.fill(mfaCode);
      await page.locator('button[type="submit"]').click();
      await page.waitForURL(/ten-netzkundenportal\.de/, { timeout: 30000 });
    } else {
      await snap('03_mfa_required');
      // 30 Sekunden warten — Mensch kann manuell eingeben
      await page.waitForURL(/ten-netzkundenportal\.de/, { timeout: 35000 }).catch(() => {});
      if (page.url().includes('b2clogin.com')) {
        return {
          portalUrl: page.url(),
          message: 'TEN: MFA-Code erforderlich! extra.mfa_code beim Aufruf mitgeben oder MFA im Konto deaktivieren.',
        };
      }
    }
  } else {
    await page.waitForURL(/ten-netzkundenportal\.de/, { timeout: 25000 }).catch(() => {});
  }
  await snap('03_nach_login');

  // ── 3. Zur Einspeisung-Antragsstrecke ─────────────────────────────────────
  await page.goto(EINSPEISUNG_URL, { waitUntil: 'networkidle', timeout: 25000 });
  await snap('04_einspeisung_start');

  const losGehtBtn = page.locator('button:has-text("Los geht"), a:has-text("Los geht")').first();
  if (await losGehtBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await losGehtBtn.click();
    await page.waitForTimeout(1500);
  }
  await snap('05_step1_start');

  // ── Step 1: Antragsteller-Typ + Anlagenart + Leistungsbereich (BESTÄTIGT) ──
  const customerTypeId = extra?.ten_customer_type === 'projectpartner'
    ? '#radiobutton-customerType-projectpartner'
    : '#radiobutton-customerType-installer';
  const customerTypeEl = page.locator(customerTypeId);
  if (await customerTypeEl.isVisible({ timeout: 3000 }).catch(() => false)) {
    await customerTypeEl.click();
    await page.waitForTimeout(400);
  }

  const serviceType = extra?.ten_service_type || 'newConstruction';
  const serviceEl = page.locator(`#radiobutton-service-${serviceType}`);
  if (await serviceEl.isVisible({ timeout: 2000 }).catch(() => false)) {
    await serviceEl.click();
    await page.waitForTimeout(400);
  }

  const plantSize = extra?.ten_plant_size || plantSizeValue(pv.leistung_kwp);
  const plantSizeEl = page.locator('#dropdown-plantSize');
  if (await plantSizeEl.isVisible({ timeout: 2000 }).catch(() => false)) {
    await plantSizeEl.selectOption(plantSize);
    await page.waitForTimeout(400);
  }
  await snap('06_step1_fertig');

  await page.locator('#button-Weiter').click().catch(async () => {
    await page.locator('button:has-text("Weiter")').first().click().catch(() => {});
  });
  await page.waitForTimeout(1500);
  await snap('07_step2_start');

  // ── Hilfsfunktionen ────────────────────────────────────────────────────────

  async function fillIfExists(sel, value) {
    if (!value && value !== 0) return;
    const el = page.locator(sel).first();
    if (await el.isVisible({ timeout: 1500 }).catch(() => false)) await el.fill(String(value));
  }

  async function clickIfExists(sel) {
    const el = page.locator(sel).first();
    if (await el.isVisible({ timeout: 1500 }).catch(() => false)) await el.click();
  }

  async function clickWeiter() {
    const btn = page.locator(
      '#button-Weiter, button:has-text("Weiter"), ' +
      'button[type="submit"]:not(:disabled), [class*="next"]:not([disabled])'
    ).first();
    if (await btn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await btn.click();
      await page.waitForTimeout(1500);
    }
  }

  // ── Step 2: Standort ──────────────────────────────────────────────────────
  await fillIfExists('input[id*="street"], input[name*="street"], input[placeholder*="Straße" i]', s.strasse);
  await fillIfExists('input[id*="houseNumber"], input[name*="houseNumber"], input[placeholder*="Hausnr" i]', s.hausnummer);
  await fillIfExists('input[id*="zipCode"], input[name*="zipCode"], input[placeholder*="PLZ" i]', s.plz);
  await fillIfExists('input[id*="city"], input[name*="city"], input[placeholder*="Ort" i]', s.ort || '');
  await snap('08_step2_adresse');
  await clickWeiter();

  // ── Step 3: PV-Technische Angaben ─────────────────────────────────────────
  await fillIfExists('input[id*="power"], input[id*="kwp"], input[placeholder*="kWp" i]', pv.leistung_kwp || '');
  await fillIfExists('input[id*="manufacturer"], input[placeholder*="Hersteller" i]',
    pv.modul_hersteller || extra?.modul_hersteller || '');
  await fillIfExists('input[id*="inverter"], input[placeholder*="Wechselrichter" i]',
    pv.wr_hersteller || extra?.wr_hersteller || '');
  await fillIfExists('input[id*="commissioningDate"], input[type="date"]',
    pv.inbetriebnahme_datum || extra?.inbetriebnahme_datum || '');

  if (pv.einspeiseart_ten === 'full') {
    await clickIfExists('[id*="Volleinspeisung"], [id*="full"]');
  } else {
    await clickIfExists('[id*="Überschuss"], [id*="overflow"], [id*="excess"]');
  }

  if (sp) {
    await fillIfExists('input[id*="storageCapacity"], input[placeholder*="Kapazität" i]', sp.kapazitaet_kwh || '');
    await fillIfExists('input[id*="storagePower"]', sp.leistung_kw || '');
  }
  await snap('09_step3_pv');
  await clickWeiter();

  // ── Step 4: Betreiber ─────────────────────────────────────────────────────
  await fillIfExists('input[id*="firstName"], input[name*="firstName"]', b.vorname || '');
  await fillIfExists('input[id*="lastName"], input[name*="lastName"]', b.nachname || '');
  await fillIfExists('input[type="email"], input[id*="email"]', b.email || user);
  await fillIfExists('input[type="tel"], input[id*="phone"]', b.telefon || extra?.telefon || '');
  await snap('10_step4_betreiber');
  await clickWeiter();

  // ── Step 5: Installateur ──────────────────────────────────────────────────
  await fillIfExists('input[id*="installerCompany"]', inst.firma || extra?.installateur_firma || '');
  await fillIfExists('input[id*="installerFirstName"]', inst.vorname || '');
  await fillIfExists('input[id*="installerLastName"]', inst.nachname || '');
  await fillIfExists('input[id*="installerEmail"]', inst.email || user);
  await fillIfExists('input[id*="installerPhone"]', inst.telefon || b.telefon || '');
  await snap('11_step5_installateur');
  await clickWeiter();

  // ── Step 6+: Datenschutz-Checkboxen ──────────────────────────────────────
  await snap('12_step6_weitere');
  const checkboxes = page.locator('input[type="checkbox"]:not(:checked)');
  const cbCount = await checkboxes.count();
  for (let i = 0; i < cbCount; i++) {
    await checkboxes.nth(i).click().catch(() => {});
    await page.waitForTimeout(200);
  }
  await clickWeiter();
  await snap('13_zusammenfassung');

  const saveBtn = page.locator(
    'button:has-text("Entwurf"), button:has-text("Speichern"), ' +
    'button:has-text("Zwischenspeichern"), #button-Speichern'
  ).first();
  if (await saveBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await saveBtn.click();
    await page.waitForTimeout(1500);
  }
  await snap('14_entwurf_gespeichert');

  return {
    portalUrl: page.url(),
    message: [
      'TEN: Antrag als Entwurf gespeichert.',
      'Bitte Dokumente hochladen und manuell einreichen.',
      `Adresse: ${s.strasse} ${s.hausnummer}, ${s.plz} ${s.ort || ''}`.trim(),
      `PV: ${pv.leistung_kwp} kWp (${plantSizeValue(pv.leistung_kwp)})`,
      sp ? `Speicher: ${sp.kapazitaet_kwh} kWh` : null,
    ].filter(Boolean).join(' | '),
  };
}

module.exports = { fill };
