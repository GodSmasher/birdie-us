// Driver für SW Bayreuth — Lovion-Portal
// Portal: https://www.stadtwerke-bayreuth.de/installateurportal/public/login.html

import { fillLovion } from './_lovion.js';
import type { Job, PortalCredentials, FillResult, PortalDriver } from '../types.js';

export const swBayreuthDriver: PortalDriver = {
  netzbetreiber: 'SW Bayreuth',
  fillDraft(job: Job, creds: PortalCredentials): Promise<FillResult> {
    return fillLovion(job, creds);
  },
};
