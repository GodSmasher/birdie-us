// Driver für Stadtwerke Delitzsch GmbH — X4 / Keycloak Portal
// Portal: https://hap.dlz.ivurz.de/X4/webapp/Installateurportal/Module/Dashboard
//
// Plattform: X4 Mobile App (ivurz.de) — SPA, Auth über Keycloak (Realm: X4Realm)
//
// Login-Flow:
//   1. Portal-URL → Redirect zu Keycloak
//   2. Keycloak (stabile IDs):
//      Benutzername: #username
//      Passwort:     #password
//      Submit:       #kc-login
//   3. Nach Login: Redirect zurück zu /X4/webapp/Installateurportal/Module/Dashboard

import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import type { Job, PortalCredentials, FillResult, PortalDriver } from '../types.js';
import { config } from '../config.js';

const PORTAL_URL = 'https://hap.dlz.ivurz.de/X4/webapp/Installateurportal/Module/Dashboard';

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
      const p = `artifacts/sw-delitzsch_${label}.png`;
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
        'button:has-text("Weiter"), button:has-text("Nächster"), ' +
        'button[type="submit"]:not(:disabled), a:has-text("Weiter"), ' +
        '[class*="next"]:not([disabled])'
      ).first();
      if (await btn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await btn.click();
        await page.waitForTimeout(1500);
      }
    }

    // ── 1. Portal öffnen → Keycloak-Redirect ─────────────────────────────────
    await page.goto(PORTAL_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await snap('01_keycloak_login');

    // ── 2. Keycloak-Login (X4Realm) ───────────────────────────────────────────
    const userField = page.locator('#username');
    await userField.waitFor({ timeout: 10000 });
    await userField.fill(creds.username);
    await page.locator('#password').fill(creds.password);
    await page.locator('#kc-login').click();

    await page.waitForURL(/hap\.dlz\.ivurz\.de\/X4/, { timeout: 25000 }).catch(() =>
      page.waitForTimeout(3000)
    );
    await snap('02_nach_login');

    // ── 3. Dashboard → Einspeise-Antrag starten ──────────────────────────────
    await page.waitForSelector(
      '[class*="dashboard"], [class*="Dashboard"], h1, nav, .btn',
      { timeout: 10000 }
    ).catch(() => {});

    const antragBtn = page.locator(
      'button:has-text("Neue Anfrage"), button:has-text("Antrag stellen"), ' +
      'button:has-text("Neuer Antrag"), a:has-text("Neue Anfrage"), ' +
      'a:has-text("Einspeiseanlage"), button:has-text("Einspeisung")'
    ).first();

    if (await antragBtn.isVisible({ timeout: 8000 }).catch(() => false)) {
      await antragBtn.click();
      await page.waitForTimeout(1500);
    }
    await snap('03_antrag_typ');

    const pvOption = page.locator(
      '[class*="card"]:has-text("Einspeisung"), [class*="card"]:has-text("PV"), ' +
      'mat-card:has-text("Einspeisung"), button:has-text("PV-Anlage"), ' +
      'li:has-text("Einspeisung")'
    ).first();
    if (await pvOption.isVisible({ timeout: 4000 }).catch(() => false)) {
      await pvOption.click();
      await page.waitForTimeout(1000);
    }
    await snap('04_formular_start');

    // ── 4. Standort / Adresse ─────────────────────────────────────────────────
    await fillIfExists('[formcontrolname="street"], input[name="street"], input[placeholder*="Straße" i]', strasse);
    await fillIfExists('[formcontrolname="houseNumber"], input[name="houseNumber"], input[placeholder*="Hausnr" i]', hnr);
    await fillIfExists('[formcontrolname="zipCode"], input[name="zipCode"], input[placeholder*="PLZ" i]', f.zip);
    await fillIfExists('[formcontrolname="city"], input[name="city"], input[placeholder*="Ort" i]', f.city ?? '');
    await snap('05_standort');
    await clickWeiter();

    // ── 5. PV-Technische Daten ────────────────────────────────────────────────
    await fillIfExists(
      '[formcontrolname="powerKwp"], input[placeholder*="kWp" i]',
      f.kwp
    );
    await fillIfExists(
      '[formcontrolname="manufacturer"], input[placeholder*="Hersteller" i]',
      f.moduleType ?? ''
    );

    if (f.einspeiseart === 'voll') {
      await clickIfExists('input[value="Volleinspeisung"], [formcontrolname="feedInType"] input[value*="voll" i]');
    } else {
      await clickIfExists('input[value="Überschusseinspeisung"], [formcontrolname="feedInType"] input[value*="über" i]');
    }

    await snap('06_pv_daten');
    await clickWeiter();

    // ── 6. Betreiber / Antragsteller ──────────────────────────────────────────
    await fillIfExists('[formcontrolname="firstName"], input[name="firstName"]', vorname);
    await fillIfExists('[formcontrolname="lastName"], input[name="lastName"]', nachname);
    await fillIfExists('[formcontrolname="email"], input[type="email"]', creds.username);
    await snap('07_betreiber');
    await clickWeiter();

    // ── 7. Installateur ───────────────────────────────────────────────────────
    await fillIfExists('[formcontrolname="installerEmail"]', creds.username);
    await snap('08_installateur');
    await clickWeiter();

    // ── 8. Zusammenfassung / Entwurf speichern ────────────────────────────────
    await snap('09_zusammenfassung');

    const saveBtn = page.locator(
      'button:has-text("Entwurf"), button:has-text("Speichern"), ' +
      'button:has-text("Zwischenspeichern"), button:has-text("Entwurf speichern")'
    ).first();
    if (await saveBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await saveBtn.click();
      await page.waitForTimeout(1500);
    }
    await snap('10_entwurf_gespeichert');

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

export const swDelitzschDriver: PortalDriver = {
  netzbetreiber: 'SW Delitzsch',
  fillDraft: fill,
};
