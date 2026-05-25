import type { PortalDriver } from '../types.js';

export const esmSelbDriver: PortalDriver = {
  netzbetreiber: 'ESM Selb',
  fillDraft: async () => ({
    ok: false,
    error: 'ESM Selb: Driver noch nicht implementiert (HAP-Portal, netz-portal.esm-selb.de).',
  }),
};
