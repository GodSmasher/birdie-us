import type { PortalDriver } from '../types.js';

export const enercityNetzDriver: PortalDriver = {
  netzbetreiber: 'enercity Netz',
  fillDraft: async () => ({
    ok: false,
    error: 'enercity Netz: Driver noch nicht implementiert (inbetriebsetzungsauftrag.enercity-netz.de).',
  }),
};
