// Driver für MITNETZ STROM (envia) — Voltas Region (Sachsen). PROTOTYP.
//
// Die konkreten Selektoren unten sind PLATZHALTER (TODO): das echte Portal-DOM muss
// einmal manuell aufgenommen werden (Playwright Codegen: `npx playwright codegen
// <portalUrl>`), dann hier eingetragen. Der Ablauf (Login → Formular → Vorausfüllen
// → Entwurf speichern → Screenshot) ist bereits modelliert.

import { chromium } from 'playwright';
import { config } from '../config.js';
import type { Job, PortalCredentials, FillResult, PortalDriver } from '../types.js';

async function fill(job: Job, creds: PortalCredentials): Promise<FillResult> {
  const browser = await chromium.launch({ headless: config.headless });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  try {
    // 1) Login
    await page.goto(creds.portalUrl, { waitUntil: 'domcontentloaded' });
    // TODO Selektoren an das echte Portal anpassen:
    await page.fill('#username', creds.username);
    await page.fill('#password', creds.password);
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');

    // 2) Zum Einspeise-/Anmeldeformular navigieren
    // TODO: echter Navigationspfad / Direkt-URL
    // await page.click('text=Erzeugungsanlage anmelden');

    // 3) Felder vorausfüllen (aus job.fields)
    const f = job.fields;
    // TODO Feld-Selektoren:
    // await page.fill('[name="anlagenbetreiber"]', f.name);
    // if (f.street) await page.fill('[name="strasse"]', f.street);
    // if (f.zip) await page.fill('[name="plz"]', f.zip);
    // if (f.city) await page.fill('[name="ort"]', f.city);
    // if (f.kwp) await page.fill('[name="leistung_kwp"]', String(f.kwp).replace('.', ','));
    // if (f.moduleCount) await page.fill('[name="anzahl_module"]', String(f.moduleCount));
    // if (f.phases) await page.check(`[name="phasen"][value="${f.phases}"]`);
    void f; // bis Selektoren eingetragen sind

    // 4) Als ENTWURF speichern (NICHT absenden)
    // TODO: echter "Zwischenspeichern"-Button
    // await page.click('text=Zwischenspeichern');

    // 5) Nachweis-Screenshot
    const screenshotPath = `artifacts/${job.offerId}-mitnetz.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });

    return { ok: true, screenshotPath, draftRef: undefined };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  } finally {
    await browser.close();
  }
}

export const mitnetzDriver: PortalDriver = {
  netzbetreiber: 'MITNETZ STROM',
  fillDraft: fill,
};
