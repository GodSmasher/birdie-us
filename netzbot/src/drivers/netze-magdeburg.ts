// Driver für Netze Magdeburg (Städtische Werke Magdeburg) — SAP UI5 Installateur-Portal.
// Portal: https://onlinecenter.sw-magdeburg.de/sap/bc/ui5_ui5/sap/zui5umc/index.html
// Login: SAP-Benutzernummer (z.B. "233834"), kein E-Mail!
// Selektoren verifiziert am 2026-05-20 gegen reference/netze-magdeburg.js.

import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import type { Job, PortalCredentials, FillResult, PortalDriver } from '../types.js';
import { config } from '../config.js';

const PORTAL_URL = 'https://onlinecenter.sw-magdeburg.de/sap/bc/ui5_ui5/sap/zui5umc/index.html?CompanyID=SWM_IP&sap-client=002&sap-language=DE#/projects';

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
    screenshotPath = `artifacts/netze_magdeburg_${label}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: false }).catch(() => {});
  }

  // SAP UI5: ui5-input Elemente brauchen ggf. evaluate()-Fallback
  async function fillIfExists(sel: string, value: string | number | undefined): Promise<void> {
    if (value === undefined || value === null || value === '') return;
    const el = page.locator(sel).first();
    if (await el.isVisible({ timeout: 1500 }).catch(() => false)) {
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
      '[class*="sapMBtn"]:has-text("Weiter"), ui5-button:has-text("Nächste")'
    ).first();
    if (await btn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await btn.click();
      await page.waitForTimeout(1500);
    }
  }

  try {
    // ── 1. Portal öffnen ────────────────────────────────────────────────────
    await page.goto(PORTAL_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await snap('01_sap_login');

    // ── 2. Login (placeholder-Selektoren stabil — SAP-IDs INSTABIL!) ────────
    const userField = page.locator('input[placeholder="Benutzername"]');
    await userField.waitFor({ timeout: 15000 });
    await userField.fill(creds.username);
    await page.locator('input[placeholder="Passwort"]').fill(creds.password);
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(3000);
    await snap('02_nach_login_klick');

    // ── 3. Passwort-Änderung abfangen (Erstlogin) ───────────────────────────
    const pwChangeField = page.locator('#INITIAL_PASSWORD_FIELD, input[id*="INITIAL_PASSWORD"]');
    if (await pwChangeField.isVisible({ timeout: 4000 }).catch(() => false)) {
      await snap('02b_passwort_aenderung');
      return {
        ok: false,
        screenshotPath,
        error: 'Netze Magdeburg: Passwort-Änderung erforderlich! Bitte Erstlogin manuell durchführen.',
      };
    }
    await snap('03_nach_login');

    await page.waitForSelector('ui5-button, [class*="sapMBtn"], h1', { timeout: 15000 }).catch(() => {});
    await snap('04_projekte_uebersicht');

    // ── 4. Neuen Antrag anlegen ─────────────────────────────────────────────
    const neuerAntragBtn = page.locator(
      'ui5-button:has-text("Neuen Antrag"), ui5-button:has-text("Neu"), ' +
      'button:has-text("Neuen Antrag"), [class*="sapMBtn"]:has-text("Neu")'
    ).first();

    if (await neuerAntragBtn.isVisible({ timeout: 8000 }).catch(() => false)) {
      await neuerAntragBtn.click();
      await page.waitForTimeout(2000);
    }
    await snap('05_neuer_antrag');

    const pvOption = page.locator(
      'ui5-li:has-text("PV"), ui5-li:has-text("Einspeisung"), ' +
      '[class*="sapMSLI"]:has-text("PV")'
    ).first();
    if (await pvOption.isVisible({ timeout: 4000 }).catch(() => false)) {
      await pvOption.click();
      await page.waitForTimeout(1000);
    }
    await snap('06_antrag_typ');

    // ── 5. Anlagen-Standort ─────────────────────────────────────────────────
    await fillIfExists('ui5-input[placeholder*="Straße" i], input[placeholder*="Straße" i]', strasse);
    await fillIfExists('ui5-input[placeholder*="Hausnr" i], input[placeholder*="Hausnr" i]', hnr);
    await fillIfExists('ui5-input[placeholder*="PLZ" i], input[placeholder*="PLZ" i]', f.zip);
    await fillIfExists('ui5-input[placeholder*="Ort" i], input[placeholder*="Ort" i]', f.city);
    await snap('07_standort');
    await clickWeiter();

    // ── 6. Technische Daten (PV) ────────────────────────────────────────────
    await fillIfExists('ui5-input[placeholder*="kWp" i], input[placeholder*="kWp" i]', f.kwp);
    await fillIfExists('ui5-input[placeholder*="Hersteller" i], input[placeholder*="Hersteller" i]',
      f.moduleType ?? '');
    await snap('08_pv_daten');
    await clickWeiter();

    // ── 7. Betreiber ────────────────────────────────────────────────────────
    await fillIfExists('ui5-input[placeholder*="Vorname" i]', vorname);
    await fillIfExists('ui5-input[placeholder*="Nachname" i]', nachname);
    await fillIfExists('ui5-input[placeholder*="E-Mail" i], input[type="email"]', creds.username);
    await snap('09_betreiber');
    await clickWeiter();

    // ── 8. Installateur ─────────────────────────────────────────────────────
    await fillIfExists('ui5-input[placeholder*="Installateur.*E-Mail" i]', creds.username);
    await snap('10_installateur');
    await clickWeiter();

    // ── 9. Zusammenfassung / Entwurf speichern ──────────────────────────────
    await snap('11_zusammenfassung');

    const saveBtn = page.locator(
      'ui5-button:has-text("Speichern"), ui5-button:has-text("Entwurf"), ' +
      'button:has-text("Speichern"), [class*="sapMBtn"]:has-text("Speichern")'
    ).first();
    if (await saveBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await saveBtn.click();
      await page.waitForTimeout(2000);
    }
    await snap('12_entwurf_gespeichert');

    return { ok: true, draftRef: page.url(), screenshotPath };

  } catch (err) {
    await snap('error');
    return { ok: false, screenshotPath, error: String(err) };
  } finally {
    await browser.close();
  }
}

export const netzeMagdeburgDriver: PortalDriver = {
  netzbetreiber: 'Netze Magdeburg',
  fillDraft: fill,
};
