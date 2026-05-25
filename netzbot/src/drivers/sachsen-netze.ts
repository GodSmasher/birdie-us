// Driver für Sachsen Netze GmbH
// Portal (NAP): https://netzanschlussportal.sachsen-netze.de
//
// STUB — cidaas SSO mit 2FA (E-Mail-OTP) ist noch nicht automatisierbar.
// Bitte manuell im Portal einreichen.
//
// Technischer Hintergrund:
//   Auth: cidaas SSO + 2FA (E-Mail-OTP)
//   Für vollautomatische Ausführung wäre IMAP-Zugriff für OTP-Abruf
//   (extra.fetchEmailOtp) oder Deaktivierung der 2FA im cidaas-Profil nötig.
//
// Hinweis: Alte URL netzanschluss.sachsen-netze.de ist tot (ECONNREFUSED).
//          Korrekte URL: netzanschlussportal.sachsen-netze.de

import type { Job, PortalCredentials, FillResult, PortalDriver } from '../types.js';

async function fill(_job: Job, _creds: PortalCredentials): Promise<FillResult> {
  return {
    ok: false,
    error:
      'Sachsen Netze: cidaas 2FA (E-Mail-OTP) noch nicht automatisierbar — bitte manuell einreichen.',
  };
}

export const sachsenNetzeDriver: PortalDriver = {
  netzbetreiber: 'Sachsen Netze',
  fillDraft: fill,
};
