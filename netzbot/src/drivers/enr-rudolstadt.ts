import type { PortalDriver } from '../types.js';

export const enrRudolstadtDriver: PortalDriver = {
  netzbetreiber: 'EnR Rudolstadt',
  fillDraft: async () => ({
    ok: false,
    error: 'EnR Rudolstadt: Driver noch nicht implementiert — Portal-URL unbekannt.',
  }),
};
