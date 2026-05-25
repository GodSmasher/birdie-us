import type { PortalDriver } from '../types.js';

export const inetzDriver: PortalDriver = {
  netzbetreiber: 'iNetz',
  fillDraft: async () => ({
    ok: false,
    error: 'iNetz: Driver noch nicht implementiert (Kundenmarktplatz-Plattform).',
  }),
};
