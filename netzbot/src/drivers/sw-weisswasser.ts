import type { PortalDriver } from '../types.js';

export const swWeisswasserDriver: PortalDriver = {
  netzbetreiber: 'SW Weißwasser',
  fillDraft: async () => ({
    ok: false,
    error: 'SW Weißwasser: Driver noch nicht implementiert — Portal-URL unbekannt.',
  }),
};
