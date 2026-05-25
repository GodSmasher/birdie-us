/**
 * Portal-Automation — birdie Portal-Bot Service
 *
 * Öffnet einen sichtbaren Browser (kein Headless), loggt sich ins NB-Portal ein,
 * füllt das Formular aus und speichert als Entwurf.
 * Mensch prüft und klickt dann selbst auf "Einreichen".
 *
 * Unterstützte Portale: Bayernwerk, MitNetz, E.Dis, Avacon (EON-Gruppe/SFDC),
 *   TEN (Azure B2C), SachsenEnergie/SachsenNetze (cidaas), Stromnetz Berlin (Angular),
 *   Netze Magdeburg (SAP UI5), ZEV Zwickau/SW Meerane (util.portal),
 *   SW Suhl/SW Bayreuth (Lovion), SW Lutherstadt, Werra Energie (EVB Netze),
 *   EMS Selb (ivurz.de), SW Delitzsch (X4/Keycloak), SW Eschwege (PHP)
 */

const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

// ── Chrome-Pfad finden ────────────────────────────────────────────────────────

function findChrome() {
  const candidates = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    process.env.CHROME_PATH,
  ].filter(Boolean);

  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return undefined;
}

// ── Dispatcher: NB-Key → Filler-Modul ────────────────────────────────────────

const FILLERS = {
  // ── E.ON-Gruppe (SFDC Installer Portal — gleiche Plattform) ───────────────
  'Bayernwerk':      () => require('./portal-fillers/bayernwerk'),
  'MitNetz':         () => require('./portal-fillers/mitnetz'),
  'E.Dis':           () => require('./portal-fillers/edis'),
  'Avacon':          () => require('./portal-fillers/avacon'),

  // ── Weitere Großnetze ──────────────────────────────────────────────────────
  'TEN':             () => require('./portal-fillers/ten'),            // Azure B2C + MFA
  'SachsenEnergie':  () => require('./portal-fillers/sachsenenergie'), // cidaas (TODO: 2FA)
  'Sachsen Netze':   () => require('./portal-fillers/sachsen-netze'),  // cidaas (TODO: 2FA)
  'Stromnetz Berlin':() => require('./portal-fillers/stromnetz-berlin'), // Azure B2C

  // ── Stadtwerke-Portale ─────────────────────────────────────────────────────
  'Netze Magdeburg': () => require('./portal-fillers/netze-magdeburg'), // SAP UI5
  'ZEV Zwickau':     () => require('./portal-fillers/zev-zwickau'),     // util.portal (MudBlazor)
  'SW Meerane':      () => require('./portal-fillers/sw-meerane'),      // util.portal (MudBlazor)
  'SW Suhl':         () => require('./portal-fillers/sw-suhl'),         // Lovion
  'SW Bayreuth':     () => require('./portal-fillers/sw-bayreuth'),     // Lovion (identisch SW Suhl)
  'SW Lutherstadt':  () => require('./portal-fillers/sw-lutherstadt'),  // React SPA AJAX
  'Werra Energie':   () => require('./portal-fillers/werra-energie'),   // EVB Netze CMS
  'EMS':             () => require('./portal-fillers/ems'),             // ivurz.de Angular Material
  'SW Delitzsch':    () => require('./portal-fillers/sw-delitzsch'),    // X4 + Keycloak
  'SW Eschwege':     () => require('./portal-fillers/sw-eschwege'),     // Weblication PHP
};

/**
 * Hauptfunktion: Portal automatisch ausfüllen
 *
 * @param {string} nbKey      - z.B. 'Bayernwerk'
 * @param {object} nb         - NB-Profil aus nb-profiles.json
 * @param {object} bundle     - Projektdaten (Reonic-Bundle-Format)
 * @param {object} extra      - Manuelle Felder (geburtsdatum, zaehler_nr, ...)
 * @param {string} outputDir  - Ordner für Screenshots
 * @returns {{ ok, screenshots, portalUrl, message }}
 */
async function runPortalFiller(nbKey, nb, bundle, extra, outputDir) {
  if (!FILLERS[nbKey]) {
    return {
      ok: false,
      message: `Kein Portal-Filler für "${nbKey}" vorhanden. Bitte manuell einreichen.`,
    };
  }

  // Passwort aus .env
  const passEnv = nb.portal_pass_env || 'PORTAL_PASS_DEFAULT';
  const password = process.env[passEnv];
  if (!password) {
    return {
      ok: false,
      message: `Passwort fehlt! Bitte ${passEnv} in .env eintragen.`,
    };
  }
  const credentials = {
    user: nb.portal_user || 'na@volta-energietechnik.de',
    password,
  };

  const screenshotDir = path.join(outputDir, 'screenshots');
  fs.mkdirSync(screenshotDir, { recursive: true });

  const browser = await chromium.launch({
    executablePath: findChrome(),
    headless: false,
    slowMo: 80,
    args: ['--start-maximized'],
  });

  const context = await browser.newContext({
    viewport: null,
    locale: 'de-DE',
  });
  const page = await context.newPage();

  const screenshots = [];
  let snapshotN = 0;

  async function snap(label) {
    const fn = path.join(screenshotDir, `${String(++snapshotN).padStart(2, '0')}_${label}.png`);
    await page.screenshot({ path: fn, fullPage: false });
    screenshots.push(fn);
    return fn;
  }

  try {
    const filler = FILLERS[nbKey]();
    const result = await filler.fill({ page, browser, credentials, bundle, extra, snap });

    await snap('entwurf_gespeichert');
    await browser.close();

    return {
      ok: true,
      screenshots,
      portalUrl: result?.portalUrl || nb.portal_url,
      message: result?.message || 'Entwurf erfolgreich gespeichert — bitte prüfen und manuell einreichen.',
    };
  } catch (err) {
    await snap('fehler').catch(() => {});
    await browser.close().catch(() => {});
    return {
      ok: false,
      screenshots,
      message: `Fehler beim Ausfüllen: ${err.message}`,
      stack: err.stack,
    };
  }
}

module.exports = { runPortalFiller, FILLERS };
