// Driver für ESM Selb — HAP Netzbetreiberplattform
// Portal: https://netz-portal.esm-selb.de/hap-fe/bo/#/home
// Login: Modal-Dialog mit E-Mail-Adresse + Passwort

import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import type { Job, PortalCredentials, FillResult, PortalDriver } from '../types.js';
import { config } from '../config.js';

const PORTAL_URL = 'https://netz-portal.esm-selb.de/hap-fe/bo/#/home';

async function fill(job: Job, creds: PortalCredentials): Promise<FillResult> {
  mkdirSync('artifacts', { recursive: true });

  const f = job.fields;
  const hnr     = f.street?.match(/\d+\s*[a-zA-Z]?$/)?.[0] ?? '';
  const strasse = f.street?.replace(/\s*\d+\s*[a-zA-Z]?\s*$/, '') ?? '';
  const nameParts = f.name.split(' ');
  const vorname   = nameParts.slice(0, -1).join(' ');
  const nachname  = nameParts.at(-1) ?? '';

  const browser = await chromium.launch({ headless: config.headless });
  const page    = await browser.newPage();
  let screenshotPath = '';

  async function snap(label: string): Promise<void> {
    screenshotPath = `artifacts/esm_selb_${label}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: false }).catch(() => {});
  }

  async function fillIfExists(sel: string, value: string | number | undefined): Promise<void> {
    if (value === undefined || value === null || value === '') return;
    const el = page.locator(sel).first();
    if (await el.isVisible({ timeout: 2000 }).catch(() => false))
      await el.fill(String(value));
  }

  try {
    // ── 1. Portal öffnen ────────────────────────────────────────────────────
    await page.goto(PORTAL_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await snap('01_startseite');

    // ── 2. Login-Dialog öffnen ──────────────────────────────────────────────
    const anmeldenBtn = page.locator(
      'a:has-text("Anmelden"), button:has-text("Anmelden")'
    ).first();
    await anmeldenBtn.waitFor({ timeout: 10000 });
    await anmeldenBtn.click();
    await page.waitForTimeout(1500);
    await snap('02_login_dialog');

    // ── 3. Login (Modal) ────────────────────────────────────────────────────
    const emailField = page.locator('input[placeholder*="E-Mail" i], input[type="email"]').first();
    await emailField.waitFor({ timeout: 5000 });
    await emailField.fill(creds.username);
    await page.locator('input[placeholder*="Passwort" i], input[type="password"]').first().fill(creds.password);

    const submitBtn = page.locator(
      'button:has-text("Anmelden"):not([class*="nav"])'
    ).last();
    await submitBtn.click();
    await page.waitForTimeout(3000);
    await snap('03_nach_login');

    // ── 4. Neuen Antrag (Einspeiseanlage) ───────────────────────────────────
    const antragBtn = page.locator(
      'a:has-text("Einspeise"), a:has-text("Neue Anfrage"), ' +
      'button:has-text("Neue Anfrage"), a:has-text("PV"), ' +
      'button:has-text("Neuer Antrag")'
    ).first();
    if (await antragBtn.isVisible({ timeout: 8000 }).catch(() => false)) {
      await antragBtn.click();
      await page.waitForTimeout(2000);
    }
    await snap('04_antrag_typ');

    // ── 5. Formular ausfüllen ────────────────────────────────────────────────
    await fillIfExists('input[placeholder*="Straße" i], input[formcontrolname="street"]', strasse);
    await fillIfExists('input[placeholder*="Hausnr" i], input[formcontrolname="houseNumber"]', hnr);
    await fillIfExists('input[placeholder*="PLZ" i], input[formcontrolname="zipCode"]', f.zip);
    await fillIfExists('input[placeholder*="Ort" i], input[formcontrolname="city"]', f.city);

    await fillIfExists('input[placeholder*="Vorname" i]', vorname);
    await fillIfExists('input[placeholder*="Nachname" i]', nachname);
    await fillIfExists('input[placeholder*="E-Mail" i], input[type="email"]', creds.username);
    await fillIfExists('input[placeholder*="kWp" i], input[placeholder*="Leistung" i]', f.kwp);

    await snap('05_formular_ausgefuellt');

    // Speichern
    const saveBtn = page.locator(
      'button:has-text("Speichern"), button:has-text("Entwurf")'
    ).first();
    if (await saveBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await saveBtn.click();
      await page.waitForTimeout(2000);
    }
    await snap('06_gespeichert');

    return { ok: true, draftRef: page.url(), screenshotPath };

  } catch (err) {
    await snap('error');
    return { ok: false, screenshotPath, error: String(err) };
  } finally {
    await browser.close();
  }
}

export const esmSelbDriver: PortalDriver = {
  netzbetreiber: 'ESM Selb',
  fillDraft: fill,
};
