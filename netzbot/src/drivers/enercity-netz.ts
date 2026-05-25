// Driver für enercity Netz GmbH — eigenes NetzPortal (SPA)
// Portal: https://startseite.portal.enercity-netz.de/
// Login: "Anmelden"-Button auf Startseite → Login-Seite

import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import type { Job, PortalCredentials, FillResult, PortalDriver } from '../types.js';
import { config } from '../config.js';

const PORTAL_URL = 'https://startseite.portal.enercity-netz.de/';

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
    screenshotPath = `artifacts/enercity_${label}.png`;
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

    // Cookie-Banner
    const cookieBtn = page.locator(
      'button:has-text("Speichern + Beenden"), button:has-text("ablehnen")'
    ).first();
    if (await cookieBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
      await cookieBtn.click();
      await page.waitForTimeout(1000);
    }

    // ── 2. "Anmelden" klicken ───────────────────────────────────────────────
    const anmeldenBtn = page.locator('a:has-text("Anmelden"), button:has-text("Anmelden")').first();
    await anmeldenBtn.waitFor({ timeout: 10000 });
    await anmeldenBtn.click();
    await page.waitForTimeout(3000);
    await snap('02_login');

    // ── 3. Login ────────────────────────────────────────────────────────────
    const emailField = page.locator(
      'input[type="email"], input[name="email"], input[placeholder*="E-Mail" i], #username'
    ).first();
    await emailField.waitFor({ timeout: 10000 });
    await emailField.fill(creds.username);

    const passField = page.locator('input[type="password"]').first();
    await passField.fill(creds.password);

    const loginBtn = page.locator(
      'button[type="submit"], button:has-text("Anmelden"), button:has-text("Login")'
    ).first();
    await loginBtn.click();
    await page.waitForTimeout(3000);
    await snap('03_nach_login');

    // ── 4. Neuen Antrag (Einspeiseanlage) ───────────────────────────────────
    const antragBtn = page.locator(
      'a:has-text("Einspeise"), a:has-text("Erzeugungsanlage"), ' +
      'button:has-text("Neuer Antrag"), a:has-text("Anmeldung")'
    ).first();
    if (await antragBtn.isVisible({ timeout: 8000 }).catch(() => false)) {
      await antragBtn.click();
      await page.waitForTimeout(2000);
    }
    await snap('04_antrag');

    // ── 5. Formular ─────────────────────────────────────────────────────────
    await fillIfExists('input[placeholder*="Straße" i], input[name*="street" i]', strasse);
    await fillIfExists('input[placeholder*="Hausnr" i], input[name*="house" i]', hnr);
    await fillIfExists('input[placeholder*="PLZ" i], input[name*="zip" i]', f.zip);
    await fillIfExists('input[placeholder*="Ort" i], input[name*="city" i]', f.city);
    await fillIfExists('input[placeholder*="Vorname" i]', vorname);
    await fillIfExists('input[placeholder*="Nachname" i]', nachname);
    await fillIfExists('input[placeholder*="kWp" i]', f.kwp);

    await snap('05_formular');

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

export const enercityNetzDriver: PortalDriver = {
  netzbetreiber: 'enercity Netz',
  fillDraft: fill,
};
