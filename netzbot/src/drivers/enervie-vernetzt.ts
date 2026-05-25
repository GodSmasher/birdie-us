// Driver für ENERVIE Vernetzt GmbH — Lotus Notes/Domino HAV-Portal
// Portal: https://hav.enervie-vernetzt.de/havnext/portal_v2.nsf/frm_ext?openForm
// Login: #webLogin (E-Mail) + #Password + input[type="submit"]

import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import type { Job, PortalCredentials, FillResult, PortalDriver } from '../types.js';
import { config } from '../config.js';

const PORTAL_URL = 'https://hav.enervie-vernetzt.de/havnext/portal_v2.nsf/frm_ext?openForm';

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
    screenshotPath = `artifacts/enervie_${label}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: false }).catch(() => {});
  }

  async function fillIfExists(sel: string, value: string | number | undefined): Promise<void> {
    if (value === undefined || value === null || value === '') return;
    const el = page.locator(sel).first();
    if (await el.isVisible({ timeout: 2000 }).catch(() => false))
      await el.fill(String(value));
  }

  try {
    // ── 1. Login ────────────────────────────────────────────────────────────
    await page.goto(PORTAL_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await snap('01_login');

    await page.locator('#webLogin').fill(creds.username);
    await page.locator('#Password').fill(creds.password);
    await page.locator('input[type="submit"]').click();
    await page.waitForLoadState('networkidle', { timeout: 20000 });
    await page.waitForTimeout(2000);
    await snap('02_nach_login');

    // ── 2. Neuen Antrag starten (Einspeiseanlage) ───────────────────────────
    const antragLink = page.locator(
      'a:has-text("Neue Anmeldung"), a:has-text("Neuer Antrag"), ' +
      'a:has-text("Einspeisung"), a:has-text("Erzeugungsanlage")'
    ).first();
    if (await antragLink.isVisible({ timeout: 8000 }).catch(() => false)) {
      await antragLink.click();
      await page.waitForLoadState('networkidle', { timeout: 20000 });
      await page.waitForTimeout(1500);
    }
    await snap('03_antrag');

    // ── 3. Formular ausfüllen ────────────────────────────────────────────────
    await fillIfExists('input[name*="Vorname" i], input[id*="Vorname" i]', vorname);
    await fillIfExists('input[name*="Nachname" i], input[id*="Nachname" i]', nachname);
    await fillIfExists('input[name*="Strasse" i], input[name*="Straße" i]', strasse);
    await fillIfExists('input[name*="Hausnr" i], input[name*="HausNr" i]', hnr);
    await fillIfExists('input[name*="PLZ" i]', f.zip);
    await fillIfExists('input[name*="Ort" i]', f.city);
    await fillIfExists('input[name*="Mail" i], input[name*="email" i]', creds.username);
    await fillIfExists('input[name*="kWp" i], input[name*="Leistung" i]', f.kwp);

    await snap('04_formular_ausgefuellt');

    // Speichern
    const saveBtn = page.locator(
      'input[value*="Speichern"], button:has-text("Speichern"), ' +
      'input[value*="Entwurf"], button:has-text("Entwurf")'
    ).first();
    if (await saveBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await saveBtn.click();
      await page.waitForTimeout(2000);
    }
    await snap('05_gespeichert');

    return { ok: true, draftRef: page.url(), screenshotPath };

  } catch (err) {
    await snap('error');
    return { ok: false, screenshotPath, error: String(err) };
  } finally {
    await browser.close();
  }
}

export const enervieVernetzDriver: PortalDriver = {
  netzbetreiber: 'Enervie Vernetzt',
  fillDraft: fill,
};
