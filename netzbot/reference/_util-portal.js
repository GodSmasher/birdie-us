/**
 * _util-portal.js — Gemeinsamer Filler für util.portal (MudBlazor / Blazor Server)
 *
 * Portale:
 *   ZEV Zwickau  → netzportal.zev-energie.de
 *   SW Meerane   → netzanschlussportal.sw-meerane.de
 *
 * Plattform: util.portal (ASP.NET + MudBlazor Blazor Server)
 *   - Alle Input-IDs sind RANDOM → NIE ID-Selektoren!
 *   - MudBlazor Dropdowns: hidden <input> + div.mud-select als Trigger
 *   - Text-Inputs: per getByLabel() auffindbar
 *   - Cookie-Banner: "Akzeptieren"-Button (NICHT "Ablehnen" = <a>-Link zur Homepage!)
 *
 * Pflichtfelder:
 *   betreiber.geburtsdatum ('dd.MM.yyyy') — PFLICHTFELD!
 *   installateur.ausweis_nr — Pflichtfeld
 *
 * bundle.pv-Felder (util.portal-spezifisch):
 *   pv.wr_hersteller, pv.wr_typ, pv.wr_anzahl
 *   pv.modul_leistung_wp, pv.modul_anzahl
 *   pv.pa_max_kw, pv.sa_max_kva
 *   pv.netzeinspeisung   ('1-phasig'|'3-phasig'|'Drehstrom')
 *   pv.einspeiseart_util ('ueberschuss'|'voll')
 *   pv.begrenzung_60_prozent (boolean) — auto: ≤30 kWp → Ja
 *   pv.inbetriebnahme_datum ('dd.MM.yyyy')
 */

async function selectMudOption(page, labelText, optionText) {
  if (!optionText) return;

  const mudSelect = page
    .locator(`.mud-select:has(label:text-is("${labelText}"))`)
    .first();

  if (!(await mudSelect.isVisible({ timeout: 4000 }).catch(() => false))) return;

  await mudSelect.scrollIntoViewIfNeeded().catch(() => {});
  await mudSelect.click();
  await page.waitForTimeout(500);

  const option = page
    .locator('.mud-popover-open .mud-list-item')
    .filter({ hasText: optionText })
    .first();

  await option.waitFor({ timeout: 6000 });
  await option.click();
  await page.waitForTimeout(400);
}

async function fillLabel(page, labelText, value) {
  if (!value && value !== 0) return;
  const el = page.getByLabel(labelText, { exact: true }).first();
  if (await el.isVisible({ timeout: 2000 }).catch(() => false)) {
    await el.fill(String(value));
  }
}

async function loginUtilPortal(page, user, password) {
  // "Akzeptieren" klicken — NICHT "Ablehnen" (das ist ein Link zur Startseite!)
  const accept = page
    .locator('button:has-text("Akzeptieren"), button:has-text("Alle akzeptieren")')
    .first();
  if (await accept.isVisible({ timeout: 4000 }).catch(() => false)) {
    await accept.click();
    await page.waitForTimeout(700);
  }

  await page.waitForSelector('input[type="email"]', { timeout: 12000 });

  // Blazor braucht echte Tastatureingabe (kein fill()) für korrekte Datenbindung
  await page.click('input[type="email"]');
  await page.type('input[type="email"]', user, { delay: 60 });
  await page.click('input[type="password"]');
  await page.type('input[type="password"]', password, { delay: 60 });
  await page.keyboard.press('Return');

  await page.waitForURL(/\/(?!Account\/Login)/, { timeout: 25000 }).catch(async () => {
    await page.click('button[type="submit"], input[type="submit"]').catch(() => {});
    await page.waitForTimeout(3000);
  });
}

async function createNetzanschlussVorgang(page, portalUrl) {
  await page.goto(`${portalUrl}/processes`, { waitUntil: 'networkidle', timeout: 25000 });
  await page.waitForTimeout(1000);

  const addBtn = page
    .locator('button:has-text("Hinzufügen"), button:has-text("HINZUFÜGEN")')
    .first();
  await addBtn.waitFor({ timeout: 10000 });
  await addBtn.click();
  await page.waitForTimeout(1000);

  await selectMudOption(page, 'Sparte*', 'Strom');
  await selectMudOption(page, 'Typ*', 'Neuanschluss');
  await selectMudOption(page, 'Formular*', 'Netzanschluss');

  const startBtn = page
    .locator('button:has-text("Jetzt beantragen"), button:has-text("JETZT BEANTRAGEN")')
    .first();
  await startBtn.waitFor({ timeout: 8000 });
  await startBtn.click();

  await page.waitForURL(/\/processes\/instance/, { timeout: 20000 });
  await page.waitForTimeout(1500);
}

