// _kundenmarktplatz.ts — Gemeinsamer Filler für Kundenmarktplatz-Portale (Simplifier/SAP UI5)
//
// Portale:
//   badenovaNETZE → netzportal.badenovanetze.de/appDirect/Kundenmarktplatz/index.html
//   GGEW          → ggew.simplifier.cloud/appDirect/Kundenmarktplatz/index.html
//   iNetz         → (Kundenmarktplatz, URL zu klären)
//
// Plattform: Simplifier / SAP UI5 (SAPUI5)
//   Login (Modal-Dialog):
//     Benutzername: #Dialogs--Input_LoginUsername-inner
//     Passwort:     #Dialogs--Input_LoginPassword-inner
//     Submit:       #Dialogs--Button_DialogLogin
//   Navigation:
//     Erzeugungsanlage: #Button_1 oder a:has-text("Erzeugungsanlage")
//     Niederspannung → Anmeldung → "ZUM PRODUKT" → "ANTRAG AUSFÜLLEN"

import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import type { Job, PortalCredentials, FillResult } from '../types.js';
import { config } from '../config.js';

export async function fillKundenmarktplatz(job: Job, creds: PortalCredentials): Promise<FillResult> {
  mkdirSync('artifacts', { recursive: true });

  const f = job.fields;
  const hnr     = f.street?.match(/\d+\s*[a-zA-Z]?$/)?.[0] ?? '';
  const strasse = f.street?.replace(/\s*\d+\s*[a-zA-Z]?\s*$/, '') ?? '';
  const nameParts = f.name.split(' ');
  const vorname   = nameParts.slice(0, -1).join(' ');
  const nachname  = nameParts.at(-1) ?? '';

  const portalUrl = creds.portalUrl;
  const slug = new URL(portalUrl).hostname.replace(/\./g, '_');

  const browser = await chromium.launch({ headless: config.headless });
  const page    = await browser.newPage();
  let screenshotPath = '';

  async function snap(label: string): Promise<void> {
    screenshotPath = `artifacts/kmp_${slug}_${label}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: false }).catch(() => {});
  }

  async function fillIfVisible(sel: string, value: string | number | undefined): Promise<void> {
    if (value === undefined || value === null || value === '') return;
    const el = page.locator(sel).first();
    if (await el.isVisible({ timeout: 2000 }).catch(() => false)) {
      await el.fill(String(value));
    }
  }

  try {
    // ── 1. Portal öffnen ────────────────────────────────────────────────────
    await page.goto(portalUrl, { waitUntil: 'networkidle', timeout: 40000 });
    await snap('01_startseite');

    // Cookie-Banner wegklicken
    const cookieBtn = page.locator('button:has-text("Alle ablehnen"), button:has-text("ablehnen")').first();
    if (await cookieBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
      await cookieBtn.click();
      await page.waitForTimeout(1000);
    }

    // ── 2. Navigation: Erzeugungsanlage → Niederspannung → Anmeldung ────────
    const erzeugungBtn = page.locator(
      '#Button_1, a:has-text("Erzeugungsanlage"), button:has-text("Erzeugungsanlage")'
    ).first();
    await erzeugungBtn.waitFor({ timeout: 10000 });
    await erzeugungBtn.click();
    await page.waitForTimeout(2000);
    await snap('02_erzeugungsanlage');

    // Niederspannung → "ZUR ÜBERSICHT"
    const nsBtn = page.locator(
      'button:has-text("ZUR ÜBERSICHT"), a:has-text("ZUR ÜBERSICHT")'
    ).first();
    if (await nsBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await nsBtn.click();
      await page.waitForTimeout(2000);
    }
    await snap('03_niederspannung');

    // Anmeldung → "ZUM PRODUKT"
    const produktBtn = page.locator(
      'button:has-text("ZUM PRODUKT"), a:has-text("ZUM PRODUKT")'
    ).first();
    if (await produktBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await produktBtn.click();
      await page.waitForTimeout(2000);
    }
    await snap('04_produkt');

    // "ANTRAG AUSFÜLLEN" → Login-Dialog
    const antragBtn = page.locator(
      'button:has-text("ANTRAG AUSFÜLLEN"), a:has-text("ANTRAG AUSFÜLLEN")'
    ).first();
    if (await antragBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await antragBtn.click();
      await page.waitForTimeout(2000);
    }
    await snap('05_login_dialog');

    // ── 3. Login (Modal-Dialog) ─────────────────────────────────────────────
    const userField = page.locator('#Dialogs--Input_LoginUsername-inner');
    await userField.waitFor({ timeout: 10000 });
    await userField.fill(creds.username);
    await page.locator('#Dialogs--Input_LoginPassword-inner').fill(creds.password);
    await page.locator('#Dialogs--Button_DialogLogin').click();
    await page.waitForTimeout(3000);
    await snap('06_nach_login');

    // ── 4. Formular ausfüllen (generisch — Felder per Placeholder/Label) ────
    // Nach Login wird typischerweise direkt das Formular geladen
    await page.waitForTimeout(2000);
    await snap('07_formular');

    // Standort/Adresse
    await fillIfVisible('input[placeholder*="Straße" i], input[aria-label*="Straße" i]', strasse);
    await fillIfVisible('input[placeholder*="Hausnr" i], input[aria-label*="Hausnr" i]', hnr);
    await fillIfVisible('input[placeholder*="PLZ" i], input[aria-label*="PLZ" i]', f.zip);
    await fillIfVisible('input[placeholder*="Ort" i], input[aria-label*="Ort" i]', f.city);

    // Betreiber
    await fillIfVisible('input[placeholder*="Vorname" i], input[aria-label*="Vorname" i]', vorname);
    await fillIfVisible('input[placeholder*="Nachname" i], input[aria-label*="Nachname" i]', nachname);
    await fillIfVisible('input[placeholder*="E-Mail" i], input[aria-label*="E-Mail" i]', creds.username);

    // PV-Daten
    await fillIfVisible('input[placeholder*="kWp" i], input[aria-label*="Leistung" i]', f.kwp);

    await snap('08_formular_ausgefuellt');

    // Weiter-Button klicken (typisch: "Weiter" oder Pfeil)
    const weiterBtn = page.locator(
      'button:has-text("Weiter"), button:has-text("WEITER"), ' +
      'button[class*="next" i], button:has-text("Nächster Schritt")'
    ).first();
    if (await weiterBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await weiterBtn.click();
      await page.waitForTimeout(2000);
    }

    await snap('09_entwurf');

    return { ok: true, draftRef: page.url(), screenshotPath };

  } catch (err) {
    await snap('error');
    return { ok: false, screenshotPath, error: String(err) };
  } finally {
    await browser.close();
  }
}
