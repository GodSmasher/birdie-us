// _lovion.ts — Gemeinsamer Filler für Lovion-Portale
//
// Portale:
//   SW Suhl/Zella-Mehlis → netzportal.swsz-netz.de/public/login.html
//   SW Bayreuth           → stadtwerke-bayreuth.de/installateurportal/public/login.html
//
// Plattform: Lovion (jQuery + Handlebars + OpenLayers)
//   Login: #username + #password + #login_button (stabil)
//
// Antrag-Schritte (live inspiziert 2026-05-20):
//   1. Lage               — Adresssuche
//   2. Anlagenbetreiber   — Kontaktdaten
//   3. Einspeiserkomponenten — Radio Ja/Nein
//   4. Photovoltaikanlage — PV-Daten
//   5. Einverständnis     — 3× Radio-Ja
//   6. Sonstige Angaben   — Bemerkung (optional)
//   7. Dokumente          — manuell
//   8. Zusammenfassung

import { chromium, type Page } from 'playwright';
import { mkdirSync } from 'fs';
import { config } from '../config.js';
import type { Job, PortalCredentials, FillResult } from '../types.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function loginLovion(page: Page, user: string, password: string): Promise<void> {
  await page.waitForSelector('#username', { timeout: 10_000 });
  await page.fill('#username', user);
  await page.fill('#password', password);
  await page.click('#login_button');
  await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 25_000 });
}

interface AddressSearchParams {
  strasse: string;
  hausnummer: string;
  plz: string;
  ort: string;
}

async function searchAndSelectAddress(page: Page, s: AddressSearchParams): Promise<void> {
  const searchField = page.locator('input[id$="-search-field"]');
  await searchField.waitFor({ timeout: 8_000 });
  await searchField.click();
  await searchField.fill('');

  const searchStr = `${s.strasse} ${s.hausnummer} ${s.ort || s.plz}`;
  await searchField.pressSequentially(searchStr, { delay: 80 });

  await page.waitForSelector('ul.search-result-list li', { timeout: 8_000 });
  await page.waitForTimeout(600);

  const items = page.locator('ul.search-result-list li');
  const count = await items.count();

  let clicked = false;
  for (let i = 0; i < Math.min(count, 8); i++) {
    const text = (await items.nth(i).textContent() ?? '').trim();
    if (text.includes(s.strasse) && text.includes(String(s.hausnummer))) {
      await items.nth(i).click();
      clicked = true;
      break;
    }
  }
  if (!clicked && count > 0) await items.first().click();

  await page.waitForTimeout(1200);
}

async function clickWeiter(page: Page): Promise<boolean> {
  const btn = page.locator('a.btn-next:not(.disabled), button.btn-next:not(:disabled)');
  if (await btn.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await btn.click();
    await page.waitForTimeout(1500);
    return true;
  }
  return false;
}

async function saveEntwurf(page: Page): Promise<void> {
  const btn = page.locator('a:has-text("Entwurf speichern"), button:has-text("Entwurf speichern"), a.btn-save');
  if (await btn.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await btn.click();
    await page.waitForTimeout(1000);
  }
}

async function fillIfExists(page: Page, selector: string, value: string | number | undefined): Promise<void> {
  if (value === undefined || value === null || value === '') return;
  const el = page.locator(selector).first();
  if (await el.isVisible({ timeout: 1_500 }).catch(() => false)) {
    await el.fill(String(value));
  }
}

async function selectIfExists(page: Page, selector: string, value: string | undefined): Promise<void> {
  if (!value) return;
  const el = page.locator(selector).first();
  if (await el.isVisible({ timeout: 1_500 }).catch(() => false)) {
    await el.selectOption(String(value)).catch(() => {});
  }
}

async function clickRadio(page: Page, nameContains: string, value: string): Promise<void> {
  const el = page.locator(`input[type="radio"][name*="${nameContains}"][value="${value}"]`).first();
  if (await el.isVisible({ timeout: 1_500 }).catch(() => false)) {
    await el.click();
    await page.waitForTimeout(300);
  }
}

// ---------------------------------------------------------------------------
// Main flow
// ---------------------------------------------------------------------------

