// Driver für TEN Thüringer Energienetze — Azure AD B2C Portal.
// Portal: https://www.ten-netzkundenportal.de/uebersicht
// B2C-Policy: tennkpprod.b2clogin.com/.../B2C_1A_TEN_NKP_MFA_Signin
// Selektoren verifiziert am 2026-05-20 gegen reference/ten.js.

import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import type { Job, PortalCredentials, FillResult, PortalDriver } from '../types.js';
import { config } from '../config.js';

const PORTAL_URL      = 'https://www.ten-netzkundenportal.de/uebersicht';
const EINSPEISUNG_URL = 'https://www.ten-netzkundenportal.de/einspeisung/antragsstrecke/startseite';

function plantSizeValue(kwp: number | undefined): string {
  const k = kwp ?? 0;
  if (k <= 10)  return 'smallest';
  if (k <= 30)  return 'small';
  if (k <= 100) return 'medium';
  return 'big';
}

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
  let currentStep = 'init';

  async function snap(label: string): Promise<void> {
    screenshotPath = `artifacts/ten_${label}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: false }).catch(() => {});
  }

  async function fillField(sel: string, value: string | number | undefined): Promise<void> {
    if (value === undefined || value === null || value === '') return;
    const el = page.locator(sel).first();
    if (await el.isVisible({ timeout: 2000 }).catch(() => false)) {
      await el.click();
      await el.fill(String(value));
      // Trigger blur to activate validation
      await el.evaluate((e) => e.dispatchEvent(new Event('blur', { bubbles: true })));
      await page.waitForTimeout(300);
    }
  }

  async function clickIfExists(sel: string): Promise<void> {
    const el = page.locator(sel).first();
    if (await el.isVisible({ timeout: 1500 }).catch(() => false)) await el.click();
  }

  /** Wait for "Weiter" to become enabled (validation pass), then click.
   *  If it stays disabled, capture the validation error from the page. */
  async function clickWeiter(stepLabel: string): Promise<void> {
    currentStep = stepLabel;
    const btn = page.locator('#button-Weiter').first();

    // Wait for button to exist
    if (!await btn.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Fallback selectors
      const alt = page.locator('button:has-text("Weiter")').first();
      if (await alt.isVisible({ timeout: 2000 }).catch(() => false)) {
        await alt.click();
        await page.waitForTimeout(1500);
        return;
      }
      throw new Error(`[${stepLabel}] Weiter-Button nicht gefunden`);
    }

    // Wait up to 15s for button to become enabled (portal validates async)
    for (let i = 0; i < 30; i++) {
      const disabled = await btn.getAttribute('disabled');
      if (disabled === null) break;
      await page.waitForTimeout(500);
    }

    // Check if still disabled
    const stillDisabled = await btn.getAttribute('disabled');
    if (stillDisabled !== null) {
      // Capture validation errors shown on the page
      const errors = await page.locator(
        '.error-message, .validation-error, [class*="error"], [class*="invalid"], ' +
        '.ten-error, .field-error, [role="alert"]'
      ).allTextContents().catch(() => []);
      const uniqueErrors = [...new Set(errors.map((e) => e.trim()).filter(Boolean))];
      await snap(`${stepLabel}_validation_error`);
      const errMsg = uniqueErrors.length > 0
        ? `Validierungsfehler: ${uniqueErrors.join(' | ')}`
        : 'Weiter-Button bleibt disabled — Pflichtfeld fehlt oder Validierung fehlgeschlagen';
      throw new Error(`[${stepLabel}] ${errMsg}`);
    }

    await btn.click();
    await page.waitForTimeout(1500);
  }

  try {
    // ── 1. Portal öffnen → Azure B2C Redirect ──────────────────────────────
    currentStep = 'login';
    await page.goto(PORTAL_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await snap('01_b2c_login');

    const emailField = page.locator('input[placeholder="E-Mail-Adresse"]');
    await emailField.waitFor({ timeout: 15000 });
    await emailField.fill(creds.username);
    await page.locator('input[placeholder="Passwort"]').fill(creds.password);
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(3000);
    await snap('02_nach_passwort');

    // ── 2. MFA (optional) ──────────────────────────────────────────────────
    currentStep = 'mfa';
    const mfaField = page.locator(
      'input[autocomplete="one-time-code"], input[placeholder*="Code"], ' +
      'input[placeholder*="OTP"], input[placeholder*="Bestätigungscode"]'
    );
    if (await mfaField.isVisible({ timeout: 8000 }).catch(() => false)) {
      await snap('03_mfa_required');
      await page.waitForURL(/ten-netzkundenportal\.de/, { timeout: 35000 }).catch(() => {});
      if (page.url().includes('b2clogin.com')) {
        return {
          ok: false, screenshotPath,
          error: '[mfa] MFA-Code erforderlich — bitte Konto-MFA deaktivieren oder manuell eingeben.',
        };
      }
    } else {
      await page.waitForURL(/ten-netzkundenportal\.de/, { timeout: 25000 }).catch(() => {});
    }
    await snap('03_nach_login');

    // ── 3. Einspeisung-Antragsstrecke ───────────────────────────────────────
    currentStep = 'start';
    await page.goto(EINSPEISUNG_URL, { waitUntil: 'networkidle', timeout: 25000 });
    await snap('04_einspeisung_start');

    const losGehtBtn = page.locator('button:has-text("Los geht"), a:has-text("Los geht")').first();
    if (await losGehtBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await losGehtBtn.click();
      await page.waitForTimeout(1500);
    }
    await snap('05_step1_start');

    // ── Step 1: Antragsteller-Typ + Anlagenart + Leistungsbereich ──────────
    currentStep = 'step1_typ';
    await clickIfExists('#radiobutton-customerType-installer');
    await page.waitForTimeout(400);
    await clickIfExists('#radiobutton-service-newConstruction');
    await page.waitForTimeout(400);

    const plantSizeEl = page.locator('#dropdown-plantSize');
    if (await plantSizeEl.isVisible({ timeout: 2000 }).catch(() => false)) {
      await plantSizeEl.selectOption(plantSizeValue(f.kwp));
      await page.waitForTimeout(400);
    }
    await snap('06_step1_fertig');
    await clickWeiter('step1');
    await snap('07_step2_start');

    // ── Step 2: Standort ────────────────────────────────────────────────────
    currentStep = 'step2_adresse';
    await fillField('input[id*="street"], input[name*="street"], input[placeholder*="Straße" i]', strasse);
    await fillField('input[id*="houseNumber"], input[name*="houseNumber"], input[placeholder*="Hausnr" i]', hnr);
    await fillField('input[id*="zipCode"], input[name*="zipCode"], input[placeholder*="PLZ" i]', f.zip);
    await fillField('input[id*="city"], input[name*="city"], input[placeholder*="Ort" i]', f.city);
    await snap('08_step2_adresse');
    await clickWeiter('step2_adresse');

    // ── Step 3: PV-Technische Angaben ───────────────────────────────────────
    currentStep = 'step3_pv';
    await fillField('input[id*="power"], input[id*="kwp"], input[placeholder*="kWp" i]', f.kwp);
    await fillField('input[id*="inverter"], input[placeholder*="Wechselrichter" i]', f.inverter);

    if (f.einspeiseart === 'voll') {
      await clickIfExists('[id*="Volleinspeisung"], [id*="full"]');
    } else {
      await clickIfExists('[id*="Überschuss"], [id*="overflow"], [id*="excess"]');
    }
    await snap('09_step3_pv');
    await clickWeiter('step3_pv');

    // ── Step 4: Betreiber ───────────────────────────────────────────────────
    currentStep = 'step4_betreiber';
    await fillField('input[id*="firstName"], input[name*="firstName"]', vorname);
    await fillField('input[id*="lastName"], input[name*="lastName"]', nachname);
    await fillField('input[type="email"], input[id*="email"]', creds.username);
    await snap('10_step4_betreiber');
    await clickWeiter('step4_betreiber');

    // ── Step 5: Installateur ────────────────────────────────────────────────
    currentStep = 'step5_installateur';
    await fillField('input[id*="installerEmail"]', creds.username);
    await snap('11_step5_installateur');
    await clickWeiter('step5_installateur');

    // ── Step 6+: Datenschutz-Checkboxen ────────────────────────────────────
    currentStep = 'step6_datenschutz';
    await snap('12_step6_weitere');
    const checkboxes = page.locator('input[type="checkbox"]:not(:checked)');
    const cbCount = await checkboxes.count();
    for (let i = 0; i < cbCount; i++) {
      await checkboxes.nth(i).click().catch(() => {});
      await page.waitForTimeout(200);
    }
    await clickWeiter('step6_datenschutz');
    await snap('13_zusammenfassung');

    // ── Entwurf speichern ──────────────────────────────────────────────────
    currentStep = 'save';
    const saveBtn = page.locator(
      'button:has-text("Entwurf"), button:has-text("Speichern"), ' +
      'button:has-text("Zwischenspeichern"), #button-Speichern'
    ).first();
    if (await saveBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await saveBtn.click();
      await page.waitForTimeout(1500);
    }
    await snap('14_entwurf_gespeichert');

    return { ok: true, draftRef: page.url(), screenshotPath };

  } catch (err) {
    await snap(`error_${currentStep}`);
    return { ok: false, screenshotPath, error: `[${currentStep}] ${String(err).slice(0, 500)}` };
  } finally {
    await browser.close();
  }
}

export const tenDriver: PortalDriver = {
  netzbetreiber: 'TEN Thüringer Energienetze',
  fillDraft: fill,
};
