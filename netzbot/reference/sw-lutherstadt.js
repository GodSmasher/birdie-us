/**
 * Stadtwerke Lutherstadt Wittenberg — Portal-Filler
 * Portal: https://netzportal.stadtwerke-wittenberg.de/kundenportal
 *
 * Plattform: Custom React SPA — AJAX-Login (URL ändert sich NICHT!)
 *   Login-IDs (live inspiziert 2026-05-20):
 *     #login-username  (type="text")
 *     #login-password  (type="password")
 *     #login-submit
 *
 * ACHTUNG: KEIN waitForNavigation nach Login-Click!
 *   SPA navigiert intern per XHR/fetch → waitForNavigation würde timeouten.
 *   → Stattdessen waitForTimeout(3000) + auf Dashboard-Element warten.
 */

const PORTAL_URL = 'https://netzportal.stadtwerke-wittenberg.de/kundenportal';

async function fill({ page, credentials, bundle, extra, snap }) {
  const { user, password } = credentials;
  const s    = bundle.anlagenstandort;
  const pv   = bundle.pv   || {};
  const b    = bundle.betreiber || {};
  const inst = bundle.installateur || {};
  const sp   = bundle.speicher;

  // ── 1. Portal öffnen ──────────────────────────────────────────────────────
  await page.goto(PORTAL_URL, { waitUntil: 'networkidle', timeout: 30000 });
  await snap('01_login');

  // ── 2. AJAX-Login (kein waitForNavigation!) ───────────────────────────────
  const usernameField = page.locator('#login-username');
  await usernameField.waitFor({ timeout: 12000 });
  await usernameField.fill(user);
  await page.locator('#login-password').fill(password);
  await page.locator('#login-submit').click();

  // SPA navigiert intern — waitForNavigation würde timeouten!
  await page.waitForTimeout(3000);
  await page.waitForSelector(
    '[class*="dashboard"], [class*="Dashboard"], [class*="antrag"], h1, nav',
    { timeout: 15000 }
  ).catch(() => {});
  await snap('02_nach_login');

  // ── 3. Neuen Einspeise-Antrag starten ─────────────────────────────────────
  const antragBtn = page.locator(
    'a:has-text("Einspeiseanlage"), a:has-text("Einspeisung"), ' +
    'button:has-text("Einspeisung"), a:has-text("Neuen Antrag"), ' +
    'button:has-text("Neuen Antrag"), a:has-text("PV-Anlage"), ' +
    'button:has-text("Anmelden"), a:has-text("Anmeldung")'
  ).first();

  if (await antragBtn.isVisible({ timeout: 6000 }).catch(() => false)) {
    await antragBtn.click();
    await page.waitForTimeout(2000);
  }
  await snap('03_antrag_start');

  // ── 4. Hilfsfunktionen ────────────────────────────────────────────────────

  async function fillField(selectors, value) {
    if (!value && value !== 0) return;
    for (const sel of Array.isArray(selectors) ? selectors : [selectors]) {
      const el = page.locator(sel).first();
      if (await el.isVisible({ timeout: 1500 }).catch(() => false)) {
        await el.fill(String(value));
        return;
      }
    }
  }

  async function clickWeiter() {
    const btn = page.locator(
      'button:has-text("Weiter"), button:has-text("Nächste"), ' +
      'button[type="submit"]:has-text("Weiter"), input[type="submit"][value="Weiter"], ' +
      'a:has-text("Weiter"), [class*="next"]:not(:disabled)'
    ).first();
    if (await btn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await btn.click();
      await page.waitForTimeout(1500);
    }
  }

  // ── 5. Betreiber-/Kontaktdaten ────────────────────────────────────────────
  await fillField('input[name*="vorname" i], input[name*="firstname" i], input[placeholder*="Vorname" i]',
    b.vorname || '');
  await fillField('input[name*="nachname" i], input[name*="lastname" i], input[placeholder*="Nachname" i]',
    b.nachname || '');
  await fillField('input[name*="strasse" i], input[name*="street" i], input[placeholder*="Straße" i]',
    b.strasse || s.strasse);
  await fillField('input[name*="hausnummer" i], input[name*="housenumber" i], input[placeholder*="Hausnr" i]',
    b.hausnummer || s.hausnummer);
  await fillField('input[name*="plz" i], input[name*="zipcode" i], input[placeholder*="PLZ" i]',
    b.plz || s.plz);
  await fillField('input[name*="ort" i], input[name*="city" i], input[placeholder*="Ort" i]',
    b.ort || s.ort || '');
  await fillField('input[type="email"], input[name*="email" i]', b.email || user);
  await fillField('input[type="tel"], input[name*="telefon" i], input[name*="phone" i]',
    b.telefon || extra?.telefon || '');
  await snap('04_betreiber');
  await clickWeiter();

  // ── 6. Anlagenstandort ────────────────────────────────────────────────────
  await fillField('input[name*="anlage.*strasse" i], input[name*="anlagen.*street" i]', s.strasse);
  await fillField('input[name*="anlage.*hausnr" i], input[name*="anlagen.*house" i]', s.hausnummer);
  await fillField('input[name*="anlage.*plz" i], input[name*="anlagen.*zip" i]', s.plz);
  await fillField('input[name*="anlage.*ort" i], input[name*="anlagen.*city" i]', s.ort || '');
  await snap('05_standort');
  await clickWeiter();

  // ── 7. PV-Technische Daten ────────────────────────────────────────────────
  await fillField('input[name*="leistung" i], input[name*="kwp" i], input[placeholder*="kWp" i]',
    pv.leistung_kwp || '');
  await fillField('input[name*="hersteller" i], input[name*="manufacturer" i]',
    pv.modul_hersteller || extra?.modul_hersteller || '');
  await fillField('input[name*="modultyp" i], input[name*="moduletype" i]',
    pv.modul_typ || extra?.modul_typ || '');
  await fillField('input[name*="anzahl" i], input[name*="count" i]',
    pv.modul_anzahl || extra?.modul_anzahl || '');
  await fillField('input[name*="inbetrieb" i], input[type="date"], input[placeholder*="Datum" i]',
    pv.inbetriebnahme_datum || extra?.inbetriebnahme_datum || '');

  if (sp) {
    await fillField('input[name*="speicher.*kapazit" i], input[name*="storage.*kWh" i]',
      sp.kapazitaet_kwh || '');
    await fillField('input[name*="speicher.*leistung" i], input[name*="storage.*power" i]',
      sp.leistung_kw || '');
  }
  await snap('06_pv_daten');
  await clickWeiter();

  // ── 8. Installateurdaten ──────────────────────────────────────────────────
  await fillField('input[name*="installateur.*firma" i], input[name*="installer.*company" i]',
    inst.firma || extra?.installateur_firma || '');
  await fillField('input[name*="installateur.*email" i], input[name*="installer.*email" i]',
    inst.email || user);
  await fillField('input[name*="installateur.*telefon" i], input[name*="installer.*phone" i]',
    inst.telefon || b.telefon || '');
  await snap('07_installateur');
  await clickWeiter();

  // ── 9. Zusammenfassung / Entwurf speichern ────────────────────────────────
  await snap('08_zusammenfassung');

  const saveBtn = page.locator(
    'button:has-text("Speichern"), button:has-text("Zwischenspeichern"), ' +
    'button:has-text("Entwurf"), input[value*="Speichern" i]'
  ).first();
  if (await saveBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await saveBtn.click();
    await page.waitForTimeout(2000);
  }
  await snap('09_gespeichert');

  return {
    portalUrl: page.url(),
    message: [
      'SW Lutherstadt: Antrag als Entwurf gespeichert.',
      'Bitte Dokumente hochladen und manuell einreichen.',
      `Adresse: ${s.strasse} ${s.hausnummer}, ${s.plz} ${s.ort || ''}`.trim(),
      `PV: ${pv.leistung_kwp} kWp`,
      sp ? `Speicher: ${sp.kapazitaet_kwh} kWh` : null,
    ].filter(Boolean).join(' | '),
  };
}

module.exports = { fill };