async function fillAntragsteller(page, bundle, extra) {
  const b = bundle.betreiber || {};
  const s = bundle.anlagenstandort;

  await fillLabel(page, 'Name*',      b.nachname || '');
  await fillLabel(page, 'Vorname*',   b.vorname  || '');

  const geb = b.geburtsdatum || extra?.geburtsdatum || '';
  if (geb) await fillLabel(page, 'Geburtsdatum*', geb);

  await fillLabel(page, 'Strasse*',    b.strasse    || s.strasse);
  await fillLabel(page, 'Hausnummer*', b.hausnummer || s.hausnummer);
  await fillLabel(page, 'PLZ*',        b.plz        || s.plz);
  await fillLabel(page, 'Ort*',        b.ort        || s.ort || '');

  if (b.telefon) await fillLabel(page, 'Telefon', b.telefon);
  if (b.email)   await fillLabel(page, 'E-Mail',  b.email);
}

async function fillAnlagenstandort(page, bundle) {
  const s = bundle.anlagenstandort;

  const strasseAll = page.getByLabel('Strasse*',    { exact: true });
  const hnrAll     = page.getByLabel('Hausnummer*', { exact: true });
  const plzAll     = page.getByLabel('PLZ*',        { exact: true });
  const ortAll     = page.getByLabel('Ort*',        { exact: true });

  const strasseCount = await strasseAll.count();
  if (strasseCount >= 2) {
    await strasseAll.nth(1).fill(String(s.strasse));
    await hnrAll.nth(1).fill(String(s.hausnummer));
    await plzAll.nth(1).fill(String(s.plz));
    await ortAll.nth(1).fill(String(s.ort || ''));
  }
  if (s.ortsteil) await fillLabel(page, 'Ortsteil', s.ortsteil);
}

async function fillNetzanschluss(page, extra) {
  const felder = [
    ['Anzahl Wohnungen teilelektrisch*', extra?.wohnungen_teilelektrisch ?? 0],
    ['Anzahl Wohnungen vollelektrisch*', extra?.wohnungen_vollelektrisch ?? 0],
    ['Leistung Gewerbe in kVA*',         extra?.leistung_gewerbe_kva    ?? 0],
    ['Leistung Gemeinschaftsanlage in kVA*', extra?.leistung_gemeinschaft_kva ?? 0],
  ];

  for (const [lbl, val] of felder) {
    const el = page.getByLabel(lbl, { exact: true }).first();
    if (await el.isVisible({ timeout: 2000 }).catch(() => false)) {
      const current = await el.inputValue();
      if (!current || current === '') await el.fill(String(val));
    }
  }
}

