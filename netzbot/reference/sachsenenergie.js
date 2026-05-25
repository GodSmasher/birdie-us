/**
 * SachsenEnergie AG — Portal-Filler
 *
 * WICHTIG: SachsenEnergie ist der Energieversorger. Netzbetreiber = SachsenNetze GmbH.
 * Installateurportal läuft über SachsenNetze → netzanschlussportal.sachsen-netze.de
 *
 * Auth: cidaas SSO — E-Mail + Passwort + 2FA (OTP per E-Mail)
 * ACHTUNG: 2FA macht vollautomatische Ausführung schwierig!
 * Lösung: IMAP-Zugriff für OTP-Abruf, oder 2FA im cidaas-Profil deaktivieren.
 *
 * TODO: Login + Formularstruktur nach Live-Inspektion vollständig implementieren.
 */

const PORTAL_URL = 'https://netzanschlussportal.sachsen-netze.de';

async function fill({ page, credentials, bundle, extra, snap }) {
  const { user, password } = credentials;
  const s = bundle.anlagenstandort;

  await page.goto(PORTAL_URL, { waitUntil: 'networkidle', timeout: 30000 });
  await snap('01_portal_start');

  // TODO: cidaas Login (cidaas-Pattern: input[name="username"], input[name="password"])
  // await page.fill('input[name="username"]', user);
  // await page.fill('input[name="password"]', password);
  // await page.click('button[type="submit"]');
  // → 2FA OTP wird per E-Mail gesendet → OTP-Feld ausfüllen
  await snap('02_nach_login');

  // TODO: NAP Navigation + PV-Einspeise-Antrag anlegen
  await snap('03_formular');

  return {
    portalUrl: page.url(),
    message: [
      'SachsenEnergie/SachsenNetze (NAP): TODO: cidaas Login (2FA!) + Formular noch nicht implementiert.',
      `Adresse: ${s.strasse} ${s.hausnummer}, ${s.plz}`,
    ].join(' | '),
  };
}

module.exports = { fill };
