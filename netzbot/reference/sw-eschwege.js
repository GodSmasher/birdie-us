/**
 * Stadtwerke Eschwege GmbH — Portal-Filler
 * Portal: https://www.stadtwerke-eschwege.de/swe/strom/netzanschluesse/installateurportal/index.php
 *
 * Plattform: Weblication CMS (PHP)
 *
 * Login-Flow (live inspiziert 2026-05-20):
 *   Cookie-Banner: #cookieNoticeDeclineCloser — MUSS zuerst weggeklickt werden!
 *   Benutzername:  #usernameLogin
 *   Passwort:      #pwdLogin
 *   Submit:        button.buttonSubmit  ← NICHT button[type="submit"] — mehrere vorhanden!
 */

const PORTAL_URL = 'https://www.stadtwerke-eschwege.de/swe/strom/netzanschluesse/installateurportal/index.php';

async function fill({ page, credentials, bundle, extra, snap }) {
  const { user, password } = credentials;
  const s    = bundle.anlagenstandort;
  const pv   = bundle.pv   || {};
  const b    = bundle.betreiber || {};
  const inst = bundle.installateur || {};
  const sp   = bundle.speicher;

  // ── 1. Login ──────────────────────────────────────────────────────────────
  await page.goto(PORTAL_URL, { waitUntil: 'networkidle', timeout: 30000 });

  // Cookie-Banner wegklicken — blockiert alle Klicks wenn sichtbar!
  const cookieDecline = page.locator('#cookieNoticeDeclineCloser');
  if (await cookieDecline.isVisible({ timeout: 4000 }).catch(() => false)) {
    await cookieDecline.click();
    await page.waitForTimeout(800);
  }
  const cookieAccept = page.locator('#cookieNoticeAcceptCloser');
  if (await cookieAccept.isVisible({ timeout: 2000 }).catch(() => false)) {
    await cookieAccept.click();
    await page.waitForTimeout(600);
  }

  await snap('01_login');

  await page.fill('#usernameLogin', user);
  await page.fill('#pwdLogin', password);
  await page.click('button.buttonSubmit');
  await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 25000 });
  await snap('02_nach_login');

  // ── 2. Antrag starten ─────────────────────────────────────────────────────
  const pvLink = page.locator(
    'a:has-text("Einspeiseanlage"), a:has-text("PV-Anlage"), a:has-text("EEG"), ' +
    'a:has-text("neuen Antrag"), button:has-text("Einspeiser"), ' +
    'a:has-text("Anmeldung"), a:has-text("Neuanmeldung")'
  ).first();

  if (await pvLink.isVisible({ timeout: 8000 }).catch(() => false)) {
    await pvLink.click();
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 20000 }).catch(() => page.waitForTimeout(2000));
  }
  await snap('03_antrag_start');

  // ── 3. Hilfsfunktionen ────────────────────────────────────────────────────

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
      'button:has-text("Weiter"), button[type="submit"]:has-text("Weiter"), ' +
      'input[type="submit"][value="Weiter"], a:has-text("Weiter")'
    ).first();
    if (await btn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await btn.click();
      await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 20000 }).catch(() => page.waitForTimeout(2000));
    }
  }

  // ── Betreiberdaten ────────────────────────────────────────────────────────
  await fillField('[name*="vorname"], [name*="firstName"], input[placeholder*="Vorname"]', b.vorname || '');
  await fillField('[name*="nachname"], [name*="lastName"], input[placeholder*="Nachname"]', b.nachname || '');
  await fillField('[name*="strasse"], [name*="street"], input[placeholder*="Straße"]', b.strasse || s.strasse);
  await fillField('[name*="hausnummer"], [name*="houseNumber"], input[placeholder*="Hausnr"]', b.hausnummer || s.hausnummer);
  await fillField('[name*="plz"], [name*="zipCode"], input[placeholder*="PLZ"]', b.plz || s.plz);
  await fillField('[name*="ort"], [name*="city"], input[placeholder*="Ort"]', b.ort || s.ort || '');
  await fillField('[name*="email"], input[type="email"]', b.email || user);
  await fillField('[name*="telefon"], [name*="phone"], input[type="tel"]', b.telefon || extra?.telefon || '');
  await snap('04_betreiber');
  await clickWeiter();

  // ── Standortdaten ─────────────────────────────────────────────────────────
  await fillField('[name*="anlagenStrasse"], [name*="anlage_strasse"]', s.strasse);
  await fillField('[name*="anlagenHausnr"], [name*="anlage_hausnr"]', s.hausnummer);
  await fillField('[name*="anlagenPlz"], [name*="anlage_plz"]', s.plz);
  await fillField('[name*="anlagenOrt"], [name*="anlage_ort"]', s.ort || '');
  await snap('05_standort');
  await clickWeiter();

  // ── PV-Technische Daten ───────────────────────────────────────────────────
  await fillField('[name*="leistung"], [name*="power"], input[placeholder*="kWp"], [name*="pvLeistung"]',
    pv.leistung_kwp || '');
  await fillField('[name*="modulHersteller"], [name*="manufacturer"]',
    pv.modul_hersteller || extra?.modul_hersteller || '');
  await fillField('[name*="modulTyp"], [name*="moduleType"]',
    pv.modul_typ || extra?.modul_typ || '');
  await fillField('[name*="modulAnzahl"], [name*="moduleCount"]',
    pv.modul_anzahl || extra?.modul_anzahl || '');
  await fillField('[name*="wrHersteller"], [name*="inverterManufacturer"]',
    pv.wr_hersteller || extra?.wr_hersteller || '');
  await fillField('[name*="wrTyp"], [name*="inverterType"]',
    pv.wr_typ || extra?.wr_typ || '');
  await fillField('[name*="inbetriebnahme"], input[placeholder*="Inbetriebnahme"], input[type="date"]',
    pv.inbetriebnahme_datum || extra?.inbetriebnahme_datum || '');

  if (sp) {
    await fillField('[name*="speicherKapazitaet"], [name*="storageCapacity"]', sp.kapazitaet_kwh || '');
    await fillField('[name*="speicherLeistung"], [name*="storagePower"]', sp.leistung_kw || '');
  }
  await snap('06_pv_daten');
  await clickWeiter();

  // ── Installateurdaten ─────────────────────────────────────────────────────
  await fillField('[name*="installateurFirma"], [name*="installerCompany"]',
    inst.firma || extra?.installateur_firma || '');
  await fillField('[name*="installateurVorname"], [name*="installerFirstName"]', inst.vorname || '');
  await fillField('[name*="installateurNachname"], [name*="installerLastName"]', inst.nachname || '');
  await fillField('[name*="installateurEmail"], [name*="installerEmail"]', inst.email || user);
  await fillField('[name*="installateurTelefon"], [name*="installerPhone"]',
    inst.telefon || b.telefon || '');
  await snap('07_installateur');
  await clickWeiter();

  // ── Zusammenfassung / Speichern ───────────────────────────────────────────
  await snap('08_zusammenfassung');

  const saveBtn = page.locator(
    'button:has-text("Speichern"), button:has-text("Zwischenspeichern"), ' +
    'input[value*="Speichern"], button:has-text("Entwurf")'
  ).first();
  if (await saveBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await saveBtn.click();
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 20000 }).catch(() => page.waitForTimeout(2000));
  }
  await snap('09_gespeichert');

  return {
    portalUrl: page.url(),
    message: [
      'SW Eschwege: Antrag als Entwurf gespeichert.',
      'Bitte Dokumente hochladen und manuell einreichen.',
      `Adresse: ${s.strasse} ${s.hausnummer}, ${s.plz} ${s.ort || ''}`.trim(),
      `PV: ${pv.leistung_kwp} kWp`,
      sp ? `Speicher: ${sp.kapazitaet_kwh} kWh` : null,
    ].filter(Boolean).join(' | '),
  };
}

module.exports = { fill };
