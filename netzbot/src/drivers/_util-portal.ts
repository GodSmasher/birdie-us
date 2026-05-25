/**
 * _util-portal.ts — Gemeinsamer Filler für util.portal (MudBlazor / Blazor Server)
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
 */

import { chromium } from 'playwright';
import type { Page } from 'playwright';
import { mkdirSync } from 'fs';
import { config } from '../config.js';
import type { Job, PortalCredentials, FillResult } from '../types.js';

// ---------------------------------------------------------------------------
// MudBlazor helpers
// ---------------------------------------------------------------------------

async function selectMudOption(page: Page, labelText: string, optionText: string | undefined): Promise<void> {
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

async function fillLabel(page: Page, labelText: string, value: string | number | undefined): Promise<void> {
  if (value === undefined || value === null || value === '') return;
  const el = page.getByLabel(labelText, { exact: true }).first();
  if (await el.isVisible({ timeout: 2000 }).catch(() => false)) {
    await el.fill(String(value));
  }
}

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------

async function loginUtilPortal(page: Page, user: string, password: string): Promise<void> {
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

// ---------------------------------------------------------------------------
// Vorgang erstellen
// ---------------------------------------------------------------------------

async function createNetzanschlussVorgang(page: Page, portalUrl: string): Promise<void> {
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

// ---------------------------------------------------------------------------
// Antragsteller (Betreiber-Daten aus job.fields)
// ---------------------------------------------------------------------------

async function fillAntragsteller(page: Page, job: Job): Promise<void> {
  const f = job.fields;

  // Split "Vorname Nachname"
  const parts = f.name.split(' ');
  const vorname  = parts.slice(0, -1).join(' ');
  const nachname = parts.at(-1) ?? f.name;

  // Hausnummer aus Straße extrahieren
  const strasse    = f.street?.replace(/\s*\d+\s*[a-zA-Z]?\s*$/, '').trim() ?? '';
  const hausnummer = f.street?.match(/\d+\s*[a-zA-Z]?$/)?.[0] ?? '';

  await fillLabel(page, 'Name*',      nachname);
  await fillLabel(page, 'Vorname*',   vorname);
  // Geburtsdatum ist Pflichtfeld im Portal — im Job nicht vorhanden, Platzhalter leer lassen
  // (muss manuell nachgepflegt werden)
  await fillLabel(page, 'Strasse*',    strasse);
  await fillLabel(page, 'Hausnummer*', hausnummer);
  await fillLabel(page, 'PLZ*',        f.zip ?? '');
  await fillLabel(page, 'Ort*',        f.city ?? '');
}

// ---------------------------------------------------------------------------
// Anlagenstandort (zweites Adress-Paar im Formular)
// ---------------------------------------------------------------------------

async function fillAnlagenstandort(page: Page, job: Job): Promise<void> {
  const f = job.fields;

  const strasse    = f.street?.replace(/\s*\d+\s*[a-zA-Z]?\s*$/, '').trim() ?? '';
  const hausnummer = f.street?.match(/\d+\s*[a-zA-Z]?$/)?.[0] ?? '';

  const strasseAll = page.getByLabel('Strasse*',    { exact: true });
  const hnrAll     = page.getByLabel('Hausnummer*', { exact: true });
  const plzAll     = page.getByLabel('PLZ*',        { exact: true });
  const ortAll     = page.getByLabel('Ort*',        { exact: true });

  const strasseCount = await strasseAll.count();
  if (strasseCount >= 2) {
    await strasseAll.nth(1).fill(strasse);
    await hnrAll.nth(1).fill(hausnummer);
    await plzAll.nth(1).fill(f.zip ?? '');
    await ortAll.nth(1).fill(f.city ?? '');
  }
}

// ---------------------------------------------------------------------------
// Netzanschluss-Lastfelder (werden mit 0 vorausgefüllt, wenn leer)
// ---------------------------------------------------------------------------

async function fillNetzanschluss(page: Page): Promise<void> {
  const felder: [string, number][] = [
    ['Anzahl Wohnungen teilelektrisch*', 0],
    ['Anzahl Wohnungen vollelektrisch*', 0],
    ['Leistung Gewerbe in kVA*',         0],
    ['Leistung Gemeinschaftsanlage in kVA*', 0],
  ];

  for (const [lbl, val] of felder) {
    const el = page.getByLabel(lbl, { exact: true }).first();
    if (await el.isVisible({ timeout: 2000 }).catch(() => false)) {
      const current = await el.inputValue();
      if (!current || current === '') await el.fill(String(val));
    }
  }
}

// ---------------------------------------------------------------------------
// PV-Anlage hinzufügen
// ---------------------------------------------------------------------------

async function addPVAnlage(page: Page, job: Job): Promise<void> {
  const f = job.fields;

  const addAnlageBtn = page
    .locator(
      'button:has-text("Hinzufügen zu Zustimmungspflichtige"), ' +
      'button:has-text("HINZUFÜGEN ZU ZUSTIMMUNGSPFLICHTIGE"), ' +
      'button:has-text("Hinzufügen")',
    )
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

  // Installateur-Felder: im Job nicht vorhanden → leer lassen (manuell nachpflegen)
  // await fillLabel(page, 'Firma*', '');
  // await fillLabel(page, 'Ort*',   '');
  // await fillLabel(page, 'Nr. Installateursausweis*', '');

  await selectMudOption(page, 'Soll lediglich ein Speicher angemeldet werden?*', 'Nein');
  await page.waitForTimeout(600);

  await selectMudOption(page, 'Energieart*', 'Sonne');
  await page.waitForTimeout(600);

  // Wechselrichter: aus job.fields.inverter → "Hersteller Typ" aufteilen
  if (f.inverter) {
    const parts   = f.inverter.split(/\s+/);
    const hersteller = parts[0] ?? '';
    const typ        = parts.slice(1).join(' ') || f.inverter;
    await fillLabel(page, 'Hersteller*', hersteller);
    await fillLabel(page, 'Typ*',        typ);
  }

  // Anzahl baugleicher Einheiten = 1 als Default
  const anzahlEl = page.getByLabel('Anzahl baugleicher Einheiten*', { exact: true }).first();
  if (await anzahlEl.isVisible({ timeout: 2000 }).catch(() => false)) {
    await anzahlEl.fill('1');
  }

  // Leistungen aus kwp
  const kwp = f.kwp ?? 0;
  await fillLabel(page, 'max. Wirkleistung PAmax in kW*',    String(kwp));
  await fillLabel(page, 'max. Scheinleistung SAmax in kVA*', String(kwp));

  // Modul-Felder
  if (f.moduleCount) {
    const anzEl = page.getByLabel('Anzahl der Solarmodule*', { exact: true }).first();
    if (await anzEl.isVisible({ timeout: 2000 }).catch(() => false)) {
      await anzEl.fill(String(f.moduleCount));
    }
    // Leistung je Modul aus kWp / Anzahl (in Wp)
    const modulWp = kwp && f.moduleCount ? Math.round((kwp * 1000) / f.moduleCount) : undefined;
    if (modulWp) {
      const wpEl = page.getByLabel('Leistung eines Solarmoduls in Wp*', { exact: true }).first();
      if (await wpEl.isVisible({ timeout: 2000 }).catch(() => false)) await wpEl.fill(String(modulWp));
    }
  }

  await fillLabel(page, 'Gesamtleistung der Solarmodule in kWp*', String(kwp));

  // Begrenzung 60 %: automatisch Ja bei ≤ 30 kWp
  const begrenzung = kwp <= 30 ? 'Ja' : 'Nein';
  await selectMudOption(
    page,
    'Begrenzung der Wechselrichterleistung auf 60 % der Modulleistung*',
    begrenzung,
  );

  // Netzeinspeisung: 1-phasig bei ≤ 4,6 kWp, sonst 3-phasig (überschreibbar durch job.fields.phases)
  const netzein = f.phases === 1 ? '1-phasig'
    : f.phases === 3            ? '3-phasig'
    : kwp <= 4.6                ? '1-phasig'
    :                             '3-phasig';
  await selectMudOption(page, 'Netzeinspeisung*', netzein);

  // Einspeiseart
  const einspeisungText = f.einspeiseart === 'voll' ? 'Volleinspeisung' : 'Überschusseinspeisung';
  await selectMudOption(page, 'Art der Einspeisung*', einspeisungText);

  await selectMudOption(
    page,
    'Messstellenbetrieb durch uns als Netzbetreiber vorgesehen?*',
    'Nein',
  );
  await selectMudOption(
    page,
    'Belieferung von anderen Letztverbrauchern durch Strom aus der Erzeugungsanlage?*',
    'Nein',
  );

  await selectMudOption(page, 'Anschluss und Betrieb eines Speichersystems?*', 'Nein');
}

// ---------------------------------------------------------------------------
// Hauptfunktion — wird von den Portal-spezifischen Treibern aufgerufen
// ---------------------------------------------------------------------------

export async function fillUtilPortal(job: Job, creds: PortalCredentials): Promise<FillResult> {
  mkdirSync('artifacts', { recursive: true });

  const browser = await chromium.launch({
    headless: config.headless,
    args: ['--start-maximized'],
  });
  const ctx  = await browser.newContext({ viewport: { width: 1920, height: 1080 }, locale: 'de-DE' });
  const page = await ctx.newPage();

  /** Snapshot-Helfer */
  const snap = async (name: string) => {
    await page.screenshot({ path: `artifacts/${job.offerId}-${name}.png` }).catch(() => {});
  };

  try {
    await page.goto(creds.portalUrl, { waitUntil: 'networkidle', timeout: 30000 });
    await snap('01_portal_start');

    const isLoginPage =
      page.url().includes('/Account/Login') ||
      page.url().includes('/login') ||
      (await page.locator('input[type="email"]').isVisible({ timeout: 3000 }).catch(() => false));

    if (isLoginPage) await loginUtilPortal(page, creds.username, creds.password);
    await snap('02_nach_login');

    await createNetzanschlussVorgang(page, creds.portalUrl);
    await snap('03_vorgang_erstellt');

    await page.waitForTimeout(1000);
    await fillAntragsteller(page, job);
    await snap('04_antragsteller');

    await fillAnlagenstandort(page, job);
    await snap('05_anlagenstandort');

    await fillNetzanschluss(page);
    await snap('06_netzanschluss');

    await addPVAnlage(page, job);
    await snap('07_pv_anlage');

    const saveBtn = page
      .locator('button:has-text("Speichern"), button:has-text("SPEICHERN")')
      .first();
    if (await saveBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
      await saveBtn.click();
      await page.waitForTimeout(1500);
    }

    const screenshotPath = `artifacts/${job.offerId}-${job.netzbetreiber.replace(/\s+/g, '-')}-entwurf.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });
    await snap('08_entwurf_gespeichert');

    // Vorgang-URL als draftRef
    const draftRef = page.url();

    return { ok: true, draftRef, screenshotPath };
  } catch (err) {
    const errScreenshot = `artifacts/${job.offerId}-util-portal-fehler.png`;
    await page.screenshot({ path: errScreenshot }).catch(() => {});
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  } finally {
    await browser.close();
  }
}
