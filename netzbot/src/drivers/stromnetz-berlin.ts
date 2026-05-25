// Driver für Stromnetz Berlin GmbH — Angular SPA, Azure AD B2C.
// Portal: https://services.stromnetz.berlin/anlagen
// B2C Custom Domain: kundenportal.stromnetz.berlin
// Selektoren verifiziert am 2026-05-20 gegen reference/stromnetz-berlin.js.

import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import type { Job, PortalCredentials, FillResult, PortalDriver } from '../types.js';
import { config } from '../config.js';

const ANLAGEN_URL = 'https://services.stromnetz.berlin/anlagen';

async function fill(job: Job, creds: PortalCredentials): Promise<FillResult> {
  mkdirSync('artifacts', { recursive: true });

  const f = job.fields;
  const hnr     = f.street?.match(/\d+\s*[a-zA-Z]?$/)?.[0] ?? '';
  const strasse = f.street?.replace(/\s*\d+\s*[a-zA-Z]?\s*$/, '') ?? '';
  const nameParts = f.name.split(' ');
  const vorname   = nameParts.slice(0, -1).join(' ');
  const nachname  = nameParts.at(-1) ?? '';
  const kwp       = f.kwp ?? 0;

  const browser = await chromium.launch({ headless: config.headless });
  const page    = await browser.newPage();
  let screenshotPath = '';

  async function snap(label: string): Promise<void> {
    screenshotPath = `artifacts/stromnetz_berlin_${label}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: false }).catch(() => {});
  }

  async function fillIfExists(sel: string, value: string | number | undefined): Promise<void> {
    if (value === undefined || value === null || value === '') return;
    const el = page.locator(sel).first();
    if (await el.isVisible({ timeout: 1500 }).catch(() => false)) {
      await el.fill(String(value));
    }
  }

  async function clickIfExists(sel: string): Promise<void> {
    const el = page.locator(sel).first();
    if (await el.isVisible({ timeout: 1500 }).catch(() => false)) await el.click();
  }

  async function clickWeiter(): Promise<void> {
    const btn = page.locator(
      'button:has-text("Weiter"), button:has-text("Nächster"), ' +
      'button[type="submit"]:not(:disabled), [class*="next"]'
    ).first();
    if (await btn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await btn.click();
      await page.waitForTimeout(1500);
    }
  }

  try {
    // ── 1. Login via Azure B2C ──────────────────────────────────────────────
    await page.goto(ANLAGEN_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await snap('01_b2c_login');

    // WICHTIG: #next verwenden — NICHT button[type="submit"] (2 Buttons vorhanden!)
    const signInName = page.locator('#signInName');
    await signInName.waitFor({ timeout: 15000 });
    await signInName.fill(creds.username);
    await page.locator('#password').fill(creds.password);
    await page.locator('#next').click();

    await page.waitForURL(/services\.stromnetz\.berlin/, { timeout: 30000 })
      .catch(() => page.waitForTimeout(5000));
    await snap('02_nach_login');

    // ── 2. Zur Anlagenverwaltung ────────────────────────────────────────────
    await page.goto(ANLAGEN_URL, { waitUntil: 'networkidle', timeout: 25000 });
    await snap('03_anlagen_liste');

    // ── 3. Neue Anlage anmelden ─────────────────────────────────────────────
    const anlageBtn = page.locator(
      'button:has-text("Anlage anmelden"), a:has-text("Anlage anmelden"), ' +
      'button:has-text("Neue Anlage"), button:has-text("Neuen Antrag")'
    ).first();
    await anlageBtn.waitFor({ timeout: 10000 });
    await anlageBtn.click();
    await page.waitForTimeout(1500);
    await snap('04_antrag_typ');

    // ── 4. Anlagentyp je nach Leistung ──────────────────────────────────────
    const typLabel = kwp <= 30
      ? /bis 30 kVA|bis 30|kleinere|PV.*30/i
      : /30 kVA bis 100|größere|PV.*100/i;

    const typCard = page.locator('[class*="card"], [class*="option"], button, a')
      .filter({ hasText: typLabel }).first();
    if (await typCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      await typCard.click();
      await page.waitForTimeout(1000);
    }
    await snap('05_formular_start');

    // ── 5. Standort / Adresse ───────────────────────────────────────────────
    await fillIfExists('[formcontrolname="street"], [name="street"], input[placeholder*="Straße"]', strasse);
    await fillIfExists('[formcontrolname="houseNumber"], [name="houseNumber"], input[placeholder*="Hausnr"]', hnr);
    await fillIfExists('[formcontrolname="zipCode"], [name="zipCode"], input[placeholder*="PLZ"]', f.zip);
    await fillIfExists('[formcontrolname="city"], [name="city"], input[placeholder*="Ort"]', f.city);
    await snap('06_adresse');
    await clickWeiter();

    // ── 6. PV-Daten ─────────────────────────────────────────────────────────
    await fillIfExists('[formcontrolname="powerKwp"], [name="powerKwp"], input[placeholder*="kWp"]', f.kwp);
    await fillIfExists('[formcontrolname="inverterPower"], input[placeholder*="Wechselrichter"]', f.kwp);

    if (f.einspeiseart === 'voll') {
      await clickIfExists('[value="Volleinspeisung"], [formcontrolname="feedInType"] input[value*="voll" i]');
    } else {
      await clickIfExists('[value="Überschusseinspeisung"], [formcontrolname="feedInType"] input[value*="über" i]');
    }
    await snap('07_pv_daten');
    await clickWeiter();

    // ── 7. Betreiber ────────────────────────────────────────────────────────
    await fillIfExists('[formcontrolname="firstName"], [name="firstName"]', vorname);
    await fillIfExists('[formcontrolname="lastName"], [name="lastName"]', nachname);
    await fillIfExists('[formcontrolname="email"], [type="email"]', creds.username);
    await snap('08_betreiber');
    await clickWeiter();

    // ── 8. Installateur ─────────────────────────────────────────────────────
    await fillIfExists('[formcontrolname="installerEmail"], input[placeholder*="Installateur"]', creds.username);
    await snap('09_installateur');
    await clickWeiter();

    // ── 9. Zusammenfassung / Entwurf speichern ──────────────────────────────
    await snap('10_zusammenfassung');

    const saveBtn = page.locator(
      'button:has-text("Entwurf"), button:has-text("Speichern"), button:has-text("Zwischenspeichern")'
    ).first();
    if (await saveBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await saveBtn.click();
      await page.waitForTimeout(1500);
    }
    await snap('11_entwurf_gespeichert');

    return { ok: true, draftRef: page.url(), screenshotPath };

  } catch (err) {
    await snap('error');
    return { ok: false, screenshotPath, error: String(err) };
  } finally {
    await browser.close();
  }
}

export const stromnetzBerlinDriver: PortalDriver = {
  netzbetreiber: 'Stromnetz Berlin',
  fillDraft: fill,
};
