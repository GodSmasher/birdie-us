// Driver für SachsenEnergie AG
//
// STUB — cidaas SSO mit 2FA (E-Mail-OTP) ist noch nicht automatisierbar.
// Bitte manuell im Portal einreichen:
//   https://netzanschlussportal.sachsen-netze.de
//
// Technischer Hintergrund:
//   Auth: cidaas SSO — E-Mail + Passwort + 2FA (OTP per E-Mail)
//   Für vollautomatische Ausführung wäre IMAP-Zugriff für OTP-Abruf
//   oder Deaktivierung der 2FA im cidaas-Profil nötig.

import type { Job, PortalCredentials, FillResult, PortalDriver } from '../types.js';

async function fill(_job: Job, _creds: PortalCredentials): Promise<FillResult> {
  return {
    ok: false,
    error:
      'SachsenEnergie: cidaas 2FA (E-Mail-OTP) noch nicht automatisierbar — bitte manuell einreichen.',
  };
}

export const sachsenenergieDriver: PortalDriver = {
  netzbetreiber: 'SachsenEnergie',
  fillDraft: fill,
};
