// Driver für Werra Energie GmbH / EVB Netze — ASP.NET WebForms multi-page Formular.
// Portal: https://portal.evb-netze.de/
// Stabile semantische IDs: Formular_SOLAR*, Formular_ADRESSE_*, etc.
// Selektoren verifiziert am 2026-05-20 gegen reference/werra-energie.js.

import { chromium, type Page } from 'playwright';
import { mkdirSync } from 'fs';
import type { Job, PortalCredentials, FillResult, PortalDriver } from '../types.js';
import { config } from '../config.js';

const PORTAL_URL = 'https://portal.evb-netze.de/';

const SEL_USER = '#Container_Children_3_Container_Children_0_Container_Children_2_Login_LoginName';
const SEL_PASS = '#Container_Children_3_Container_Children_0_Container_Children_2_Login_Password';

async function fillId(page: Page, id: string, value: string | number | undefined): Promise<void> {
  if (value === undefined || value === null || value === '') return;
  const el = page.locator(`#${id}`).first();
  if (await el.isVisible({ timeout: 2000 }).catch(() => false)) {
    await el.fill(String(value));
  }
}

async function selectId(page: Page, id: string, value: string | undefined): Promise<void> {
  if (!value) return;
  const el = page.locator(`#${id}`).first();
  if (await el.isVisible({ timeout: 2000 }).catch(() => false)) {
    await el.selectOption(String(value)).catch(() => {});
  }
}

async function clickId(page: Page, id: string): Promise<void> {
  const el = page.locator(`#${id}`).first();
  if (await el.isVisible({ timeout: 2000 }).catch(() => false)) await el.click();
}

async function clickWeiter(page: Page): Promise<void> {
  const btn = page.locator('input[name="SeiteWechseln"], input[type="submit"][value="Weiter"]').first();
  await btn.waitFor({ timeout: 8000 });
  await btn.click();
  await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(800);
}

async function clickSpeichern(page: Page): Promise<void> {
  const btn = page.locator('input[value*="Speichern"], button:has-text("Speichern")').first();
  if (await btn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await btn.click();
    await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});
    await page.waitForTimeout(800);
  }
}

