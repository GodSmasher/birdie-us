// Driver für ZEV Zwickau — util.portal (MudBlazor / Blazor Server).
// Portal: https://netzportal.zev-energie.de
// Selektoren verifiziert am 2026-05-25 gegen _util-portal.js Referenz.

import type { Job, PortalCredentials, FillResult, PortalDriver } from '../types.js';
import { fillUtilPortal } from './_util-portal.js';

async function fill(job: Job, creds: PortalCredentials): Promise<FillResult> {
  // portalUrl kommt aus creds (NETZBOT_CREDS_ZEV_ZWICKAU="user|pass|https://netzportal.zev-energie.de")
  // Fallback auf hard-kodierte URL, falls creds.portalUrl fehlt
  const effectiveCreds: PortalCredentials = {
    ...creds,
    portalUrl: creds.portalUrl || 'https://netzportal.zev-energie.de',
  };
  return fillUtilPortal(job, effectiveCreds);
}

export const zevZwickauDriver: PortalDriver = {
  netzbetreiber: 'ZEV Zwickau',
  fillDraft: fill,
};
