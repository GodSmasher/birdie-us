/**
 * Werra Energie GmbH / EVB Netze — Portal-Filler
 * Portal: https://portal.evb-netze.de/
 *
 * Plattform: EVB Netze Netzanschlussportal (CMS, ASP.NET WebForms-ähnlich)
 *   Formular-URL: /eisenachGips/Gips (POST, multi-page)
 *
 * Login (live inspiziert 2026-05-20):
 *   E-Mail:   #Container_Children_3_Container_Children_0_Container_Children_2_Login_LoginName
 *   Passwort: #Container_Children_3_Container_Children_0_Container_Children_2_Login_Password
 *   Submit:   input[value="Jetzt einloggen"]
 *   Cookie:   "Nur notwendige Cookies zulassen" Button
 *
 * Alle Formularfelder haben STABILE semantische IDs (Formular_SOLAR*, Formular_ADRESSE_* etc.)
 */

const PORTAL_URL = 'https://portal.evb-netze.de/';

const SEL_USER = '#Container_Children_3_Container_Children_0_Container_Children_2_Login_LoginName';
const SEL_PASS = '#Container_Children_3_Container_Children_0_Container_Children_2_Login_Password';

async function fillId(page, id, value) {
  if (!value && value !== 0) return;
  const el = page.locator(`#${id}`).first();
  if (await el.isVisible({ timeout: 2000 }).catch(() => false)) await el.fill(String(value));
}

async function selectId(page, id, value) {
  if (!value) return;
  const el = page.locator(`#${id}`).first();
  if (await el.isVisible({ timeout: 2000 }).catch(() => false)) {
    await el.selectOption(String(value)).catch(() => {});
  }
}

async function clickId(page, id) {
  const el = page.locator(`#${id}`).first();
  if (await el.isVisible({ timeout: 2000 }).catch(() => false)) await el.click();
}

async function clickWeiter(page) {
  const btn = page.locator('input[name="SeiteWechseln"], input[type="submit"][value="Weiter"]').first();
  await btn.waitFor({ timeout: 8000 });
  await btn.click();
  await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(800);
}

async function clickSpeichern(page) {
  const btn = page.locator('input[value*="Speichern"], button:has-text("Speichern")').first();
  if (await btn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await btn.click();
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 20000 }).catch(() => {});
    await page.waitForTimeout(800);
  }
}

