import type { PortalDriver } from '../types.js';

export const eviNetzDriver: PortalDriver = {
  netzbetreiber: 'EVI-Netz',
  fillDraft: async () => ({
    ok: false,
    error: 'EVI-Netz: Driver noch nicht implementiert (evi-netz.de/installateurportal).',
  }),
};
