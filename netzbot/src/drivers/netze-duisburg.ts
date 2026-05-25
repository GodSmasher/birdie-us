// Driver für Netze Duisburg — SAP UI5 Portal (ähnlich Netze Magdeburg)
// Portal: https://portal.netze-duisburg.de/sap/bc/ui5_ui5/sap/zumcui5_cg_m/index.html
// Login: SAP-Login (Benutzername + Passwort)

import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import type { Job, PortalCredentials, FillResult, PortalDriver } from '../types.js';
import { config } from '../config.js';

const PORTAL_URL = 'https://portal.netze-duisburg.de/sap/bc/ui5_ui5/sap/zumcui5_cg_m/index.html?sap-client=002&sap-language=DE#/home';

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
    screenshotPath = `artifacts/netze_duisburg_${label}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: false }).catch(() => {});
  }

  async function fillIfExists(sel: string, value: string | number | undefined): Promise<void> {
    if (value === undefined || value === null || value === '') return;
    const el = page.locator(sel).first();
    if (await el.isVisible({ timeout: 2000 }).catch(() => false)) {
      try {
        await el.fill(String(value));
      } catch {
        await el.evaluate((node, v) => {
          (node as HTMLInputElement).value = v;
          node.dispatchEvent(new Event('input', { bubbles: true }));
          node.dispatchEvent(new Event('change', { bubbles: true }));
        }, String(value));
      }
    }
  }

  async function clickWeiter(): Promise<void> {
    const btn = page.locator(
      'ui5-button:has-text("Weiter"), button:has-text("Weiter"), ' +
      '[class*="sapMBtn"]:has-text("Weiter")'
    ).first();
    if (await btn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await btn.click();
      await page.waitForTimeout(1500);
    }
  }

  try {
    // ── 1. Portal öffnen ────────────────────────────────────────────────────
    await page.goto(PORTAL_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await snap('01_login');

    // ── 2. SAP-Login ────────────────────────────────────────────────────────
    const userField = page.locator('input[placeholder="Benutzername"], #username, input[name="j_username"]').first();
    await userField.waitFor({ timeout: 15000 });
    await userField.fill(creds.username);
    await page.locator('input[placeholder="Passwort"], #password, input[name="j_password"], input[type="password"]').first().fill(creds.password);
    await page.locator('button[type="submit"], input[type="submit"]').first().click();
    await page.waitForTimeout(3000);
    await snap('02_nach_login');

    // ── 3. Neuen Antrag ─────────────────────────────────────────────────────
    await page.waitForSelector('ui5-button, [class*="sapMBtn"], h1', { timeout: 15000 }).catch(() => {});

    const neuerAntragBtn = page.locator(
      'ui5-button:has-text("Neuen Antrag"), ui5-button:has-text("Neu"), ' +
      'button:has-text("Neuen Antrag"), [class*="sapMBtn"]:has-text("Neu")'
    ).first();
    if (await neuerAntragBtn.isVisible({ timeout: 8000 }).catch(() => false)) {
      await neuerAntragBtn.click();
      await page.waitForTimeout(2000);
    }
    await snap('03_neuer_antrag');

    // PV-Option wählen
    const pvOption = page.locator(
      'ui5-li:has-text("PV"), ui5-li:has-text("Einspeisung"), [class*="sapMSLI"]:has-text("PV")'
    ).first();
    if (await pvOption.isVisible({ timeout: 4000 }).catch(() => false)) {
      await pvOption.click();
      await page.waitForTimeout(1000);
    }
    await snap('04_antrag_typ');

    // ── 4. Standort ─────────────────────────────────────────────────────────
    await fillIfExists('ui5-input[placeholder*="Straße" i], input[placeholder*="Straße" i]', strasse);
    await fillIfExists('ui5-input[placeholder*="Hausnr" i], input[placeholder*="Hausnr" i]', hnr);
    await fillIfExists('ui5-input[placeholder*="PLZ" i], input[placeholder*="PLZ" i]', f.zip);
    await fillIfExists('ui5-input[placeholder*="Ort" i], input[placeholder*="Ort" i]', f.city);
    await snap('05_standort');
    await clickWeiter();

    // ── 5. PV-Daten ─────────────────────────────────────────────────────────
    await fillIfExists('ui5-input[placeholder*="kWp" i], input[placeholder*="kWp" i]', f.kwp);
    await snap('06_pv_daten');
    await clickWeiter();

    // ── 6. Betreiber ────────────────────────────────────────────────────────
    await fillIfExists('ui5-input[placeholder*="Vorname" i]', vorname);
    await fillIfExists('ui5-input[placeholder*="Nachname" i]', nachname);
    await snap('07_betreiber');
    await clickWeiter();

    // ── 7. Speichern ────────────────────────────────────────────────────────
    await snap('08_zusammenfassung');
    const saveBtn = page.locator(
      'ui5-button:has-text("Speichern"), button:has-text("Speichern"), ' +
      '[class*="sapMBtn"]:has-text("Speichern")'
    ).first();
    if (await saveBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await saveBtn.click();
      await page.waitForTimeout(2000);
    }
    await snap('09_gespeichert');

    return { ok: true, draftRef: page.url(), screenshotPath };

  } catch (err) {
    await snap('error');
    return { ok: false, screenshotPath, error: String(err) };
  } finally {
    await browser.close();
  }
}

export const netzeDuisburgDriver: PortalDriver = {
  netzbetreiber: 'Netze Duisburg',
  fillDraft: fill,
};
