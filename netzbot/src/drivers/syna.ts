import type { PortalDriver } from '../types.js';

export const synaDriver: PortalDriver = {
  netzbetreiber: 'Syna',
  fillDraft: async () => ({
    ok: false,
    error: 'Syna: Driver noch nicht implementiert — Portal-URL unbekannt.',
  }),
};
