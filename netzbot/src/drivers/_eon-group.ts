// Gemeinsame Fill-Logik für alle EON-Gruppe SFDC Installateurportale.
// Genutzt von: MITNETZ STROM, Bayernwerk, E.DIS, Avacon.
// Selektoren verifiziert am 2026-05-25 gegen portal.mitnetz-strom.de.
// Uses stealth launch args + navigator patches to reduce Cloudflare detection.

import { chromium, type Page } from 'playwright';
import { mkdirSync } from 'fs';
import { config } from '../config.js';
import type { Job, PortalCredentials, FillResult } from '../types.js';

const PORTAL_COMPONENT = '?component=orderoverview';

// ---------------------------------------------------------------------------
// Geocoding via OpenStreetMap Nominatim (free, no API key)
// ---------------------------------------------------------------------------
async function geocode(street: string, zip: string, city: string): Promise<{ lat: string; lng: string } | null> {
  const q = `${street}, ${zip} ${city}, Germany`;
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1&countrycodes=de`;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'birdie-netzbot/1.0 (solar installer portal automation)' },
    });
    const data = await res.json() as Array<{ lat: string; lon: string }>;
    if (data.length > 0) {
      return { lat: data[0].lat, lng: data[0].lon };
    }
    // Fallback: try with just zip + city
    const url2 = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(`${zip} ${city}, Germany`)}&limit=1&countrycodes=de`;
    const res2 = await fetch(url2, {
      headers: { 'User-Agent': 'birdie-netzbot/1.0 (solar installer portal automation)' },
    });
    const data2 = await res2.json() as Array<{ lat: string; lon: string }>;
    if (data2.length > 0) return { lat: data2[0].lat, lng: data2[0].lon };
    return null;
  } catch (err) {
    console.log(`[eon] Geocoding failed: ${err}`);
    return null;
  }
}

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
    args: [
      '--start-maximized',
      '--disable-blink-features=AutomationControlled',
      '--disable-features=IsolateOrigins,site-per-process',
    ],
  });
  const ctx = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    locale: 'de-DE',
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  });
  // Stealth: remove navigator.webdriver flag that Cloudflare checks
  await ctx.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    // @ts-ignore — patch chrome.runtime
    (window as any).chrome = { runtime: {} };
    Object.defineProperty(navigator, 'plugins', {
      get: () => [1, 2, 3, 4, 5],
    });
    Object.defineProperty(navigator, 'languages', {
      get: () => ['de-DE', 'de', 'en-US', 'en'],
    });
  });
  const page = await ctx.newPage();
  const f = job.fields;
  let draftRef: string | undefined;

  // Derive a slug from the netzbetreiber name for artifact filenames.
  const slug = job.netzbetreiber.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  try {
    // ── 1) Login ──────────────────────────────────────────────────────────
    await page.goto(creds.portalUrl + PORTAL_COMPONENT, {
      waitUntil: 'domcontentloaded',
      timeout: 30_000,
    });
    await page.waitForTimeout(3000);

    // ── Cloudflare Turnstile check + attempt to solve ─────────────────
    const pageContent = await page.content();
    if (pageContent.includes('Bestätigen Sie, dass Sie ein Mensch') ||
        pageContent.includes('Sicherheitsüberprüfung') ||
        pageContent.includes('cf-turnstile') ||
        pageContent.includes('challenges.cloudflare.com')) {
      console.log(`[eon] Cloudflare Turnstile detected — attempting checkbox click`);
      await page.screenshot({ path: `artifacts/${job.offerId}-00-cloudflare-before.png` });

      // Try clicking the Turnstile checkbox (inside iframe)
      const cfFrame = page.frameLocator('iframe[src*="challenges.cloudflare.com"]');
      const checkbox = cfFrame.locator('input[type="checkbox"], .cb-i, label');
      try {
        await checkbox.first().click({ timeout: 5000 });
        console.log(`[eon] Clicked Turnstile checkbox — waiting for verification`);
        await page.waitForTimeout(8000);

        // Check if Turnstile was solved
        const afterContent = await page.content();
        if (!afterContent.includes('Bestätigen Sie, dass Sie ein Mensch') &&
            !afterContent.includes('cf-turnstile')) {
          console.log(`[eon] Turnstile solved! Proceeding with login`);
          await page.waitForTimeout(3000);
        } else {
          // Still blocked — check if page navigated away from challenge
          const usernameVisible = await page.locator('#username, input[type="email"]')
            .isVisible({ timeout: 3000 }).catch(() => false);
          if (usernameVisible) {
            console.log(`[eon] Turnstile passed (login form visible)`);
          } else {
            await page.screenshot({ path: `artifacts/${job.offerId}-00-cloudflare.png` });
            await browser.close();
            return {
              ok: false,
              screenshotPath: `artifacts/${job.offerId}-00-cloudflare.png`,
              error: `Cloudflare Turnstile konnte nicht gelöst werden auf ${creds.portalUrl} — Datacenter-IP blockiert.`,
            };
          }
        }
      } catch {
        // Couldn't click checkbox — still blocked
        await page.screenshot({ path: `artifacts/${job.offerId}-00-cloudflare.png` });
        await browser.close();
        return {
          ok: false,
          screenshotPath: `artifacts/${job.offerId}-00-cloudflare.png`,
          error: `Cloudflare Bot-Schutz blockiert ${creds.portalUrl} — VPS-IP wird als Datacenter erkannt. Manuelle Anmeldung nötig.`,
        };
      }
    }

    const usernameField = await page.waitForSelector(
      '#username, input[id*="username"], input[type="email"]',
      { timeout: 10000 },
    ).catch(() => null);

    if (usernameField) {
      await page.fill('#username', creds.username);
      await page.fill('#pwdtxt, input[type="password"]', creds.password);
      await page.click(
        'button[type="submit"], .slds-button[type="submit"], button:has-text("Anmelden")',
      );
      await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 25_000 });
      // SFDC uses multiple redirects (frontdoor.jsp → actual page). Wait for body to load.
      await page.waitForTimeout(8000);
    }

    // Handle "Anmeldung abschließen" (first-time SFDC registration flow)
    const bodyText = await page.evaluate(() => document.body?.innerText ?? '');
    console.log(`[eon] Post-login page text (first 200): ${bodyText.slice(0, 200)}`);
    console.log(`[eon] Post-login URL: ${page.url()}`);

    if (bodyText.includes('Anmeldung abschließen') || bodyText.includes('Seite kann nicht angezeigt werden') || bodyText.includes('scope_601')) {
      await page.screenshot({ path: `artifacts/${job.offerId}-01-sfdc-error.png` });
      // Try clicking "Anmeldung abschließen" if visible
      const anmeldungBtn = page.locator('button:has-text("Anmeldung"), a:has-text("Anmeldung")');
      if (await anmeldungBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        console.log(`[eon] Clicking "Anmeldung abschließen"...`);
        await anmeldungBtn.click();
        await page.waitForTimeout(5000);
        const afterText = await page.evaluate(() => document.body?.innerText ?? '');
        if (!afterText.includes('Seite kann nicht angezeigt werden')) {
          console.log(`[eon] SFDC registration completed, proceeding`);
        } else {
          await browser.close();
          return {
            ok: false,
            screenshotPath: `artifacts/${job.offerId}-01-sfdc-error.png`,
            error: `SFDC Portal-Zugang für ${job.netzbetreiber} nicht eingerichtet — "Anmeldung abschließen" nötig. Bitte einmalig manuell im Browser anmelden.`,
          };
        }
      } else {
        await browser.close();
        return {
          ok: false,
          screenshotPath: `artifacts/${job.offerId}-01-sfdc-error.png`,
          error: `SFDC Portal für ${job.netzbetreiber} zeigt Fehler — Zugang nicht konfiguriert. Bitte manuell prüfen.`,
        };
      }
    }

    // Ensure we're on the order overview
    if (!page.url().includes('orderoverview')) {
      await page.goto(creds.portalUrl + PORTAL_COMPONENT, {
        waitUntil: 'domcontentloaded',
        timeout: 20_000,
      });
    }
    await page.waitForTimeout(3000); // SFDC JS loading

    await page.screenshot({ path: `artifacts/${job.offerId}-01-nach-login.png` });

    // ── Dismiss cookie/privacy banner ──────────────────────────────────
    // First try clicking "Ablehnen", then forcefully remove ALL consent/overlay
    // elements from the DOM. The Bayernwerk privacy banner has an invisible
    // full-page overlay that blocks clicks even with force:true.
    const rejectBtn = page.locator('button:has-text("Ablehnen")').first();
    if (await rejectBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log(`[eon] Clicking "Ablehnen" on cookie banner`);
      await rejectBtn.click({ force: true });
      await page.waitForTimeout(2000);
    }
    // Always forcefully remove consent overlays from the DOM
    const removed = await page.evaluate(() => {
      let count = 0;
      // Remove by class/id patterns
      const selectors = [
        '[class*="cookie"]', '[class*="Cookie"]',
        '[class*="privacy"]', '[class*="Privacy"]',
        '[class*="consent"]', '[class*="Consent"]',
        '[id*="cookie"]', '[id*="Cookie"]',
        '[id*="privacy"]', '[id*="Privacy"]',
        '[id*="consent"]', '[id*="Consent"]',
        '[class*="Privatsph"]',
        '[class*="onetrust"]', '[id*="onetrust"]',
        '[class*="CookieConsent"]', '[id*="CookieConsent"]',
        '.cmp-container', '#cmp-container',
        '[class*="cmp-"]', '[id*="cmp-"]',
        '[class*="banner"]',
      ];
      for (const sel of selectors) {
        document.querySelectorAll(sel).forEach((el) => { el.remove(); count++; });
      }
      // Remove any fixed/sticky overlays covering the page
      document.querySelectorAll('*').forEach((el) => {
        const style = getComputedStyle(el);
        if ((style.position === 'fixed' || style.position === 'sticky') &&
            (style.zIndex === 'auto' || parseInt(style.zIndex) > 100) &&
            el.tagName !== 'HEADER' && el.tagName !== 'NAV' &&
            !el.classList.contains('portal-header')) {
          // Check if it covers a large portion of the viewport
          const rect = el.getBoundingClientRect();
          if (rect.height > 100 && rect.width > window.innerWidth * 0.5) {
            el.remove();
            count++;
          }
        }
      });
      return count;
    });
    console.log(`[eon] Removed ${removed} consent/overlay elements from DOM`);
    await page.waitForTimeout(500);

    // ── 2) Neuen Auftrag erstellen → "Energie einspeisen" ────────────────
    console.log(`[eon] Clicking "Neuen Auftrag erstellen"…`);
    // Try Playwright locator first; if overlay still intercepts, use JS click
    try {
      await page.getByRole('button', { name: /Neuen Auftrag erstellen/i }).click({ timeout: 8000 });
      console.log(`[eon] Button clicked via Playwright locator`);
    } catch {
      console.log(`[eon] Playwright click failed — trying JS dispatch`);
      const jsClicked = await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button'))
          .find(b => b.textContent?.includes('Neuen Auftrag erstellen'));
        if (btn) {
          btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
          return true;
        }
        return false;
      });
      if (!jsClicked) {
        // Last resort: force click
        await page.getByRole('button', { name: /Neuen Auftrag erstellen/i }).click({ force: true, timeout: 8000 });
        console.log(`[eon] Button clicked via force:true`);
      } else {
        console.log(`[eon] Button clicked via JS dispatch`);
      }
    }
    await page.waitForTimeout(4000);
    console.log(`[eon] Post-button URL: ${page.url()}`);
    await page.screenshot({ path: `artifacts/${job.offerId}-02-after-btn-click.png` });

    // SFDC may redirect to OAuth scope authorization ("Anmeldung abschließen").
    // If so, click the button, wait for redirect, then go back to portal and retry.
    const postClickText = await page.evaluate(() => document.body?.innerText ?? '');
    if (postClickText.includes('Anmeldung abschließen') || postClickText.includes('scope_601') || postClickText.includes('Seite kann nicht angezeigt werden')) {
      console.log(`[eon] SFDC OAuth scope authorization required — clicking "Anmeldung abschließen"`);
      await page.screenshot({ path: `artifacts/${job.offerId}-02-sfdc-scope.png` });
      const scopeBtn = page.locator('button:has-text("Anmeldung abschließen"), a:has-text("Anmeldung abschließen"), input[value*="Anmeldung"]');
      await scopeBtn.first().click({ timeout: 5000 });
      await page.waitForTimeout(8000);
      console.log(`[eon] Post-scope URL: ${page.url()}`);

      // After authorizing, SFDC should redirect back. If not on portal, navigate there.
      if (!page.url().includes('orderoverview') && !page.url().includes('meinauftragsportal')) {
        console.log(`[eon] Navigating back to portal after scope authorization`);
        await page.goto(creds.portalUrl + PORTAL_COMPONENT, { waitUntil: 'domcontentloaded', timeout: 20_000 });
        await page.waitForTimeout(5000);
      }

      // Remove cookie/consent overlays again after redirect
      await page.evaluate(() => {
        const sels = ['[class*="cookie"]','[class*="Cookie"]','[class*="consent"]','[class*="Consent"]','[class*="privacy"]','[class*="Privacy"]','[class*="Privatsph"]','[id*="cookie"]','[id*="consent"]','[id*="cmp"]','[class*="cmp-"]','[class*="banner"]'];
        for (const s of sels) document.querySelectorAll(s).forEach(e => e.remove());
        document.querySelectorAll('*').forEach(el => {
          const st = getComputedStyle(el);
          if ((st.position === 'fixed' || st.position === 'sticky') && el.tagName !== 'HEADER' && el.tagName !== 'NAV') {
            const r = el.getBoundingClientRect();
            if (r.height > 100 && r.width > window.innerWidth * 0.5) el.remove();
          }
        });
      });
      await page.waitForTimeout(500);

      // Retry "Neuen Auftrag erstellen"
      console.log(`[eon] Retrying "Neuen Auftrag erstellen" after scope authorization`);
      await page.getByRole('button', { name: /Neuen Auftrag erstellen/i }).click({ force: true, timeout: 15000 });
      await page.waitForTimeout(4000);
    }

    // Wait for the order-type selection modal
    await page.waitForSelector('.Modal', { timeout: 10_000 }).catch(async () => {
      // Fallback: the modal might not have the .Modal class in all portals.
      // Try finding "Energie einspeisen" or "Auswählen" text directly.
      console.log(`[eon] .Modal not found — checking page state`);
      await page.screenshot({ path: `artifacts/${job.offerId}-02-no-modal.png` });
    });

    // Select "Energie einspeisen" — find the right "Auswählen" button by
    // checking parent text. Playwright locators pierce Shadow DOM.
    const auswaehlenBtns = page.getByRole('button', { name: /Auswählen/i });
    const count = await auswaehlenBtns.count();
    console.log(`[eon] Found ${count} "Auswählen" buttons`);

    let energieSelected = false;
    // First: dump ALL button contexts for debugging (always, for first few)
    const parentTexts: string[] = [];
    for (let i = 0; i < Math.min(count, 8); i++) {
      // Walk up 2 and 3 levels to find the CARD-level text (not the whole modal)
      const ctx = await auswaehlenBtns.nth(i).evaluate((el) => {
        const texts: string[] = [];
        let node: Element | null = el;
        for (let j = 0; j < 5; j++) {
          node = node?.parentElement ?? null;
          if (node) texts.push(`L${j + 1}(${(node.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 80)})`);
        }
        return texts.join(' | ');
      });
      console.log(`[eon]   btn[${i}]: ${ctx}`);
      // Store the Level-2 parent text for matching (card level)
      const cardText = await auswaehlenBtns.nth(i).evaluate((el) => {
        let node: Element | null = el;
        // Walk up just 2-3 levels — the card container
        for (let j = 0; j < 3; j++) node = node?.parentElement ?? null;
        return (node?.textContent ?? '').replace(/\s+/g, ' ').trim();
      });
      parentTexts.push(cardText);
    }

    // Find the button whose card-level parent contains "Energie einspeisen".
    // Use evaluate(el => el.click()) — direct DOM click bypasses overlays.
    for (let i = 0; i < parentTexts.length; i++) {
      if (parentTexts[i].includes('Energie einspeisen') &&
          !parentTexts[i].includes('Neuen Anschluss')) {
        await auswaehlenBtns.nth(i).evaluate((el) => (el as HTMLElement).click());
        console.log(`[eon] Selected "Energie einspeisen" at index ${i} via el.click()`);
        energieSelected = true;
        break;
      }
    }
    if (!energieSelected) {
      for (let i = 0; i < parentTexts.length; i++) {
        if (parentTexts[i].toLowerCase().includes('einspeisen')) {
          await auswaehlenBtns.nth(i).evaluate((el) => (el as HTMLElement).click());
          console.log(`[eon] Selected "einspeisen" (broad) at index ${i} via el.click()`);
          energieSelected = true;
          break;
        }
      }
    }
    if (!energieSelected) {
      const fallbackIdx = Math.min(2, count - 1);
      await auswaehlenBtns.nth(fallbackIdx).evaluate((el) => (el as HTMLElement).click());
      console.log(`[eon] Fallback: el.click() at index ${fallbackIdx}`);
    }
    await page.waitForTimeout(3000);

    await page.screenshot({ path: `artifacts/${job.offerId}-02-energie-einspeisen.png` });
    console.log(`[eon] Post-Auswählen URL: ${page.url()}`);

    // ── 3) Address form ──────────────────────────────────────────────────
    // Wait for the PLZ field to appear first (confirms the form loaded).
    const plzField = page.getByLabel(/Postleitzahl/i);
    await plzField.waitFor({ state: 'attached', timeout: 20000 });
    console.log(`[eon] PLZ field found in DOM`);

    // Now remove cookie consent overlay (targeted — NOT broad element removal).
    // Use page.evaluate on specific consent manager elements only.
    await page.evaluate(() => {
      // Only target known consent/privacy overlays by specific selectors
      const sels = [
        '#usercentrics-root', '[class*="uc-banner"]', '[id*="uc-"]',
        '[class*="onetrust"]', '[id*="onetrust"]',
        '[class*="CookieConsent"]', '[id*="CookieConsent"]',
        '[class*="cmp-container"]', '[id*="cmp-container"]',
        '[class*="Privatsph"]',
        'div[class*="privacy-settings"]', 'div[class*="cookie-banner"]',
      ];
      for (const s of sels) document.querySelectorAll(s).forEach(e => e.remove());
      // Remove only the fixed-position cookie bar at the bottom
      document.querySelectorAll('[style*="position: fixed"], [style*="position:fixed"]').forEach(el => {
        const rect = el.getBoundingClientRect();
        const text = el.textContent || '';
        // Only remove if it looks like a cookie banner (at bottom, mentions privacy/cookie)
        if (rect.bottom > window.innerHeight - 250 &&
            (text.includes('Cookie') || text.includes('Privatsph') || text.includes('Datenschutz') || text.includes('Tracking'))) {
          el.remove();
        }
      });
    });
    console.log(`[eon] Cleaned up consent overlays (targeted)`);

    // Extract street name and house number separately
    const streetName = (f.street ?? '').replace(/\s*\d+\s*[a-zA-Z]?\s*$/, '').trim();
    const hnr = f.street?.match(/\d+\s*[a-zA-Z]?$/)?.[0]?.trim() ?? '';

    // PLZ — focus, clear, type to trigger autocomplete
    await plzField.evaluate((el) => {
      const input = el as HTMLInputElement;
      input.value = '';
      input.focus();
      input.click();
    });
    await page.keyboard.type(f.zip ?? '', { delay: 80 });
    console.log(`[eon] PLZ typed: ${f.zip}`);
    await page.waitForTimeout(2500);
    const plzSugg = page.locator('[role="listbox"] [role="option"], .autosuggest__results-item, [class*="suggestion"] li').first();
    if (await plzSugg.isVisible({ timeout: 4000 }).catch(() => false)) {
      await plzSugg.evaluate((el) => (el as HTMLElement).click());
      console.log(`[eon] PLZ suggestion clicked`);
    } else {
      await page.keyboard.press('Tab');
      console.log(`[eon] PLZ no suggestion — tabbed to next field`);
    }
    // Wait for PLZ processing — the portal loads street data for the selected city
    await page.waitForTimeout(3000);

    // Straße — focus, type street NAME only (no house number)
    const streetField = page.getByLabel(/^Straße$/i);
    await streetField.evaluate((el) => {
      const input = el as HTMLInputElement;
      input.value = '';
      input.focus();
      input.click();
    });
    await page.waitForTimeout(300);
    // Verify focus is on street field
    const focused = await page.evaluate(() => document.activeElement?.id || document.activeElement?.tagName);
    console.log(`[eon] Focused element before Straße typing: ${focused}`);
    await page.keyboard.type(streetName, { delay: 100 });
    console.log(`[eon] Straße typed: ${streetName}`);
    await page.waitForTimeout(3000);
    // Check for autocomplete suggestions - look more broadly
    const streetSugg = page.locator('[role="listbox"] [role="option"], .autosuggest__results-item, [class*="suggestion"] li, ul[class*="results"] li, .dropdown-menu li').first();
    await page.screenshot({ path: `artifacts/${job.offerId}-03a-street-autocomplete.png` });
    let streetFound = false;
    if (await streetSugg.isVisible({ timeout: 5000 }).catch(() => false)) {
      await streetSugg.evaluate((el) => (el as HTMLElement).click());
      console.log(`[eon] Straße suggestion clicked`);
      streetFound = true;
      await page.waitForTimeout(1000);
    } else {
      console.log(`[eon] Straße no suggestion found — checking for "Straße nicht gefunden" checkbox`);
      await page.keyboard.press('Tab');
    }

    // ── Handle "Straße nicht gefunden" checkbox ─────────────────────────
    // The portal shows a checkbox "Straße nicht gefunden" when the typed street
    // is not in its DB. Ticking it switches the form to manual mode with
    // coordinate fields (lat/lng), free-text Straße, Ort, etc.
    // We check "nicht gefunden" only if the autocomplete suggestion either:
    //   (a) never appeared, or
    //   (b) appeared but the portal still shows the checkbox as relevant.
    await page.waitForTimeout(1500);
    const strasseNichtGefunden = page.locator('text=Straße nicht gefunden').first();
    const snfVisible = await strasseNichtGefunden.isVisible({ timeout: 3000 }).catch(() => false);

    let usedManualAddress = false;

    if (snfVisible) {
      console.log(`[eon] "Straße nicht gefunden" visible (streetFound=${streetFound}) — clicking checkbox`);
      // Click the checkbox
      const clicked = await page.evaluate(() => {
        // Find checkbox near "nicht gefunden" text
        const allCbs = Array.from(document.querySelectorAll('input[type="checkbox"]'));
        for (const cb of allCbs) {
          let node: Element | null = cb;
          for (let i = 0; i < 5; i++) node = node?.parentElement ?? null;
          if (node?.textContent?.includes('nicht gefunden')) {
            (cb as HTMLInputElement).click();
            return 'checkbox';
          }
        }
        // Fallback: click label/span containing the text
        const labels = Array.from(document.querySelectorAll('label, span, div'));
        for (const el of labels) {
          if (el.textContent?.includes('nicht gefunden') && el.textContent!.length < 60) {
            (el as HTMLElement).click();
            return 'label';
          }
        }
        return null;
      });
      console.log(`[eon] "Straße nicht gefunden" click result: ${clicked}`);
      await page.waitForTimeout(2000); // Wait for form to expand

      if (clicked) {
        usedManualAddress = true;
        // ── Expanded form: fill coordinates + manual address ──────────────
        // Geocode the address to get lat/lng
        const coords = await geocode(f.street ?? '', f.zip ?? '', f.city ?? '');
        if (coords) {
          // Portal expects DOT notation (z.B. 52.123456), NOT German comma
          const latStr = coords.lat;
          const lngStr = coords.lng;
          console.log(`[eon] Geocoded: lat=${latStr}, lng=${lngStr}`);

          // Dump all visible inputs for debugging
          const allInputs = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('input:not([type="hidden"])')).map(inp => {
              let node: Element | null = inp;
              for (let i = 0; i < 6; i++) node = node?.parentElement ?? null;
              return { id: (inp as HTMLInputElement).id, type: (inp as HTMLInputElement).type, parentText: (node?.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 120) };
            });
          });
          console.log(`[eon] All visible inputs after checkbox:`);
          for (const inp of allInputs) {
            console.log(`[eon]   input#${inp.id} [${inp.type}]: ${inp.parentText.slice(0, 80)}`);
          }

          // Fill latitude — use Playwright getByLabel which worked in previous runs
          const latField = page.getByLabel(/Koordinate|LAT|Breitengrad/i).first();
          if ((await latField.count()) > 0) {
            // Use React setter pattern — keyboard.type had comma issues
            await latField.evaluate((el, val) => {
              const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
              setter.call(el, val);
              el.dispatchEvent(new Event('input', { bubbles: true }));
              el.dispatchEvent(new Event('change', { bubbles: true }));
              el.dispatchEvent(new Event('blur', { bubbles: true }));
            }, latStr);
            console.log(`[eon] Latitude set: ${latStr}`);
          } else {
            console.log(`[eon] Latitude field NOT found by getByLabel — trying keyboard approach`);
            // Fallback: find by placeholder or nearby text
            const latInput = page.locator('input[placeholder*="52"], input[placeholder*="LAT"]').first();
            if ((await latInput.count()) > 0) {
              await latInput.click();
              await page.keyboard.type(latStr, { delay: 30 });
              console.log(`[eon] Latitude typed via placeholder match: ${latStr}`);
            }
          }
          await page.waitForTimeout(200);

          // Fill longitude
          const lngField = page.getByLabel(/östlich|Länge|Longitude/i).first();
          if ((await lngField.count()) > 0) {
            await lngField.evaluate((el, val) => {
              const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
              setter.call(el, val);
              el.dispatchEvent(new Event('input', { bubbles: true }));
              el.dispatchEvent(new Event('change', { bubbles: true }));
              el.dispatchEvent(new Event('blur', { bubbles: true }));
            }, lngStr);
            console.log(`[eon] Longitude set: ${lngStr}`);
          } else {
            console.log(`[eon] Longitude field NOT found by getByLabel — trying keyboard`);
            const lngInput = page.locator('input[placeholder*="13"], input[placeholder*="LON"]').first();
            if ((await lngInput.count()) > 0) {
              await lngInput.click();
              await page.keyboard.type(lngStr, { delay: 30 });
              console.log(`[eon] Longitude typed via placeholder match: ${lngStr}`);
            }
          }
          await page.waitForTimeout(300);
        } else {
          console.log(`[eon] Geocoding returned no results — coordinates will be empty`);
        }

        // Fill manual Straße field — always clear and re-enter (might have wrong
        // value from a failed autocomplete like "Tannenwiese, Langenbach")
        const manualStreet = page.getByLabel(/^Straße$/i).first();
        if ((await manualStreet.count()) > 0) {
          await manualStreet.evaluate((el) => {
            const i = el as HTMLInputElement;
            i.value = '';
            i.focus();
            i.click();
          });
          // Triple-click to select all existing text, then type over it
          await manualStreet.click({ clickCount: 3 }).catch(() => {});
          await page.keyboard.type(`${streetName} ${hnr}`.trim(), { delay: 50 });
          console.log(`[eon] Manual street entered: ${streetName} ${hnr}`);
        }
        await page.waitForTimeout(200);

        // Fill Ort field — always overwrite (might have wrong city from autocomplete)
        const ortField = page.getByLabel(/^Ort$/i).first();
        if ((await ortField.count()) > 0) {
          await ortField.evaluate((el) => {
            const i = el as HTMLInputElement;
            i.value = '';
            i.focus();
            i.click();
          });
          await ortField.click({ clickCount: 3 }).catch(() => {});
          await page.keyboard.type(f.city ?? '', { delay: 50 });
          console.log(`[eon] Ort entered: ${f.city}`);
        }
        await page.waitForTimeout(200);

        // Hausnummer might not exist in manual mode — try with short timeout
        const hnrManual = page.getByLabel(/Hausnummer/i);
        if ((await hnrManual.count()) > 0) {
          await hnrManual.evaluate((el) => { const i = el as HTMLInputElement; i.value = ''; i.focus(); i.click(); });
          await page.keyboard.type(hnr, { delay: 50 });
          console.log(`[eon] Hausnummer typed (manual mode): ${hnr}`);
        } else {
          console.log(`[eon] No Hausnummer field in manual mode — included in street`);
        }
      }
    } else if (!streetFound) {
      console.log(`[eon] No street suggestion AND no "nicht gefunden" checkbox — address may fail`);
    }

    // Hausnummer — only fill if we didn't use manual address mode (which handles it)
    if (!usedManualAddress) {
      const hnrField = page.getByLabel(/Hausnummer/i);
      await hnrField.evaluate((el) => {
        const input = el as HTMLInputElement;
        input.value = '';
        input.focus();
        input.click();
      });
      await page.keyboard.type(hnr, { delay: 50 });
      console.log(`[eon] Hausnummer typed: ${hnr}`);
      await page.waitForTimeout(400);
    }

    await page.screenshot({ path: `artifacts/${job.offerId}-03-adresse.png` });

    // ── Debug: dump all form fields before submit ──────────────────────
    const formState = await page.evaluate(() => {
      const fields: { id: string; label: string; value: string; type: string; required: boolean }[] = [];
      document.querySelectorAll('input, select, textarea').forEach(el => {
        const inp = el as HTMLInputElement;
        // Find associated label
        const id = inp.id || '';
        let label = '';
        if (id) {
          const lbl = document.querySelector(`label[for="${id}"]`);
          if (lbl) label = lbl.textContent?.trim() ?? '';
        }
        if (!label) {
          let parent: Element | null = inp;
          for (let i = 0; i < 3; i++) parent = parent?.parentElement ?? null;
          const parentLabel = parent?.querySelector('label')?.textContent?.trim();
          if (parentLabel) label = parentLabel;
        }
        const val = inp.value || '';
        if (val || label || inp.type !== 'hidden') {
          fields.push({ id, label: label.slice(0, 50), value: val.slice(0, 80), type: inp.type || inp.tagName.toLowerCase(), required: inp.required || inp.getAttribute('aria-required') === 'true' });
        }
      });
      // Also check for validation errors
      const errors: string[] = [];
      document.querySelectorAll('[class*="error" i], [class*="invalid" i], [class*="help-text" i], [role="alert"]').forEach(el => {
        const t = el.textContent?.trim();
        if (t && t.length < 200) errors.push(t);
      });
      return { fields: fields.filter(f => f.value || f.required), errors: errors.slice(0, 10) };
    });
    console.log(`[eon] Form fields before submit:`);
    for (const f2 of formState.fields) {
      console.log(`[eon]   ${f2.required ? '* ' : '  '}[${f2.type}] ${f2.label || f2.id}: "${f2.value}"`);
    }
    if (formState.errors.length > 0) {
      console.log(`[eon] Form errors: ${JSON.stringify(formState.errors)}`);
    }

    // Click "Auftrag erstellen" — use both approaches
    const erstellenBtn = page.getByRole('button', { name: /Auftrag erstellen/i });
    if (await erstellenBtn.count() > 0) {
      // Check if button is disabled first
      const isDisabled = await erstellenBtn.first().evaluate((el) => {
        const btn = el as HTMLButtonElement;
        return btn.disabled || btn.getAttribute('aria-disabled') === 'true' || btn.classList.contains('disabled');
      });
      if (isDisabled) {
        console.log(`[eon] "Auftrag erstellen" is disabled — form validation errors`);
        // Try to get validation error messages
        const errors = await page.evaluate(() => {
          const msgs: string[] = [];
          document.querySelectorAll('[class*="error"], [class*="invalid"], [class*="validation"], .help-block, .field-error').forEach(el => {
            const t = el.textContent?.trim();
            if (t) msgs.push(t);
          });
          return msgs.slice(0, 5);
        });
        console.log(`[eon] Form validation errors: ${JSON.stringify(errors)}`);
        await page.screenshot({ path: `artifacts/${job.offerId}-03b-validation-errors.png` });
      }
      await erstellenBtn.first().evaluate((el) => (el as HTMLElement).click());
      console.log(`[eon] Clicked "Auftrag erstellen" via el.click()`);
    } else {
      await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button'))
          .find(b => b.textContent?.includes('Auftrag erstellen') && !b.textContent?.includes('Neuen'));
        if (btn) btn.click();
      });
      console.log(`[eon] Clicked "Auftrag erstellen" via JS find`);
    }

    await page.waitForURL(/component=space/, { timeout: 30_000 }).catch(async () => {
      console.log(`[eon] Did not navigate to space — checking current state`);
      await page.screenshot({ path: `artifacts/${job.offerId}-03b-nach-erstellen.png` });
      // Check if page text indicates any error
      const pageText = await page.evaluate(() => document.body?.innerText?.slice(0, 500) ?? '');
      console.log(`[eon] Page state after erstellen: ${pageText.slice(0, 300)}`);
    });
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

    // WR Wirkleistung / Scheinleistung = Wechselrichter-Nennleistung (kW), Fallback: kWp
    const wrKw = f.inverterKw ?? f.kwp;
    if (wrKw) {
      const wrKwStr = String(wrKw).replace('.', ',');
      await fillModalInput(page, 'root_power', wrKwStr);
      await fillModalInput(page, 'root_apparentPower', wrKwStr);
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
    const errMsg = err instanceof Error ? err.message : String(err);
    return { ok: false, screenshotPath: `artifacts/${job.offerId}-${slug}-fehler.png`, error: errMsg };
  } finally {
    await browser.close();
  }
}
