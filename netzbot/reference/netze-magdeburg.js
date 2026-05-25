/**
 * Netze Magdeburg (Städtische Werke Magdeburg) — Portal-Filler
 * Portal: https://onlinecenter.sw-magdeburg.de/sap/bc/ui5_ui5/sap/zui5umc/index.html
 *
 * Plattform: SAP UI5 — Title: "Installateur-Portal"
 *
 * Login (live inspiziert 2026-05-20):
 *   input[placeholder="Benutzername"]  — SAP-Benutzernummer (z.B. "233834"), KEIN E-Mail!
 *   input[placeholder="Passwort"]
 *   button[type="submit"].first()      — kein Text, nur Icon
 *   Nach Login: SAP UI5 navigiert intern (#/projects), kein full-page reload
 *
 * Erstlogin: Passwort-Änderungsformular!
 *   → extra.new_password oder PORTAL_NEW_PASS_MAGDEBURG in .env setzen
 *
 * SAP UI5: ui5-input, ui5-button, ui5-select — braucht evaluate()-Fallback
 */

const PORTAL_URL = 'https://onlinecenter.sw-magdeburg.de/sap/bc/ui5_ui5/sap/zui5umc/index.html?CompanyID=SWM_IP&sap-client=002&sap-language=DE#/projects';

