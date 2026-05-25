import type { PortalDriver } from '../types.js';

export const swKulmbachDriver: PortalDriver = {
  netzbetreiber: 'SW Kulmbach',
  fillDraft: async () => ({
    ok: false,
    error: 'SW Kulmbach: Driver noch nicht implementiert (nutzt Bayernwerk mHAP-Portal).',
  }),
};