async function addPVAnlage(page, bundle, extra) {
  const pv   = bundle.pv   || {};
  const inst = bundle.installateur || {};

  const addAnlageBtn = page
    .locator('button:has-text("Hinzufügen zu Zustimmungspflichtige"), button:has-text("HINZUFÜGEN ZU ZUSTIMMUNGSPFLICHTIGE"), button:has-text("Hinzufügen")')
    .last();
  if (!(await addAnlageBtn.isVisible({ timeout: 5000 }).catch(() => false))) return;

  await addAnlageBtn.scrollIntoViewIfNeeded().catch(() => {});
  await addAnlageBtn.click();
  await page.waitForTimeout(700);

  const erzeugItem = page.locator('.mud-list-item:has-text("Erzeugungsanlage")').first();
  if (await erzeugItem.isVisible({ timeout: 4000 }).catch(() => false)) {
    await erzeugItem.click();
    await page.waitForTimeout(1000);
  }

  await selectMudOption(page, 'Anlagenart*', 'Neuerrichtung');

  await fillLabel(page, 'Firma*', inst.firma || extra?.installateur_firma || '');
  await fillLabel(page, 'Ort*',   inst.ort   || extra?.installateur_ort   || '');
  await fillLabel(page, 'Nr. Installateursausweis*',
    inst.ausweis_nr || extra?.installateur_ausweis || '');

  const hatSpeicher = !!(bundle.speicher);
  await selectMudOption(page, 'Soll lediglich ein Speicher angemeldet werden?*',
    hatSpeicher ? 'Ja' : 'Nein');
  await page.waitForTimeout(600);

  await selectMudOption(page, 'Energieart*', 'Sonne');
  await page.waitForTimeout(600);

  await fillLabel(page, 'Hersteller*', pv.wr_hersteller || extra?.wr_hersteller || '');
  await fillLabel(page, 'Typ*',        pv.wr_typ        || extra?.wr_typ        || '');

  const anzahlEl = page.getByLabel('Anzahl baugleicher Einheiten*', { exact: true }).first();
  if (await anzahlEl.isVisible({ timeout: 2000 }).catch(() => false)) {
    await anzahlEl.fill(String(pv.wr_anzahl || extra?.wr_anzahl || 1));
  }

  const paMax = pv.pa_max_kw  || pv.leistung_kwp || '';
  const saMax = pv.sa_max_kva || pv.leistung_kwp || '';
  await fillLabel(page, 'max. Wirkleistung PAmax in kW*',    String(paMax));
  await fillLabel(page, 'max. Scheinleistung SAmax in kVA*', String(saMax));

  const modulWp  = pv.modul_leistung_wp || extra?.modul_leistung_wp;
  const modulAnz = pv.modul_anzahl      || extra?.modul_anzahl;

  if (modulWp) {
    const wpEl = page.getByLabel('Leistung eines Solarmoduls in Wp*', { exact: true }).first();
    if (await wpEl.isVisible({ timeout: 2000 }).catch(() => false)) await wpEl.fill(String(modulWp));
  }
  if (modulAnz) {
    const anzEl = page.getByLabel('Anzahl der Solarmodule*', { exact: true }).first();
    if (await anzEl.isVisible({ timeout: 2000 }).catch(() => false)) await anzEl.fill(String(modulAnz));
  }

  await fillLabel(page, 'Gesamtleistung der Solarmodule in kWp*', String(pv.leistung_kwp || ''));

  let begrenzung = 'Nein';
  if (pv.begrenzung_60_prozent === true || pv.begrenzung_60_prozent === 'Ja') {
    begrenzung = 'Ja';
  } else if (pv.begrenzung_60_prozent === false || pv.begrenzung_60_prozent === 'Nein') {
    begrenzung = 'Nein';
  } else {
    begrenzung = (parseFloat(pv.leistung_kwp) <= 30) ? 'Ja' : 'Nein';
  }
  await selectMudOption(page,
    'Begrenzung der Wechselrichterleistung auf 60 % der Modulleistung*', begrenzung);

  const netzein = pv.netzeinspeisung
    || (parseFloat(pv.leistung_kwp) <= 4.6 ? '1-phasig' : '3-phasig');
  await selectMudOption(page, 'Netzeinspeisung*', netzein);

  const einspeisungText = (pv.einspeiseart_util === 'voll' || pv.einspeiseart_lovion === 'full')
    ? 'Volleinspeisung'
    : 'Überschusseinspeisung';
  await selectMudOption(page, 'Art der Einspeisung*', einspeisungText);

  await selectMudOption(page,
    'Messstellenbetrieb durch uns als Netzbetreiber vorgesehen?*',
    pv.messstellenbetrieb_util || 'Nein');

  await selectMudOption(page,
    'Belieferung von anderen Letztverbrauchern durch Strom aus der Erzeugungsanlage?*',
    pv.belieferung_dritte || 'Nein');

  const mastr = pv.mastr_nummer || extra?.mastr_nummer;
  if (mastr) await fillLabel(page, 'Registrierungsnummer Marktstammdatenregister', mastr);

  await selectMudOption(page, 'Anschluss und Betrieb eines Speichersystems?*',
    hatSpeicher ? 'Ja' : 'Nein');

  const datum = pv.inbetriebnahme_datum || extra?.inbetriebnahme_datum;
  if (datum) await fillLabel(page, 'geplanter Inbetriebsetzungstermin*', datum);
}

async function fillUtilPortal({ page, credentials, bundle, extra, snap, portalUrl }) {
  const { user, password } = credentials;
  const s  = bundle.anlagenstandort;
  const pv = bundle.pv || {};

  await page.goto(portalUrl, { waitUntil: 'networkidle', timeout: 30000 });
  await snap('01_portal_start');

  const isLoginPage = page.url().includes('/Account/Login')
    || page.url().includes('/login')
    || await page.locator('input[type="email"]').isVisible({ timeout: 3000 }).catch(() => false);

  if (isLoginPage) await loginUtilPortal(page, user, password);
  await snap('02_nach_login');

  await createNetzanschlussVorgang(page, portalUrl);
  await snap('03_vorgang_erstellt');

  await page.waitForTimeout(1000);
  await fillAntragsteller(page, bundle, extra);
  await snap('04_antragsteller');

  await fillAnlagenstandort(page, bundle);
  await snap('05_anlagenstandort');

  await fillNetzanschluss(page, extra);
  await snap('06_netzanschluss');

  await addPVAnlage(page, bundle, extra);
  await snap('07_pv_anlage');

  const saveBtn = page
    .locator('button:has-text("Speichern"), button:has-text("SPEICHERN")')
    .first();
  if (await saveBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
    await saveBtn.click();
    await page.waitForTimeout(1500);
  }
  await snap('08_entwurf_gespeichert');

  return {
    portalUrl: page.url(),
    message: [
      'util.portal: Antrag als Entwurf gespeichert.',
      'Bitte Dokumente hochladen (Lageplan, WR-Datenblatt, Modulzertifikate) und manuell einreichen.',
      `Adresse: ${s.strasse} ${s.hausnummer}, ${s.plz} ${s.ort || ''}`.trim(),
      `PV: ${pv.leistung_kwp} kWp`,
      bundle.speicher ? `Speicher: ${bundle.speicher.kapazitaet_kwh} kWh` : null,
    ].filter(Boolean).join(' | '),
  };
}

module.exports = { fillUtilPortal, loginUtilPortal };
