import type { PortalDriver } from '../types.js';

export const nrmDriver: PortalDriver = {
  netzbetreiber: 'NRM',
  fillDraft: async () => ({
    ok: false,
    error: 'NRM: Driver noch nicht implementiert — Portal-URL unbekannt.',
  }),
};
