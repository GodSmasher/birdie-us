import type { PortalDriver } from '../types.js';

export const nErgieDriver: PortalDriver = {
  netzbetreiber: 'N-Ergie',
  fillDraft: async () => ({
    ok: false,
    error: 'N-Ergie: Driver noch nicht implementiert — Portal-URL unbekannt.',
  }),
};
