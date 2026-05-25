// Driver für SW Meerane — util.portal (MudBlazor / Blazor Server).
// Portal: https://netzanschlussportal.sw-meerane.de
// Selektoren verifiziert am 2026-05-25 gegen _util-portal.js Referenz.

import type { Job, PortalCredentials, FillResult, PortalDriver } from '../types.js';
import { fillUtilPortal } from './_util-portal.js';

async function fill(job: Job, creds: PortalCredentials): Promise<FillResult> {
  // portalUrl kommt aus creds (NETZBOT_CREDS_SW_MEERANE="user|pass|https://netzanschlussportal.sw-meerane.de")
  const effectiveCreds: PortalCredentials = {
    ...creds,
    portalUrl: creds.portalUrl || 'https://netzanschlussportal.sw-meerane.de',
  };
  return fillUtilPortal(job, effectiveCreds);
}

export const swMeeraneDriver: PortalDriver = {
  netzbetreiber: 'SW Meerane',
  fillDraft: fill,
};
