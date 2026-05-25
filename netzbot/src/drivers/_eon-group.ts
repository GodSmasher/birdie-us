// Gemeinsame Fill-Logik für alle EON-Gruppe SFDC Installateurportale.
// Genutzt von: MITNETZ STROM, Bayernwerk, E.DIS, Avacon.
// Selektoren verifiziert am 2026-05-25 gegen portal.mitnetz-strom.de.

import { chromium, type Page } from 'playwright';
import { mkdirSync } from 'fs';
import { config } from '../config.js';
import type { Job, PortalCredentials, FillResult } from '../types.js';

const PORTAL_COMPONENT = '?component=orderoverview';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function fillModalInput(page: Page, inputId: string, value: string | number) {
  await page.evaluate(([id, val]) => {
    const input = document.getElementById(id) as HTMLInputElement | null;
    if (!input) return;
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
    setter.call(input, val);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    input.dispatchEvent(new Event('blur', { bubbles: true }));
  }, [inputId, String(value)]);
  await page.waitForTimeout(200);
}

async function fillAutocomplete(page: Page, inputId: string, value: string) {
  if (!value) return;
  const input = page.locator(`#${inputId}`);
  await input.click();
  await input.fill('');
  await input.pressSequentially(value, { delay: 60 });
  await page.waitForTimeout(1500);

  const suggestion = page.locator(
    '.autosuggest__results-item, [class*="suggestion"] li, ' +
    '[class*="autosuggest"] li, [role="listbox"] [role="option"]',
  ).first();
  if (await suggestion.isVisible({ timeout: 2500 }).catch(() => false)) {
    await suggestion.click();
    await page.waitForTimeout(600);
  }
}

async function selectDropdownOption(page: Page, dropdownId: string, optionFragment: string): Promise<boolean> {
  await page.evaluate((id) => {
    document.getElementById(id)?.querySelector('.dropdown-component__select')?.dispatchEvent(
      new MouseEvent('click', { bubbles: true }),
    );
  }, dropdownId);
  await page.waitForTimeout(400);

  const clicked = await page.evaluate(([id, frag]) => {
    const dd = document.getElementById(id!);
    const options = dd?.querySelectorAll('.dropdown-component__option');
    const target = Array.from(options || []).find((opt) =>
      opt.textContent!.trim().toLowerCase().includes(frag!.toLowerCase()),
    );
    if (target) { (target as HTMLElement).click(); return true; }
    return false;
  }, [dropdownId, optionFragment]);
  await page.waitForTimeout(300);
  return clicked;
}

async function submitModal(page: Page) {
  await page.evaluate(() => {
    (document.querySelector('.Modal button[type="submit"]') as HTMLElement)?.click();
  });
  await page.waitForTimeout(2000);
}

async function clickButtonByText(page: Page, text: string): Promise<boolean> {
  const clicked = await page.evaluate((t) => {
    const btn = Array.from(document.querySelectorAll('button'))
      .find((b) => b.textContent!.trim() === t && !b.disabled);
    if (btn) { btn.click(); return true; }
    return false;
  }, text);
  if (clicked) await page.waitForTimeout(1500);
  return clicked;
}

async function clickBearbeitenFor(page: Page, keyword: string): Promise<boolean> {
  const clicked = await page.evaluate((kw) => {
    const btns = Array.from(document.querySelectorAll('button'))
      .filter((b) => b.textContent!.trim() === 'Bearbeiten');
    for (const btn of btns) {
      let el: HTMLElement | null = btn;
      for (let i = 0; i < 8; i++) el = el?.parentElement ?? null;
      if (el?.textContent?.includes(kw)) { btn.click(); return true; }
    }
    return false;
  }, keyword);
  if (clicked) await page.waitForTimeout(900);
  return clicked;
}

// ---------------------------------------------------------------------------
// Main flow — shared across all EON-Gruppe portals
// ---------------------------------------------------------------------------