async function fill({ page, credentials, bundle, extra, snap }) {
  const { user, password } = credentials;
  const s    = bundle.anlagenstandort;
  const pv   = bundle.pv   || {};
  const b    = bundle.betreiber || {};
  const inst = bundle.installateur || {};
  const sp   = bundle.speicher;

  // ── 1. Portal öffnen ──────────────────────────────────────────────────────
  await page.goto(PORTAL_URL, { waitUntil: 'networkidle', timeout: 30000 });
  await snap('01_sap_login');

  // ── 2. Login (placeholder-Selektoren stabil — SAP-IDs wie __input0-inner INSTABIL!) ──
  const userField = page.locator('input[placeholder="Benutzername"]');
  await userField.waitFor({ timeout: 15000 });
  await userField.fill(user);
  await page.locator('input[placeholder="Passwort"]').fill(password);
  await page.locator('button[type="submit"]').first().click();
  await page.waitForTimeout(3000);
  await snap('02_nach_login_klick');

  // ── 3. Passwort-Änderung abfangen (Erstlogin) ─────────────────────────────
  const pwChangeField = page.locator('#INITIAL_PASSWORD_FIELD, input[id*="INITIAL_PASSWORD"]');
  if (await pwChangeField.isVisible({ timeout: 4000 }).catch(() => false)) {
    await snap('02b_passwort_aenderung');
    const newPw = extra?.new_password || process.env.PORTAL_NEW_PASS_MAGDEBURG || '';
    if (newPw) {
      await page.locator('#INITIAL_PASSWORD_FIELD, input[id*="INITIAL_PASSWORD"]').fill(password);
      await page.locator('#NEW_PASSWORD_FIELD, input[id*="NEW_PASSWORD"]').fill(newPw);
      await page.locator('#CONFIRM_PASSWORD_FIELD, input[id*="CONFIRM_PASSWORD"]').fill(newPw);
      await page.locator('button[type="submit"], button:has-text("OK")').first().click();
      await page.waitForTimeout(3000);
    } else {
      return {
        portalUrl: page.url(),
        message: 'Netze Magdeburg: Passwort-Änderung erforderlich! extra.new_password oder PORTAL_NEW_PASS_MAGDEBURG setzen.',
      };
    }
  }
  await snap('03_nach_login');

  await page.waitForSelector('ui5-button, [class*="sapMBtn"], h1', { timeout: 15000 }).catch(() => {});
  await snap('04_projekte_uebersicht');

  // ── 4. Neuen Antrag anlegen ───────────────────────────────────────────────
  const neuerAntragBtn = page.locator(
    'ui5-button:has-text("Neuen Antrag"), ui5-button:has-text("Neu"), ' +
    'button:has-text("Neuen Antrag"), [class*="sapMBtn"]:has-text("Neu")'
  ).first();

  if (await neuerAntragBtn.isVisible({ timeout: 8000 }).catch(() => false)) {
    await neuerAntragBtn.click();
    await page.waitForTimeout(2000);
  }
  await snap('05_neuer_antrag');

  const pvOption = page.locator(
    'ui5-li:has-text("PV"), ui5-li:has-text("Einspeisung"), ' +
    '[class*="sapMSLI"]:has-text("PV")'
  ).first();
  if (await pvOption.isVisible({ timeout: 4000 }).catch(() => false)) {
    await pvOption.click();
    await page.waitForTimeout(1000);
  }
  await snap('06_antrag_typ');

  // ── 5. SAP UI5 Hilfsfunktionen ────────────────────────────────────────────

  async function fillIfExists(sel, value) {
    if (!value && value !== 0) return;
    const el = page.locator(sel).first();
    if (await el.isVisible({ timeout: 1500 }).catch(() => false)) {
      try {
        await el.fill(String(value));
      } catch {
        await el.evaluate((node, v) => {
          node.value = v;
          node.dispatchEvent(new Event('input', { bubbles: true }));
          node.dispatchEvent(new Event('change', { bubbles: true }));
        }, String(value));
      }
    }
  }

  async function clickWeiter() {
    const btn = page.locator(
      'ui5-button:has-text("Weiter"), button:has-text("Weiter"), ' +
      '[class*="sapMBtn"]:has-text("Weiter"), ui5-button:has-text("Nächste")'
    ).first();
    if (await btn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await btn.click();
      await page.waitForTimeout(1500);
    }
  }

  // ── 6. Anlagen-Standort ───────────────────────────────────────────────────
  await fillIfExists('ui5-input[placeholder*="Straße" i], input[placeholder*="Straße" i]', s.strasse);
  await fillIfExists('ui5-input[placeholder*="Hausnr" i], input[placeholder*="Hausnr" i]', s.hausnummer);
  await fillIfExists('ui5-input[placeholder*="PLZ" i], input[placeholder*="PLZ" i]', s.plz);
  await fillIfExists('ui5-input[placeholder*="Ort" i], input[placeholder*="Ort" i]', s.ort || '');
  await snap('07_standort');
  await clickWeiter();

  // ── 7. Technische Daten (PV) ──────────────────────────────────────────────
  await fillIfExists('ui5-input[placeholder*="kWp" i], input[placeholder*="kWp" i]', pv.leistung_kwp || '');
  await fillIfExists('ui5-input[placeholder*="Hersteller" i], input[placeholder*="Hersteller" i]',
    pv.modul_hersteller || extra?.modul_hersteller || '');
  await fillIfExists('ui5-input[placeholder*="Inbetrieb" i], input[type="date"]',
    pv.inbetriebnahme_datum || extra?.inbetriebnahme_datum || '');

  if (sp) {
    await fillIfExists('ui5-input[placeholder*="Kapazität" i]', sp.kapazitaet_kwh || '');
  }
  await snap('08_pv_daten');
  await clickWeiter();

  // ── 8. Betreiber ──────────────────────────────────────────────────────────
  await fillIfExists('ui5-input[placeholder*="Vorname" i]', b.vorname || '');
  await fillIfExists('ui5-input[placeholder*="Nachname" i]', b.nachname || '');
  await fillIfExists('ui5-input[placeholder*="E-Mail" i], input[type="email"]', b.email || user);
  await fillIfExists('ui5-input[placeholder*="Telefon" i], input[type="tel"]', b.telefon || extra?.telefon || '');
  await snap('09_betreiber');
  await clickWeiter();

  // ── 9. Installateur ───────────────────────────────────────────────────────
  await fillIfExists('ui5-input[placeholder*="Firma" i]', inst.firma || extra?.installateur_firma || '');
  await fillIfExists('ui5-input[placeholder*="Installateur.*E-Mail" i]', inst.email || user);
  await snap('10_installateur');
  await clickWeiter();

  // ── 10. Zusammenfassung / Entwurf speichern ───────────────────────────────
  await snap('11_zusammenfassung');

  const saveBtn = page.locator(
    'ui5-button:has-text("Speichern"), ui5-button:has-text("Entwurf"), ' +
    'button:has-text("Speichern"), [class*="sapMBtn"]:has-text("Speichern")'
  ).first();
  if (await saveBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await saveBtn.click();
    await page.waitForTimeout(2000);
  }
  await snap('12_entwurf_gespeichert');

  return {
    portalUrl: page.url(),
    message: [
      'Netze Magdeburg (SAP UI5): Antrag als Entwurf gespeichert.',
      'Bitte Dokumente hochladen und manuell einreichen.',
      `Adresse: ${s.strasse} ${s.hausnummer}, ${s.plz} ${s.ort || ''}`.trim(),
      `PV: ${pv.leistung_kwp} kWp`,
      sp ? `Speicher: ${sp.kapazitaet_kwh} kWh` : null,
    ].filter(Boolean).join(' | '),
  };
}

module.exports = { fill };
