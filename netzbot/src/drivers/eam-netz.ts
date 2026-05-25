import type { PortalDriver } from '../types.js';

export const eamNetzDriver: PortalDriver = {
  netzbetreiber: 'EAM Netz',
  fillDraft: async () => ({
    ok: false,
    error: 'EAM Netz: Driver noch nicht implementiert — Portal-URL unbekannt.',
  }),
};
