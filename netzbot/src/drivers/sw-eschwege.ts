// Driver für Stadtwerke Eschwege GmbH — Weblication CMS (PHP)
// Portal: https://www.stadtwerke-eschwege.de/swe/strom/netzanschluesse/installateurportal/index.php
//
// Login-Flow:
//   Cookie-Banner: #cookieNoticeDeclineCloser — MUSS zuerst weggeklickt werden!
//   Benutzername:  #usernameLogin
//   Passwort:      #pwdLogin
//   Submit:        button.buttonSubmit  ← NICHT button[type="submit"] — mehrere vorhanden!

import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import type { Job, PortalCredentials, FillResult, PortalDriver } from '../types.js';
import { config } from '../config.js';

const PORTAL_URL =
  'https://www.stadtwerke-eschwege.de/swe/strom/netzanschluesse/installateurportal/index.php';

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
      const p = `artifacts/sw-eschwege_${label}.png`;
      await page.screenshot({ path: p, fullPage: true });
      screenshotPath = p;
    };

    async function fillField(selectors: string | string[], value: string | number | undefined): Promise<void> {
      if (value === undefined || value === null || value === '') return;
      for (const sel of Array.isArray(selectors) ? selectors : [selectors]) {
        const el = page.locator(sel).first();
        if (await el.isVisible({ timeout: 1500 }).catch(() => false)) {
          await el.fill(String(value));
          return;
        }
      }
    }

    async function clickWeiter(): Promise<void> {
      const btn = page.locator(
        'button:has-text("Weiter"), button[type="submit"]:has-text("Weiter"), ' +
        'input[type="submit"][value="Weiter"], a:has-text("Weiter")'
      ).first();
      if (await btn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await btn.click();
        await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 20000 }).catch(() =>
          page.waitForTimeout(2000)
        );
      }
    }

    // ── 1. Login ──────────────────────────────────────────────────────────────
    await page.goto(PORTAL_URL, { waitUntil: 'networkidle', timeout: 30000 });

    // Cookie-Banner wegklicken — blockiert alle Klicks wenn sichtbar!
    const cookieDecline = page.locator('#cookieNoticeDeclineCloser');
    if (await cookieDecline.isVisible({ timeout: 4000 }).catch(() => false)) {
      await cookieDecline.click();
      await page.waitForTimeout(800);
    }
    const cookieAccept = page.locator('#cookieNoticeAcceptCloser');
    if (await cookieAccept.isVisible({ timeout: 2000 }).catch(() => false)) {
      await cookieAccept.click();
      await page.waitForTimeout(600);
    }

    await snap('01_login');

    await page.fill('#usernameLogin', creds.username);
    await page.fill('#pwdLogin', creds.password);
    await page.click('button.buttonSubmit');
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 25000 });
    await snap('02_nach_login');

    // ── 2. Antrag starten ─────────────────────────────────────────────────────
    const pvLink = page.locator(
      'a:has-text("Einspeiseanlage"), a:has-text("PV-Anlage"), a:has-text("EEG"), ' +
      'a:has-text("neuen Antrag"), button:has-text("Einspeiser"), ' +
      'a:has-text("Anmeldung"), a:has-text("Neuanmeldung")'
    ).first();

    if (await pvLink.isVisible({ timeout: 8000 }).catch(() => false)) {
      await pvLink.click();
      await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 20000 }).catch(() =>
        page.waitForTimeout(2000)
      );
    }
    await snap('03_antrag_start');

    // ── 3. Betreiberdaten ─────────────────────────────────────────────────────
    await fillField('[name*="vorname"], [name*="firstName"], input[placeholder*="Vorname"]', vorname);
    await fillField('[name*="nachname"], [name*="lastName"], input[placeholder*="Nachname"]', nachname);
    await fillField('[name*="strasse"], [name*="street"], input[placeholder*="Straße"]', strasse);
    await fillField('[name*="hausnummer"], [name*="houseNumber"], input[placeholder*="Hausnr"]', hnr);
    await fillField('[name*="plz"], [name*="zipCode"], input[placeholder*="PLZ"]', f.zip);
    await fillField('[name*="ort"], [name*="city"], input[placeholder*="Ort"]', f.city ?? '');
    await fillField('[name*="email"], input[type="email"]', creds.username);
    await snap('04_betreiber');
    await clickWeiter();

    // ── 4. Standortdaten ──────────────────────────────────────────────────────
    await fillField('[name*="anlagenStrasse"], [name*="anlage_strasse"]', strasse);
    await fillField('[name*="anlagenHausnr"], [name*="anlage_hausnr"]', hnr);
    await fillField('[name*="anlagenPlz"], [name*="anlage_plz"]', f.zip);
    await fillField('[name*="anlagenOrt"], [name*="anlage_ort"]', f.city ?? '');
    await snap('05_standort');
    await clickWeiter();

    // ── 5. PV-Technische Daten ────────────────────────────────────────────────
    await fillField(
      '[name*="leistung"], [name*="power"], input[placeholder*="kWp"], [name*="pvLeistung"]',
      f.kwp
    );
    await fillField(
      '[name*="modulTyp"], [name*="moduleType"]',
      f.moduleType ?? ''
    );
    await fillField(
      '[name*="modulAnzahl"], [name*="moduleCount"]',
      f.moduleCount
    );
    await fillField(
      '[name*="wrTyp"], [name*="inverterType"]',
      f.inverter ?? ''
    );
    await snap('06_pv_daten');
    await clickWeiter();

    // ── 6. Installateurdaten ──────────────────────────────────────────────────
    await fillField('[name*="installateurEmail"], [name*="installerEmail"]', creds.username);
    await snap('07_installateur');
    await clickWeiter();

    // ── 7. Zusammenfassung / Speichern ────────────────────────────────────────
    await snap('08_zusammenfassung');

    const saveBtn = page.locator(
      'button:has-text("Speichern"), button:has-text("Zwischenspeichern"), ' +
      'input[value*="Speichern"], button:has-text("Entwurf")'
    ).first();
    if (await saveBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await saveBtn.click();
      await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 20000 }).catch(() =>
        page.waitForTimeout(2000)
      );
    }
    await snap('09_gespeichert');

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

export const swEschwegeDriver: PortalDriver = {
  netzbetreiber: 'SW Eschwege',
  fillDraft: fill,
};