export async function fillEonGroup(job: Job, creds: PortalCredentials): Promise<FillResult> {
  mkdirSync('artifacts', { recursive: true });

  const browser = await chromium.launch({
    headless: config.headless,
    args: ['--start-maximized'],
  });
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, locale: 'de-DE' });
  const page = await ctx.newPage();
  const f = job.fields;
  let draftRef: string | undefined;

  // Derive a slug from the netzbetreiber name for artifact filenames.
  const slug = job.netzbetreiber.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  try {
    // ── 1) Login ──────────────────────────────────────────────────────────
    await page.goto(creds.portalUrl + PORTAL_COMPONENT, {
      waitUntil: 'networkidle',
      timeout: 30_000,
    });

    const usernameField = await page.waitForSelector(
      '#username, input[id*="username"], input[type="email"]',
      { timeout: 6000 },
    ).catch(() => null);

    if (usernameField) {
      await page.fill('#username', creds.username);
      await page.fill('#pwdtxt, input[type="password"]', creds.password);
      await page.click(
        'button[type="submit"], .slds-button[type="submit"], button:has-text("Anmelden")',
      );
      await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 25_000 });
    }

    // Ensure we're on the order overview
    if (!page.url().includes('orderoverview')) {
      await page.goto(creds.portalUrl + PORTAL_COMPONENT, {
        waitUntil: 'networkidle',
        timeout: 20_000,
      });
    }

    await page.screenshot({ path: `artifacts/${job.offerId}-01-nach-login.png` });

    // ── 2) Neuen Auftrag erstellen → "Energie einspeisen" ────────────────
    await page.getByRole('button', { name: /Neuen Auftrag erstellen/i }).click();
    await page.waitForSelector('.Modal', { timeout: 10_000 });

    // Select "Energie einspeisen"
    await page.evaluate(() => {
      const modal = document.querySelector('.Modal');
      const btns = Array.from(modal?.querySelectorAll('button') || [])
        .filter((b) => b.textContent!.trim().startsWith('Auswählen'));
      const target = btns.find((btn) => {
        let el: Element | null = btn;
        for (let i = 0; i < 5; i++) el = el?.parentElement ?? null;
        return el?.textContent?.includes('Energie einspeisen');
      });
      (target as HTMLElement | undefined)?.click();
    });
    await page.waitForTimeout(1500);

    await page.screenshot({ path: `artifacts/${job.offerId}-02-energie-einspeisen.png` });

    // ── 3) Address form ──────────────────────────────────────────────────
    const plzField = page.getByLabel(/Postleitzahl/i);
    await plzField.click();
    await plzField.fill(f.zip ?? '');
    await page.waitForTimeout(2000);
    const plzSugg = page.locator('[role="listbox"] [role="option"]').first();
    if (await plzSugg.isVisible({ timeout: 3000 }).catch(() => false)) await plzSugg.click();

    const streetField = page.getByLabel(/^Straße$/i);
    await streetField.click();
    await streetField.fill(f.street ?? '');
    await page.waitForTimeout(1500);
    const streetSugg = page.locator('[role="listbox"] [role="option"]').first();
    if (await streetSugg.isVisible({ timeout: 3000 }).catch(() => false)) await streetSugg.click();

    // Hausnummer: extract from street if needed
    const hnr = f.street?.match(/\d+\s*[a-zA-Z]?$/)?.[0] ?? '';
    await page.getByLabel(/Hausnummer/i).fill(hnr);
    await page.waitForTimeout(400);

    await page.screenshot({ path: `artifacts/${job.offerId}-03-adresse.png` });

    // Click "Auftrag erstellen"
    await page.evaluate(() => {
      (document.querySelector('.Modal button.Button.filled') as HTMLElement)?.click();
    });

    await page.waitForURL(/component=space/, { timeout: 30_000 });
    await page.waitForTimeout(2500);

    // Capture order number from URL for draftRef
    const orderMatch = page.url().match(/orderId=(\d+)/);
    draftRef = orderMatch?.[1];

    await page.screenshot({ path: `artifacts/${job.offerId}-04-order-space.png` });

    // ── 4) Step 1: Anlage suchen (if checkbox visible) ───────────────────
    const anlageCb = await page.$('#cb-customer-relation-address');
    if (anlageCb) {
      if (!(await anlageCb.isChecked())) await anlageCb.click();
      await page.getByLabel(/Postleitzahl oder Ort/i).fill(f.zip ?? '');
      await page.waitForTimeout(1200);
      await page.getByLabel(/^Straße$/i).fill(f.street ?? '');
      await page.waitForTimeout(800);
      await page.getByLabel(/Hausnummer/i).fill(hnr);
      await page.waitForTimeout(400);
      await page.getByRole('button', { name: /Suchen/i }).click();
      await page.waitForTimeout(2500);
      const addNew = await page.waitForSelector('#cb-add-new-instance', { timeout: 8000 }).catch(() => null);
      if (addNew) await addNew.click();
      await clickButtonByText(page, 'Weiter');
      await page.waitForTimeout(2500);
    }

    // ── 5) Messkonzept: Wechselrichter ───────────────────────────────────
    const wrAdded = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button'))
        .find((b) => b.textContent!.includes('Wechselrichter hinzufügen'));
      if (btn) { (btn as HTMLElement).click(); return true; }
      return false;
    });
    if (!wrAdded) await clickBearbeitenFor(page, 'Wechselrichter');

    await page.waitForSelector('.Modal', { timeout: 12_000 });
    await page.screenshot({ path: `artifacts/${job.offerId}-05-wr-dialog.png` });

    await fillModalInput(page, 'root_identicalInverters', 1);

    if (f.inverter) {
      const parts = f.inverter.split(/\s+/);
      const hersteller = parts[0] ?? '';
      const typ = parts.slice(1).join(' ') || f.inverter;
      await fillAutocomplete(page, 'root_manufacturer_text-input', hersteller);
      await fillAutocomplete(page, 'root_inverterType_text-input', typ);
    }

    if (f.kwp) {
      const kwpStr = String(f.kwp).replace('.', ',');
      await fillModalInput(page, 'root_power', kwpStr);
      await fillModalInput(page, 'root_apparentPower', kwpStr);
    }

    await submitModal(page);
    await page.screenshot({ path: `artifacts/${job.offerId}-06-wr-fertig.png` });

    // ── 6) Messkonzept: PV-Anlage ────────────────────────────────────────
    await clickBearbeitenFor(page, 'PV-Anlage');
    await page.waitForSelector('.Modal', { timeout: 10_000 });

    if (f.kwp) {
      await fillModalInput(page, 'root_totalPowerProduction', String(f.kwp).replace('.', ','));
    }

    await selectDropdownOption(page, 'root_location', 'Dachfläche');
    await selectDropdownOption(page, 'root_curtailmentProcedure', '60%');

    const feedInText = f.einspeiseart === 'voll' ? 'Volleinspeisung' : 'Überschuss';
    await selectDropdownOption(page, 'root_feedInType', feedInText);

    await submitModal(page);
    await page.screenshot({ path: `artifacts/${job.offerId}-07-pv-fertig.png` });

    // ── 7) Weiter (do NOT submit — human reviews) ────────────────────────
    // Der Bot stoppt hier. Der Auftrag bleibt in "Technische Daten eintragen",
    // damit ein Mensch ihn im Portal prüfen und freigeben kann.

    const screenshotPath = `artifacts/${job.offerId}-${slug}-entwurf.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });

    return { ok: true, screenshotPath, draftRef };
  } catch (err) {
    const errScreenshot = `artifacts/${job.offerId}-${slug}-fehler.png`;
    await page.screenshot({ path: errScreenshot }).catch(() => {});
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  } finally {
    await browser.close();
  }
}
