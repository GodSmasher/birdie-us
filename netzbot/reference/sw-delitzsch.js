/**
 * Stadtwerke Delitzsch GmbH — Portal-Filler
 * Portal: https://hap.dlz.ivurz.de/X4/webapp/Installateurportal/Module/Dashboard
 *
 * Plattform: X4 Mobile App (ivurz.de) — SPA, Auth über Keycloak (Realm: X4Realm)
 *
 * Login-Flow (live inspiziert 2026-05-20):
 *   1. Portal-URL → Redirect zu Keycloak:
 *      hap.dlz.ivurz.de/auth/realms/X4Realm/protocol/openid-connect/auth?...
 *   2. Keycloak (stabile IDs):
 *      Benutzername: #username
 *      Passwort:     #password
 *      Submit:       #kc-login
 *   3. Nach Login: Redirect zurück zu /X4/webapp/Installateurportal/Module/Dashboard
 */

const PORTAL_URL = 'https://hap.dlz.ivurz.de/X4/webapp/Installateurportal/Module/Dashboard';

async function fill({ page, credentials, bundle, extra, snap }) {
  const { user, password } = credentials;
  const s    = bundle.anlagenstandort;
  const pv   = bundle.pv   || {};
  const b    = bundle.betreiber || {};
  const inst = bundle.installateur || {};
  const sp   = bundle.speicher;

  // ── 1. Portal öffnen → Keycloak-Redirect ─────────────────────────────────
  await page.goto(PORTAL_URL, { waitUntil: 'networkidle', timeout: 30000 });
  await snap('01_keycloak_login');

  // ── 2. Keycloak-Login (X4Realm) ───────────────────────────────────────────
  const userField = page.locator('#username');
  await userField.waitFor({ timeout: 10000 });
  await userField.fill(user);
  await page.locator('#password').fill(password);
  await page.locator('#kc-login').click();

  await page.waitForURL(/hap\.dlz\.ivurz\.de\/X4/, { timeout: 25000 }).catch(() =>
    page.waitForTimeout(3000)
  );
  await snap('02_nach_login');

  // ── 3. Dashboard → Einspeise-Antrag starten ──────────────────────────────
  await page.waitForSelector(
    '[class*="dashboard"], [class*="Dashboard"], h1, nav, .btn',
    { timeout: 10000 }
  ).catch(() => {});

  const antragBtn = page.locator(
    'button:has-text("Neue Anfrage"), button:has-text("Antrag stellen"), ' +
    'button:has-text("Neuer Antrag"), a:has-text("Neue Anfrage"), ' +
    'a:has-text("Einspeiseanlage"), button:has-text("Einspeisung")'
  ).first();

  if (await antragBtn.isVisible({ timeout: 8000 }).catch(() => false)) {
    await antragBtn.click();
    await page.waitForTimeout(1500);
  }
  await snap('03_antrag_typ');

  const pvOption = page.locator(
    '[class*="card"]:has-text("Einspeisung"), [class*="card"]:has-text("PV"), ' +
    'mat-card:has-text("Einspeisung"), button:has-text("PV-Anlage"), ' +
    'li:has-text("Einspeisung")'
  ).first();
  if (await pvOption.isVisible({ timeout: 4000 }).catch(() => false)) {
    await pvOption.click();
    await page.waitForTimeout(1000);
  }
  await snap('04_formular_start');

  // ── 4. Hilfsfunktionen ────────────────────────────────────────────────────

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
      'button:has-text("Weiter"), button:has-text("Nächster"), ' +
      'button[type="submit"]:not(:disabled), a:has-text("Weiter"), ' +
      '[class*="next"]:not([disabled])'
    ).first();
    if (await btn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await btn.click();
      await page.waitForTimeout(1500);
    }
  }

  // ── 5. Standort / Adresse ─────────────────────────────────────────────────
  await fillIfExists('[formcontrolname="street"], input[name="street"], input[placeholder*="Straße" i]', s.strasse);
  await fillIfExists('[formcontrolname="houseNumber"], input[name="houseNumber"], input[placeholder*="Hausnr" i]', s.hausnummer);
  await fillIfExists('[formcontrolname="zipCode"], input[name="zipCode"], input[placeholder*="PLZ" i]', s.plz);
  await fillIfExists('[formcontrolname="city"], input[name="city"], input[placeholder*="Ort" i]', s.ort || '');
  await snap('05_standort');
  await clickWeiter();

  // ── 6. PV-Technische Daten ────────────────────────────────────────────────
  await fillIfExists(
    '[formcontrolname="powerKwp"], input[placeholder*="kWp" i]',
    pv.leistung_kwp || ''
  );
  await fillIfExists(
    '[formcontrolname="manufacturer"], input[placeholder*="Hersteller" i]',
    pv.modul_hersteller || extra?.modul_hersteller || ''
  );
  await fillIfExists(
    '[formcontrolname="commissioningDate"], input[type="date"]',
    pv.inbetriebnahme_datum || extra?.inbetriebnahme_datum || ''
  );

  if (pv.einspeiseart_ten === 'full') {
    await clickIfExists('input[value="Volleinspeisung"], [formcontrolname="feedInType"] input[value*="voll" i]');
  } else {
    await clickIfExists('input[value="Überschusseinspeisung"], [formcontrolname="feedInType"] input[value*="über" i]');
  }

  if (sp) {
    await fillIfExists('[formcontrolname="storageCapacity"], input[placeholder*="Kapazität" i]', sp.kapazitaet_kwh || '');
    await fillIfExists('[formcontrolname="storagePower"]', sp.leistung_kw || '');
  }
  await snap('06_pv_daten');
  await clickWeiter();

  // ── 7. Betreiber / Antragsteller ──────────────────────────────────────────
  await fillIfExists('[formcontrolname="firstName"], input[name="firstName"]', b.vorname || '');
  await fillIfExists('[formcontrolname="lastName"], input[name="lastName"]', b.nachname || '');
  await fillIfExists('[formcontrolname="email"], input[type="email"]', b.email || user);
  await fillIfExists('[formcontrolname="phone"], input[type="tel"]', b.telefon || extra?.telefon || '');
  await snap('07_betreiber');
  await clickWeiter();

  // ── 8. Installateur ───────────────────────────────────────────────────────
  await fillIfExists(
    '[formcontrolname="installerCompany"], input[placeholder*="Firma" i]',
    inst.firma || extra?.installateur_firma || ''
  );
  await fillIfExists('[formcontrolname="installerEmail"]', inst.email || user);
  await fillIfExists('[formcontrolname="installerPhone"]', inst.telefon || b.telefon || '');
  await snap('08_installateur');
  await clickWeiter();

  // ── 9. Zusammenfassung / Entwurf speichern ────────────────────────────────
  await snap('09_zusammenfassung');

  const saveBtn = page.locator(
    'button:has-text("Entwurf"), button:has-text("Speichern"), ' +
    'button:has-text("Zwischenspeichern"), button:has-text("Entwurf speichern")'
  ).first();
  if (await saveBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await saveBtn.click();
    await page.waitForTimeout(1500);
  }
  await snap('10_entwurf_gespeichert');

  return {
    portalUrl: page.url(),
    message: [
      'SW Delitzsch (X4/Keycloak): Antrag als Entwurf gespeichert.',
      'Bitte Dokumente hochladen und manuell einreichen.',
      `Adresse: ${s.strasse} ${s.hausnummer}, ${s.plz} ${s.ort || ''}`.trim(),
      `PV: ${pv.leistung_kwp} kWp`,
      sp ? `Speicher: ${sp.kapazitaet_kwh} kWh` : null,
    ].filter(Boolean).join(' | '),
  };
}

module.exports = { fill };