export async function fillLovion(job: Job, creds: PortalCredentials): Promise<FillResult> {
  mkdirSync('artifacts', { recursive: true });

  const browser = await chromium.launch({
    headless: config.headless,
    args: ['--start-maximized'],
  });
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, locale: 'de-DE' });
  const page = await ctx.newPage();

  const f = job.fields;

  // Derive address parts from job.fields
  const strasse = f.street?.replace(/\s*\d+\s*[a-zA-Z]?\s*$/, '').trim() ?? '';
  const hausnummer = f.street?.match(/\d+\s*[a-zA-Z]?$/)?.[0]?.trim() ?? '';
  const plz = f.zip ?? '';
  const ort = f.city ?? '';

  // Einspeiseart mapping: job uses 'ueberschuss'|'voll', Lovion uses 'overflow'|'full'
  const einspeiseart = f.einspeiseart === 'voll' ? 'full' : 'overflow';

  const snap = async (label: string) => {
    await page.screenshot({ path: `artifacts/${job.offerId}-${label}.png` });
  };

  try {
    await page.goto(creds.portalUrl, { waitUntil: 'networkidle', timeout: 30_000 });
    await snap('01_login');
    await loginLovion(page, creds.username, creds.password);
    await snap('02_nach_login');

    const jetzt = page.locator('a:has-text("Jetzt starten")').first();
    await jetzt.waitFor({ timeout: 8_000 });
    await jetzt.click();
    await page.waitForSelector('a:has-text("Beantragen")', { timeout: 10_000 });
    await snap('03_consumer');

    const beantragen = page.locator('a:has-text("Beantragen"), button:has-text("Beantragen")');
    await beantragen.nth(2).click();
    await page.waitForURL(/showRwo/, { timeout: 15_000 });
    await page.waitForTimeout(1500);
    await snap('04_step1_lage');

    // Step 1: Lage
    const jaRadio = page.locator('input[name^="df_address_information"][value="true"]');
    if (await jaRadio.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await jaRadio.click();
      await page.waitForTimeout(400);
    }
    await searchAndSelectAddress(page, { strasse, hausnummer, plz, ort });
    await saveEntwurf(page);
    await snap('05_step1_lage_fertig');
    await clickWeiter(page);

    // Step 2: Anlagenbetreiber
    await page.waitForTimeout(1000);
    await snap('06_step2_betreiber');

    await selectIfExists(page, 'select[name="address_form"]', 'Herr');
    await fillIfExists(page, 'input[name="name"]', f.name);
    await fillIfExists(page, 'input[name="street"]', strasse);
    await fillIfExists(page, 'input[name="house_number"]', hausnummer);
    await fillIfExists(page, 'input[name="zip_code"]', plz);
    await fillIfExists(page, 'input[name="locality"]', ort);
    // mobile_number ist Pflichtfeld — Fallback auf Platzhalter
    await fillIfExists(page, 'input[name="mobile_number"]', '01234567890');
    await fillIfExists(page, 'input[name="email_address"]', creds.username);

    await saveEntwurf(page);
    await snap('07_step2_betreiber_fertig');
    await clickWeiter(page);

    // Step 3: Einspeiserkomponenten
    await page.waitForTimeout(1000);
    await snap('08_step3_einspeiser');

    await clickRadio(page, 'create_pc_el_pv', 'true');

    await saveEntwurf(page);
    await snap('09_step3_einspeiser_fertig');
    await clickWeiter(page);

    // Step 4: Photovoltaikanlage
    await page.waitForTimeout(1000);
    await snap('10_step4_pv');

    await selectIfExists(page, 'select[name="photovoltaic_location"]', 'roof');
    if (f.kwp !== undefined) {
      await fillIfExists(page, 'input[name="gross_power_kwp"]', String(f.kwp).replace('.', ','));
    }
    await selectIfExists(page, 'select[name="supply_type_v"]', einspeiseart);

    await saveEntwurf(page);
    await snap('11_step4_pv_fertig');
    await clickWeiter(page);

    // Step 5: Einverständnis — Radio-Buttons, NICHT Checkboxen!
    await page.waitForTimeout(1000);
    await snap('12_step5_einverstaendnis');

    await clickRadio(page, 'agreement_personal_data', 'true');
    await clickRadio(page, 'agreement_disclaimer', 'true');
    await clickRadio(page, 'agreement_eeg_nav_tab', 'true');

    await saveEntwurf(page);
    await snap('13_step5_einverstaendnis_fertig');
    await clickWeiter(page);

    // Step 6: Sonstige Angaben
    await page.waitForTimeout(800);
    await snap('14_step6_sonstige');

    await saveEntwurf(page);
    await clickWeiter(page);

    // Step 7: Dokumente — manuell durch Team
    await page.waitForTimeout(800);
    await snap('15_step7_dokumente');
    await saveEntwurf(page);

    // Step 8: Zusammenfassung
    await page.waitForTimeout(800);
    await snap('16_step8_zusammenfassung');

    const screenshotPath = `artifacts/${job.offerId}-lovion-entwurf.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });

    // Extract draft reference from URL if present
    const draftMatch = page.url().match(/[?&](?:id|draft|rwoId)=([^&]+)/i);
    const draftRef = draftMatch?.[1];

    return { ok: true, screenshotPath, draftRef };
  } catch (err) {
    const errScreenshot = `artifacts/${job.offerId}-lovion-fehler.png`;
    await page.screenshot({ path: errScreenshot }).catch(() => {});
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  } finally {
    await browser.close();
  }
}