async function fill({ page, credentials, bundle, extra, snap }) {
  const { user, password } = credentials;
  const s    = bundle.anlagenstandort;
  const pv   = bundle.pv   || {};
  const b    = bundle.betreiber || {};
  const inst = bundle.installateur || {};
  const sp   = bundle.speicher;

  // ── 1. Login ──────────────────────────────────────────────────────────────
  await page.goto(PORTAL_URL, { waitUntil: 'networkidle', timeout: 30000 });
  await snap('01_evb_start');

  const cookieBtn = page.locator('button:has-text("Nur notwendige Cookies zulassen")').first();
  if (await cookieBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
    await cookieBtn.click();
    await page.waitForTimeout(600);
  }

  await page.waitForSelector(SEL_USER, { timeout: 10000 });
  await page.fill(SEL_USER, user);
  await page.fill(SEL_PASS, password);
  await page.click('input[value="Jetzt einloggen"], input[type="submit"]');
  await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 25000 });
  await snap('02_nach_login');

  // ── 2. Formular starten ───────────────────────────────────────────────────
  const startBtn = page.locator('a:has-text("Mit dem Ausfüllen beginnen"), a:has-text("Ausfüllen beginnen")').first();
  await startBtn.waitFor({ timeout: 10000 });
  await startBtn.click();
  await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(1000);
  await snap('03_kontaktdaten');

  // ── Seite 1: Kontaktdaten ─────────────────────────────────────────────────
  await fillId(page, 'Formular_ANSCHLUSSNEHMER_VORNAME',  b.vorname  || '');
  await fillId(page, 'Formular_ANSCHLUSSNEHMER_NACHNAME', b.nachname || '');
  await fillId(page, 'Formular_ADRESSE_STRASSE',          b.strasse  || s.strasse);
  await fillId(page, 'Formular_ADRESSE_HAUSNR',           b.hausnummer || s.hausnummer);
  await fillId(page, 'Formular_ADRESSE_PLZ',              b.plz      || s.plz);
  await fillId(page, 'Formular_ADRESSE_ORT',              b.ort      || s.ort || '');
  await fillId(page, 'Formular_KONTAKT_TELEFON',          b.telefon  || extra?.telefon || '0391 1234567');
  await fillId(page, 'Formular_KONTAKT_EMAIL',            b.email    || user);

  await clickId(page, 'Formular_STRASSENVERZEICHNIS_Ja');
  await clickId(page, 'Formular_ABWEICHENDEDATENANSCHLUSSNUTZER_Nein');
  await clickId(page, 'Formular_ABWEICHENDEDATENANLAGENSTANDORT_Nein');
  await clickId(page, 'Formular_ABWEICHENDEDATENGRUNDSTUECKSEIGENTUEMER_Nein');
  await clickId(page, 'Formular_ABWEICHENDEDATENRECHNUNGSEMPFAENGER_Nein');

  await snap('04_kontaktdaten_fertig');
  await clickWeiter(page);

  // ── Seite 2: Anschlussoptionen ────────────────────────────────────────────
  await snap('05_anschlussoptionen');
  await clickId(page, 'Formular_PHOTOVOLTAIKSOLAR_Ja');
  if (sp) await clickId(page, 'Formular_SPEICHER_Ja');
  await snap('06_anschlussoptionen_fertig');
  await clickWeiter(page);

  // ── Seite 3: Photovoltaik/Solar ───────────────────────────────────────────
  await snap('07_pv_daten');

  if (extra?.zaehlernummer) await fillId(page, 'Formular_SOLARZAEHLERNUMMER', extra.zaehlernummer);

  const modulHersteller = pv.modul_hersteller || extra?.modul_hersteller || '';
  const modulTyp        = pv.modul_typ        || extra?.modul_typ        || '';
  await fillId(page, 'Formular_SOLARMODULHERSTELLERTYP',
    modulHersteller && modulTyp ? `${modulHersteller} ${modulTyp}` : (modulHersteller || modulTyp || ''));
  await fillId(page, 'Formular_SOLARMODULLEISTUNG',  String(pv.modul_leistung_wp || extra?.modul_leistung_wp || ''));
  await fillId(page, 'Formular_SOLARMODULZAHL',      String(pv.modul_anzahl || extra?.modul_anzahl || ''));

  const wrHersteller = pv.wr_hersteller || extra?.wr_hersteller || '';
  const wrTyp        = pv.wr_typ        || extra?.wr_typ        || '';
  await fillId(page, 'Formular_SOLARWECHSELRICHTERHERSTELLERTYP',
    wrHersteller && wrTyp ? `${wrHersteller} ${wrTyp}` : (wrHersteller || wrTyp || ''));
  await fillId(page, 'Formular_SOLARWECHSELRICHTERLEISTUNGPAMAX', String(pv.pa_max_kw  || pv.leistung_kwp || ''));
  await fillId(page, 'Formular_SOLARWECHSELRICHTERANZAHL',        String(pv.wr_anzahl  || extra?.wr_anzahl || 1));
  await fillId(page, 'Formular_SOLARWECHSELRICHTERSCHEINLEISTUNGSAMAX', String(pv.sa_max_kva || pv.leistung_kwp || ''));
  await fillId(page, 'Formular_SOLARSUMMEDERMAXIMALENSCHEINLEISTUNGEN', String(pv.sa_max_kva || pv.leistung_kwp || ''));

  const netzein = pv.netzeinspeisung_evb || (parseFloat(pv.leistung_kwp) <= 4.6 ? 'L1' : 'Drehstrom');
  await selectId(page, 'Formular_SOLARNETZEINSPEISUNG', netzein);
  await selectId(page, 'Formular_SOLARNA-SCHUTZ', pv.na_schutz_evb || 'Integriert im Wechselrichter');
  await selectId(page, 'Formular_SOLARGEWUENSCHTEVERAEUSSERUNGSFORMDEREIN',
    pv.verauesserungsform || 'Einspeisevergütung nach § 21 Abs. 1 EEG');

  const datum = pv.inbetriebnahme_datum || extra?.inbetriebnahme_datum || '';
  if (datum) await fillId(page, '_Formular_SOLARDATUMINBETRIEBNAHME', datum);

  const messkonzept = pv.messkonzept_evb || 'Überschusseinspeisung';
  await clickId(page, `Formular_SOLARMESSKONZEPT_${messkonzept}`);

  await snap('08_pv_daten_fertig');
  await clickSpeichern(page);

  // Wenn Speichern nicht die letzte Seite war → Weiter zu Installateur
  const currentTitle = await page.title();
  if (!currentTitle.includes('Weitere Angaben') && !currentTitle.includes('gespeichert')) {
    await clickWeiter(page);
    await snap('09_installateur');

    await fillId(page, 'Formular_STROMINSTALLATEURANSPRECHPARTNER_INSTALLATEURFIRMA',
      inst.firma || extra?.installateur_firma || '');
    await fillId(page, 'Formular_STROMINSTALLATEURANSPRECHPARTNER_VORNAME',  inst.vorname || '');
    await fillId(page, 'Formular_STROMINSTALLATEURANSPRECHPARTNER_NACHNAME', inst.nachname || '');
    await fillId(page, 'Formular_STROMINSTALLATEURSNUMMER',  inst.ausweis_nr || extra?.installateur_ausweis || '');
    await fillId(page, 'Formular_STROMINSTALLATEUREINGETRAGENBEIFOLGENDEM', inst.netzbetreiber || 'EVB Netze');
    await fillId(page, 'Formular_STROMINSTALLATEURKONTAKT_TELEFON', inst.telefon || b.telefon || extra?.telefon || '');
    await fillId(page, 'Formular_STROMINSTALLATEURKONTAKT_EMAIL',   inst.email || user);
    await fillId(page, 'Formular_STROMINSTALLATEURADRESSE_STRASSE',  inst.strasse  || '');
    await fillId(page, 'Formular_STROMINSTALLATEURADRESSE_HAUSNR',   inst.hausnummer || '');
    await fillId(page, 'Formular_STROMINSTALLATEURADRESSE_PLZ',      inst.plz || '');
    await fillId(page, 'Formular_STROMINSTALLATEURADRESSE_ORT',      inst.ort || '');

    await clickId(page, 'Formular_DATENSCHUTZERKLAERUNG_Ja,akzeptiert_');
    await clickId(page, 'Formular_WIDERRUFSERKLAERUNG_Ja,akzeptiert_');
    await snap('10_installateur_fertig');

    await clickSpeichern(page);
  }

  await snap('11_entwurf_gespeichert');

  return {
    portalUrl: page.url(),
    message: [
      'Werra Energie (EVB Netze): Antrag als Entwurf gespeichert.',
      'Bitte Dokumente hochladen und Formular manuell einreichen.',
      `Adresse: ${s.strasse} ${s.hausnummer}, ${s.plz} ${s.ort || ''}`.trim(),
      `PV: ${pv.leistung_kwp} kWp`,
      sp ? `Speicher: ${sp.kapazitaet_kwh} kWh` : null,
    ].filter(Boolean).join(' | '),
  };
}

module.exports = { fill };
