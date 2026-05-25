// Driver für EMS Energieversorgung Selb (ESM Selb) — Hausanschluss Portal
// Portal: https://netz-portal.esm-selb.de/hap-fe/bo/#/home
//
// Plattform: "Hausanschluss Portal" (ivurz.de) — Angular Material (MDC) SPA
// Hash-Routing SPA: #/home → #/tm/desktop (nach Login)
//
// Login-Flow:
//   1. Startseite: button.login-button klicken
//   2. Angular Material Dialog (mat-dialog-container):
//      E-Mail:   mat-label "E-Mail-Adresse" → input (ID instabil!)
//      Passwort: mat-label "Passwort"        → input (ID instabil!)
//      Submit:   #login
//   3. Nach Login: URL wechselt auf #/tm/desktop

import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import type { Job, PortalCredentials, FillResult, PortalDriver } from '../types.js';
import { config } from '../config.js';

const PORTAL_URL = 'https://netz-portal.esm-selb.de/hap-fe/bo/#/home';

async function fill(job: Job, creds: PortalCredentials): Promise<FillResult> {
  mkdirSync('artifacts', { recursive: true });

  const f = job.fields;
  const hnr = f.street?.match(/\d+\s*[a-zA-Z]?$/)?.[0] ?? '';
  const strasse = f.street?.replace(/\s*\d+\s*[a-zA-Z]?\s*$/, '') ?? '';
  const nameParts = f.name.split(' ');
  const vorname = nameParts.slice(0, -1).join(' ');
  const nachname = nameParts.at(-1) ?? '';

  const browser = await chromium.launch({ headless: config.headless });
  const page = await browser.newPage();

  let screenshotPath: string | undefined;

  try {
    const snap = async (label: string) => {
      const p = `artifacts/ems_${label}.png`;
      await page.screenshot({ path: p, fullPage: true });
      screenshotPath = p;
    };

    async function fillIfExists(sel: string, value: string | number | undefined): Promise<void> {
      if (value === undefined || value === null || value === '') return;
      const el = page.locator(sel).first();
      if (await el.isVisible({ timeout: 1500 }).catch(() => false))
        await el.fill(String(value));
    }

    async function clickIfExists(sel: string): Promise<void> {
      const el = page.locator(sel).first();
      if (await el.isVisible({ timeout: 1500 }).catch(() => false))
        await el.click();
    }

    async function clickWeiter(): Promise<void> {
      const btn = page.locator(
        'button:has-text("Weiter"), button:has-text("Nächster Schritt"), ' +
        'button[matStepperNext], button[type="submit"]:not(:disabled), ' +
        '[class*="next"]:not([disabled])'
      ).first();
      if (await btn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await btn.click();
        await page.waitForTimeout(1500);
      }
    }

    // ── 1. Portal öffnen ──────────────────────────────────────────────────────
    await page.goto(PORTAL_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await snap('01_hap_start');

    // ── 2. Login-Dialog öffnen ────────────────────────────────────────────────
    const loginBtn = page.locator('button.login-button').first();
    await loginBtn.waitFor({ timeout: 10000 });
    await loginBtn.click();

    await page.waitForSelector('mat-dialog-container', { timeout: 8000 });
    await snap('02_login_dialog');

    // ── 3. Credentials eintragen ──────────────────────────────────────────────
    // mat-input-* IDs sind auto-generiert und instabil → per Label selektieren
    await page.getByLabel('E-Mail-Adresse').fill(creds.username);
    await page.getByLabel('Passwort').fill(creds.password);
    await page.locator('#login').click();

    await page.waitForURL(/#\/tm\/desktop/, { timeout: 25000 }).catch(() =>
      page.waitForTimeout(3000)
    );
    await snap('03_nach_login');

    // ── 4. Einspeise-Antrag starten ───────────────────────────────────────────
    const neuerAntragBtn = page.locator(
      'button:has-text("Neue Anfrage"), button:has-text("Antrag stellen"), ' +
      'button:has-text("Neuer Antrag"), a:has-text("Neue Anfrage"), ' +
      'a:has-text("Einspeiseanlage"), button:has-text("Einspeisung")'
    ).first();

    if (await neuerAntragBtn.isVisible({ timeout: 8000 }).catch(() => false)) {
      await neuerAntragBtn.click();
      await page.waitForTimeout(1500);
    }
    await snap('04_antrag_typ');

    const pvOption = page.locator(
      '[class*="card"]:has-text("Einspeisung"), [class*="card"]:has-text("PV-Anlage"), ' +
      'mat-card:has-text("Einspeisung"), mat-card:has-text("PV"), ' +
      'button:has-text("PV-Anlage"), li:has-text("Einspeisung")'
    ).first();
    if (await pvOption.isVisible({ timeout: 4000 }).catch(() => false)) {
      await pvOption.click();
      await page.waitForTimeout(1000);
    }
    await snap('05_formular_start');

    // ── 5. Standort / Adresse ─────────────────────────────────────────────────
    await fillIfExists('[formcontrolname="street"], [name="street"], input[placeholder*="Straße" i]', strasse);
    await fillIfExists('[formcontrolname="houseNumber"], [name="houseNumber"], input[placeholder*="Hausnr" i]', hnr);
    await fillIfExists('[formcontrolname="zipCode"], [name="zipCode"], input[placeholder*="PLZ" i]', f.zip);
    await fillIfExists('[formcontrolname="city"], [name="city"], input[placeholder*="Ort" i]', f.city ?? '');
    await snap('06_standort');
    await clickWeiter();

    // ── 6. Anlagendaten (PV) ──────────────────────────────────────────────────
    await fillIfExists(
      '[formcontrolname="installedPower"], [formcontrolname="powerKwp"], input[placeholder*="kWp" i]',
      f.kwp
    );
    await fillIfExists(
      '[formcontrolname="manufacturer"], input[placeholder*="Hersteller" i]',
      f.moduleType ?? ''
    );
    await fillIfExists(
      '[formcontrolname="inverterPower"], input[placeholder*="Wechselrichter" i]',
      f.inverter ?? ''
    );

    if (f.einspeiseart === 'voll') {
      await clickIfExists('[value="Volleinspeisung"], input[value*="voll" i]');
    } else {
      await clickIfExists('[value="Überschusseinspeisung"], input[value*="über" i]');
    }

    await snap('07_pv_daten');
    await clickWeiter();

    // ── 7. Betreiber / Antragsteller ──────────────────────────────────────────
    await fillIfExists('[formcontrolname="firstName"], [name="firstName"]', vorname);
    await fillIfExists('[formcontrolname="lastName"], [name="lastName"]', nachname);
    await fillIfExists('[formcontrolname="email"], [type="email"]', creds.username);
    await snap('08_betreiber');
    await clickWeiter();

    // ── 8. Installateur ───────────────────────────────────────────────────────
    await fillIfExists('[formcontrolname="installerEmail"], input[placeholder*="Installateur" i]', creds.username);
    await snap('09_installateur');
    await clickWeiter();

    // ── 9. Zusammenfassung / Entwurf speichern ────────────────────────────────
    await snap('10_zusammenfassung');

    const saveBtn = page.locator(
      'button:has-text("Entwurf"), button:has-text("Speichern"), ' +
      'button:has-text("Zwischenspeichern"), button:has-text("Entwurf speichern")'
    ).first();
    if (await saveBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await saveBtn.click();
      await page.waitForTimeout(1500);
    }
    await snap('11_entwurf_gespeichert');

    return {
      ok: true,
      draftRef: page.url(),
      screenshotPath,
    };

  } catch (err) {
    return {
      ok: false,
      screenshotPath,
      error: err instanceof Error ? err.message : String(err),
    };
  } finally {
    await browser.close();
  }
}

export const emsDriver: PortalDriver = {
  netzbetreiber: 'EMS',
  fillDraft: fill,
};
