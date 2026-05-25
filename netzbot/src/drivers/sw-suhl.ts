// Driver für SW Suhl/Zella-Mehlis — Lovion-Portal
// Portal: https://netzportal.swsz-netz.de/public/login.html

import { fillLovion } from './_lovion.js';
import type { Job, PortalCredentials, FillResult, PortalDriver } from '../types.js';

export const swSuhlDriver: PortalDriver = {
  netzbetreiber: 'SW Suhl',
  fillDraft(job: Job, creds: PortalCredentials): Promise<FillResult> {
    return fillLovion(job, creds);
  },
};
