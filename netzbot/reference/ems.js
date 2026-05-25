/**
 * EMS Energieversorgung Selb (ESM Selb) — Portal-Filler
 * Portal: https://netz-portal.esm-selb.de/hap-fe/bo/#/home
 *
 * Plattform: "Hausanschluss Portal" (ivurz.de) — Angular Material (MDC) SPA
 * Hash-Routing SPA: #/home → #/tm/desktop (nach Login)
 *
 * Login-Flow (live inspiziert 2026-05-20):
 *   1. Startseite: button.login-button klicken
 *   2. Angular Material Dialog (mat-dialog-container):
 *      E-Mail:   mat-label "E-Mail-Adresse" → input (ID instabil!)
 *      Passwort: mat-label "Passwort"        → input (ID instabil!)
 *      Submit:   #login  ← NICHT button.mdc-button--raised (zu generisch!)
 *   3. Nach Login: URL wechselt auf #/tm/desktop
 */

const PORTAL_URL = 'https://netz-portal.esm-selb.de/hap-fe/bo/#/home';

async function fill({ page, credentials, bundle, extra, snap }) {
  const { user, password } = credentials;
  const s    = bundle.anlagenstandort;
  const pv   = bundle.pv   || {};
  const b    = bundle.betreiber || {};
  const inst = bundle.installateur || {};
  const sp   = bundle.speicher;

  // ── 1. Portal öffnen ──────────────────────────────────────────────────────
  await page.goto(PORTAL_URL, { waitUntil: 'networkidle', timeout: 30000 });
  await snap('01_hap_start');

  // ── 2. Login-Dialog öffnen ────────────────────────────────────────────────
  const loginBtn = page.locator('button.login-button').first();
  await loginBtn.waitFor({ timeout: 10000 });
  await loginBtn.click();

  await page.waitForSelector('mat-dialog-container', { timeout: 8000 });
  await snap('02_login_dialog');

  // ── 3. Credentials eintragen ──────────────────────────────────────────────
  // mat-input-* IDs sind auto-generiert und instabil → per Label selektieren
  await page.getByLabel('E-Mail-Adresse').fill(user);
  await page.getByLabel('Passwort').fill(password);
  await page.locator('#login').click();

  await page.waitForURL(/\#\/tm\/desktop/, { timeout: 25000 }).catch(() =>
    page.waitForTimeout(3000)
  );
  await snap('03_nach_login');

  // ── 4. Einspeise-Antrag starten ───────────────────────────────────────────
  const neuerAntragBtn = page.locator(
    'button:has-text("Neue Anfrage"), button:has-text("Antrag stellen"), ' +
    'button:has-text("Neuer Antrag"), a:has-text("Neue Anfrage"), ' +
    'a:has-text("Einspeiseanlage"), button:has-text("Einspeisung")'
  ).first();

  if (await neuerAntragBtn.isVisible({ timeout: 8000 }).catch(() => false)) {
    await neuerAntragBtn.click();
    await page.waitForTimeout(1500);
  }
  await snap('04_antrag_typ');

  const pvOption = page.locator(
    '[class*="card"]:has-text("Einspeisung"), [class*="card"]:has-text("PV-Anlage"), ' +
    'mat-card:has-text("Einspeisung"), mat-card:has-text("PV"), ' +
    'button:has-text("PV-Anlage"), li:has-text("Einspeisung")'
  ).first();
  if (await pvOption.isVisible({ timeout: 4000 }).catch(() => false)) {
    await pvOption.click();
    await page.waitForTimeout(1000);
  }
  await snap('05_formular_start');

  // ── 5. Hilfsfunktionen ────────────────────────────────────────────────────

  async function fillIfExists(sel, value) {
    if (!value && value !== 0) return;
    const el = page.locator(sel).first();
    if (await el.isVisible({ timeout: 1500 }).catch(() => false))
      await el.fill(String(value));
  }

  async function clickIfExists(sel) {
    const el = page.locator(sel).first();
    if (await el.isVisible({ timeout: 1500 }).catch(() => false))
      await el.click();
  }

  async function clickWeiter() {
    const btn = page.locator(
      'button:has-text("Weiter"), button:has-text("Nächster Schritt"), ' +
      'button[matStepperNext], button[type="submit"]:not(:disabled), ' +
      '[class*="next"]:not([disabled])'
    ).first();
    if (await btn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await btn.click();
      await page.waitForTimeout(1500);
    }
  }

  // ── 6. Standort / Adresse ─────────────────────────────────────────────────
  await fillIfExists('[formcontrolname="street"], [name="street"], input[placeholder*="Straße" i]', s.strasse);
  await fillIfExists('[formcontrolname="houseNumber"], [name="houseNumber"], input[placeholder*="Hausnr" i]', s.hausnummer);
  await fillIfExists('[formcontrolname="zipCode"], [name="zipCode"], input[placeholder*="PLZ" i]', s.plz);
  await fillIfExists('[formcontrolname="city"], [name="city"], input[placeholder*="Ort" i]', s.ort || '');
  await snap('06_standort');
  await clickWeiter();

  // ── 7. Anlagendaten (PV) ──────────────────────────────────────────────────
  await fillIfExists(
    '[formcontrolname="installedPower"], [formcontrolname="powerKwp"], input[placeholder*="kWp" i]',
    pv.leistung_kwp || ''
  );
  await fillIfExists(
    '[formcontrolname="manufacturer"], input[placeholder*="Hersteller" i]',
    pv.modul_hersteller || extra?.modul_hersteller || ''
  );
  await fillIfExists(
    '[formcontrolname="inverterPower"], input[placeholder*="Wechselrichter" i]',
    pv.pa_max_kw || pv.leistung_kwp || ''
  );
  await fillIfExists(
    '[formcontrolname="commissioningDate"], input[type="date"], input[placeholder*="Inbetrieb" i]',
    pv.inbetriebnahme_datum || extra?.inbetriebnahme_datum || ''
  );

  if (pv.einspeiseart_ten === 'full') {
    await clickIfExists('[value="Volleinspeisung"], input[value*="voll" i]');
  } else {
    await clickIfExists('[value="Überschusseinspeisung"], input[value*="über" i]');
  }

  if (sp) {
    await fillIfExists(
      '[formcontrolname="storageCapacity"], input[placeholder*="Kapazität" i]',
      sp.kapazitaet_kwh || ''
    );
    await fillIfExists(
      '[formcontrolname="storagePower"]',
      sp.leistung_kw || ''
    );
  }
  await snap('07_pv_daten');
  await clickWeiter();

  // ── 8. Betreiber / Antragsteller ──────────────────────────────────────────
  await fillIfExists('[formcontrolname="firstName"], [name="firstName"]', b.vorname || '');
  await fillIfExists('[formcontrolname="lastName"], [name="lastName"]', b.nachname || '');
  await fillIfExists('[formcontrolname="email"], [type="email"]', b.email || user);
  await fillIfExists('[formcontrolname="phone"], [type="tel"]', b.telefon || extra?.telefon || '');
  await snap('08_betreiber');
  await clickWeiter();

  // ── 9. Installateur ───────────────────────────────────────────────────────
  await fillIfExists(
    '[formcontrolname="installerCompany"], [name="installerCompany"]',
    inst.firma || extra?.installateur_firma || ''
  );
  await fillIfExists('[formcontrolname="installerEmail"], input[placeholder*="Installateur" i]', inst.email || user);
  await fillIfExists('[formcontrolname="installerPhone"]', inst.telefon || b.telefon || '');
  await snap('09_installateur');
  await clickWeiter();

  // ── 10. Zusammenfassung / Entwurf speichern ───────────────────────────────
  await snap('10_zusammenfassung');

  const saveBtn = page.locator(
    'button:has-text("Entwurf"), button:has-text("Speichern"), ' +
    'button:has-text("Zwischenspeichern"), button:has-text("Entwurf speichern")'
  ).first();
  if (await saveBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await saveBtn.click();
    await page.waitForTimeout(1500);
  }
  await snap('11_entwurf_gespeichert');

  return {
    portalUrl: page.url(),
    message: [
      'EMS Selb (Hausanschluss Portal): Antrag als Entwurf gespeichert.',
      'Bitte Dokumente hochladen und manuell einreichen.',
      `Adresse: ${s.strasse} ${s.hausnummer}, ${s.plz} ${s.ort || ''}`.trim(),
      `PV: ${pv.leistung_kwp} kWp`,
      sp ? `Speicher: ${sp.kapazitaet_kwh} kWh` : null,
    ].filter(Boolean).join(' | '),
  };
}

module.exports = { fill };
