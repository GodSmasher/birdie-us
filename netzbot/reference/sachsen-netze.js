/**
 * Sachsen Netze GmbH — Portal-Filler
 * Portal (NAP): https://netzanschlussportal.sachsen-netze.de
 *
 * ACHTUNG: Alte URL netzanschluss.sachsen-netze.de ist tot (ECONNREFUSED).
 * Korrekte URL: netzanschlussportal.sachsen-netze.de
 *
 * Auth: cidaas SSO + 2FA (E-Mail-OTP)
 * TODO: Login-Flow inkl. 2FA + NAP-Formularstruktur nach Live-Inspektion eintragen.
 */

const PORTAL_URL = 'https://netzanschlussportal.sachsen-netze.de';

async function fill({ page, credentials, bundle, extra, snap }) {
  const { user, password } = credentials;
  const s = bundle.anlagenstandort;

  await page.goto(PORTAL_URL, { waitUntil: 'networkidle', timeout: 30000 });
  await snap('01_portal_start');

  // TODO: cidaas Login
  // await page.fill('input[name="username"], input[type="email"]', user);
  // await page.fill('input[name="password"]', password);
  // await page.click('button[type="submit"]');
  // → 2FA OTP lesen: extra.fetchEmailOtp?.() → IMAP nötig
  await snap('02_nach_login');

  await snap('03_formular');

  return {
    portalUrl: page.url(),
    message: [
      'Sachsen Netze (NAP/cidaas): TODO: Login inkl. 2FA + Formular implementieren.',
      `Adresse: ${s.strasse} ${s.hausnummer}, ${s.plz}`,
    ].join(' | '),
  };
}

module.exports = { fill };
