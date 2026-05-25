// Driver für Stadtwerke Lutherstadt Wittenberg — Custom React SPA.
// Portal: https://netzportal.stadtwerke-wittenberg.de/kundenportal
// AJAX-Login: URL ändert sich NICHT nach Login — kein waitForNavigation!
// Selektoren verifiziert am 2026-05-20 gegen reference/sw-lutherstadt.js.

import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import type { Job, PortalCredentials, FillResult, PortalDriver } from '../types.js';
import { config } from '../config.js';

const PORTAL_URL = 'https://netzportal.stadtwerke-wittenberg.de/kundenportal';

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
    screenshotPath = `artifacts/sw_lutherstadt_${label}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: false }).catch(() => {});
  }

  async function fillField(selectors: string | string[], value: string | number | undefined): Promise<void> {
    if (value === undefined || value === null || value === '') return;
    const sels = Array.isArray(selectors) ? selectors : [selectors];
    for (const sel of sels) {
      const el = page.locator(sel).first();
      if (await el.isVisible({ timeout: 1500 }).catch(() => false)) {
        await el.fill(String(value));
        return;
      }
    }
  }

  async function clickWeiter(): Promise<void> {
    const btn = page.locator(
      'button:has-text("Weiter"), button:has-text("Nächste"), ' +
      'button[type="submit"]:has-text("Weiter"), input[type="submit"][value="Weiter"], ' +
      'a:has-text("Weiter"), [class*="next"]:not(:disabled)'
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

    // ── 2. AJAX-Login (kein waitForNavigation — SPA navigiert per XHR!) ────
    const usernameField = page.locator('#login-username');
    await usernameField.waitFor({ timeout: 12000 });
    await usernameField.fill(creds.username);
    await page.locator('#login-password').fill(creds.password);
    await page.locator('#login-submit').click();

    await page.waitForTimeout(3000);
    await page.waitForSelector(
      '[class*="dashboard"], [class*="Dashboard"], [class*="antrag"], h1, nav',
      { timeout: 15000 }
    ).catch(() => {});
    await snap('02_nach_login');

    // ── 3. Neuen Einspeise-Antrag starten ───────────────────────────────────
    const antragBtn = page.locator(
      'a:has-text("Einspeiseanlage"), a:has-text("Einspeisung"), ' +
      'button:has-text("Einspeisung"), a:has-text("Neuen Antrag"), ' +
      'button:has-text("Neuen Antrag"), a:has-text("PV-Anlage"), ' +
      'button:has-text("Anmelden"), a:has-text("Anmeldung")'
    ).first();

    if (await antragBtn.isVisible({ timeout: 6000 }).catch(() => false)) {
      await antragBtn.click();
      await page.waitForTimeout(2000);
    }
    await snap('03_antrag_start');

    // ── 4. Betreiber-/Kontaktdaten ──────────────────────────────────────────
    await fillField('input[name*="vorname" i], input[name*="firstname" i], input[placeholder*="Vorname" i]', vorname);
    await fillField('input[name*="nachname" i], input[name*="lastname" i], input[placeholder*="Nachname" i]', nachname);
    await fillField('input[name*="strasse" i], input[name*="street" i], input[placeholder*="Straße" i]', strasse);
    await fillField('input[name*="hausnummer" i], input[name*="housenumber" i], input[placeholder*="Hausnr" i]', hnr);
    await fillField('input[name*="plz" i], input[name*="zipcode" i], input[placeholder*="PLZ" i]', f.zip);
    await fillField('input[name*="ort" i], input[name*="city" i], input[placeholder*="Ort" i]', f.city);
    await fillField('input[type="email"], input[name*="email" i]', creds.username);
    await snap('04_betreiber');
    await clickWeiter();

    // ── 5. Anlagenstandort ──────────────────────────────────────────────────
    await fillField('input[name*="anlage.*strasse" i], input[name*="anlagen.*street" i]', strasse);
    await fillField('input[name*="anlage.*hausnr" i], input[name*="anlagen.*house" i]', hnr);
    await fillField('input[name*="anlage.*plz" i], input[name*="anlagen.*zip" i]', f.zip);
    await fillField('input[name*="anlage.*ort" i], input[name*="anlagen.*city" i]', f.city);
    await snap('05_standort');
    await clickWeiter();

    // ── 6. PV-Technische Daten ──────────────────────────────────────────────
    await fillField(
      'input[name*="leistung" i], input[name*="kwp" i], input[placeholder*="kWp" i]',
      f.kwp
    );
    await fillField(
      'input[name*="modultyp" i], input[name*="moduletype" i]',
      f.moduleType ?? ''
    );
    await fillField(
      'input[name*="anzahl" i], input[name*="count" i]',
      f.moduleCount ?? ''
    );
    await snap('06_pv_daten');
    await clickWeiter();

    // ── 7. Installateurdaten ────────────────────────────────────────────────
    await fillField(
      'input[name*="installateur.*email" i], input[name*="installer.*email" i]',
      creds.username
    );
    await snap('07_installateur');
    await clickWeiter();

    // ── 8. Zusammenfassung / Entwurf speichern ──────────────────────────────
    await snap('08_zusammenfassung');

    const saveBtn = page.locator(
      'button:has-text("Speichern"), button:has-text("Zwischenspeichern"), ' +
      'button:has-text("Entwurf"), input[value*="Speichern" i]'
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

export const swLutherstadtDriver: PortalDriver = {
  netzbetreiber: 'SW Lutherstadt',
  fillDraft: fill,
};
