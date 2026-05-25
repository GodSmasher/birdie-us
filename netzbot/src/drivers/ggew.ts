import type { PortalDriver } from '../types.js';

export const ggewDriver: PortalDriver = {
  netzbetreiber: 'GGEW',
  fillDraft: async () => ({
    ok: false,
    error: 'GGEW: Driver noch nicht implementiert (Kundenmarktplatz-Plattform, ggew.simplifier.cloud).',
  }),
};