async function fill(job: Job, creds: PortalCredentials): Promise<FillResult> {
  mkdirSync('artifacts', { recursive: true });

  const f = job.fields;
  const hnr     = f.street?.match(/\d+\s*[a-zA-Z]?$/)?.[0] ?? '';
  const strasse = f.street?.replace(/\s*\d+\s*[a-zA-Z]?\s*$/, '') ?? '';
  const nameParts = f.name.split(' ');
  const vorname   = nameParts.slice(0, -1).join(' ');
  const nachname  = nameParts.at(-1) ?? '';
  const kwp       = f.kwp ?? 0;

  // Netzeinspeisung: ≤ 4,6 kWp → Einphasig (L1), sonst Drehstrom
  const netzein = kwp <= 4.6 ? 'L1' : 'Drehstrom';

  const browser = await chromium.launch({ headless: config.headless });
  const page    = await browser.newPage();
  let screenshotPath = '';

  async function snap(label: string): Promise<void> {
    screenshotPath = `artifacts/werra_energie_${label}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: false }).catch(() => {});
  }

  try {
    // ── 1. Login ────────────────────────────────────────────────────────────
    await page.goto(PORTAL_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await snap('01_evb_start');

    // Cookie-Banner wegklicken
    const cookieBtn = page.locator('button:has-text("Nur notwendige Cookies zulassen")').first();
    if (await cookieBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
      await cookieBtn.click();
      await page.waitForTimeout(600);
    }

    await page.waitForSelector(SEL_USER, { timeout: 10000 });
    await page.fill(SEL_USER, creds.username);
    await page.fill(SEL_PASS, creds.password);
    await page.click('input[value="Jetzt einloggen"], input[type="submit"]');
    await page.waitForLoadState('networkidle', { timeout: 25000 });
    await snap('02_nach_login');

    // ── 2. Formular starten ──────────────────────────────────────────────────
    const startBtn = page.locator(
      'a:has-text("Mit dem Ausfüllen beginnen"), a:has-text("Ausfüllen beginnen")'
    ).first();
    await startBtn.waitFor({ timeout: 10000 });
    await startBtn.click();
    await page.waitForLoadState('networkidle', { timeout: 20000 });
    await page.waitForTimeout(1000);
    await snap('03_kontaktdaten');

    // ── Seite 1: Kontaktdaten ────────────────────────────────────────────────
    await fillId(page, 'Formular_ANSCHLUSSNEHMER_VORNAME',  vorname);
    await fillId(page, 'Formular_ANSCHLUSSNEHMER_NACHNAME', nachname);
    await fillId(page, 'Formular_ADRESSE_STRASSE',          strasse);
    await fillId(page, 'Formular_ADRESSE_HAUSNR',           hnr);
    await fillId(page, 'Formular_ADRESSE_PLZ',              f.zip ?? '');
    await fillId(page, 'Formular_ADRESSE_ORT',              f.city ?? '');
    await fillId(page, 'Formular_KONTAKT_EMAIL',            creds.username);

    await clickId(page, 'Formular_STRASSENVERZEICHNIS_Ja');
    await clickId(page, 'Formular_ABWEICHENDEDATENANSCHLUSSNUTZER_Nein');
    await clickId(page, 'Formular_ABWEICHENDEDATENANLAGENSTANDORT_Nein');
    await clickId(page, 'Formular_ABWEICHENDEDATENGRUNDSTUECKSEIGENTUEMER_Nein');
    await clickId(page, 'Formular_ABWEICHENDEDATENRECHNUNGSEMPFAENGER_Nein');

    await snap('04_kontaktdaten_fertig');
    await clickWeiter(page);

    // ── Seite 2: Anschlussoptionen ───────────────────────────────────────────
    await snap('05_anschlussoptionen');
    await clickId(page, 'Formular_PHOTOVOLTAIKSOLAR_Ja');
    await snap('06_anschlussoptionen_fertig');
    await clickWeiter(page);

    // ── Seite 3: Photovoltaik/Solar ──────────────────────────────────────────
    await snap('07_pv_daten');

    // Modul: Hersteller + Typ kombiniert
    await fillId(page, 'Formular_SOLARMODULHERSTELLERTYP', f.moduleType ?? '');
    await fillId(page, 'Formular_SOLARMODULZAHL',          String(f.moduleCount ?? ''));

    // Wechselrichter
    await fillId(page, 'Formular_SOLARWECHSELRICHTERHERSTELLERTYP', f.inverter ?? '');
    await fillId(page, 'Formular_SOLARWECHSELRICHTERLEISTUNGPAMAX', String(kwp));
    await fillId(page, 'Formular_SOLARWECHSELRICHTERANZAHL',        '1');
    await fillId(page, 'Formular_SOLARWECHSELRICHTERSCHEINLEISTUNGSAMAX', String(kwp));
    await fillId(page, 'Formular_SOLARSUMMEDERMAXIMALENSCHEINLEISTUNGEN', String(kwp));

    await selectId(page, 'Formular_SOLARNETZEINSPEISUNG', netzein);
    await selectId(page, 'Formular_SOLARNA-SCHUTZ', 'Integriert im Wechselrichter');
    await selectId(page, 'Formular_SOLARGEWUENSCHTEVERAEUSSERUNGSFORMDEREIN',
      'Einspeisevergütung nach § 21 Abs. 1 EEG');

    // Messkonzept: Überschuss oder Volleinspeisung
    const messkonzept = f.einspeiseart === 'voll' ? 'Volleinspeisung' : 'Überschusseinspeisung';
    await clickId(page, `Formular_SOLARMESSKONZEPT_${messkonzept}`);

    await snap('08_pv_daten_fertig');
    await clickSpeichern(page);

    // ── Seite 4 (falls vorhanden): Installateur ──────────────────────────────
    const currentTitle = await page.title();
    if (!currentTitle.includes('gespeichert')) {
      await clickWeiter(page);
      await snap('09_installateur');

      await fillId(page, 'Formular_STROMINSTALLATEURKONTAKT_EMAIL', creds.username);
      await clickId(page, 'Formular_DATENSCHUTZERKLAERUNG_Ja,akzeptiert_');
      await clickId(page, 'Formular_WIDERRUFSERKLAERUNG_Ja,akzeptiert_');
      await snap('10_installateur_fertig');
      await clickSpeichern(page);
    }

    await snap('11_entwurf_gespeichert');

    return { ok: true, draftRef: page.url(), screenshotPath };

  } catch (err) {
    await snap('error');
    return { ok: false, screenshotPath, error: String(err) };
  } finally {
    await browser.close();
  }
}

export const werraEnergieDriver: PortalDriver = {
  netzbetreiber: 'Werra Energie',
  fillDraft: fill,
};
