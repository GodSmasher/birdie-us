import type { PortalDriver } from '../types.js';

export const netzLeipzigDriver: PortalDriver = {
  netzbetreiber: 'Netz Leipzig',
  fillDraft: async () => ({
    ok: false,
    error: 'Netz Leipzig: Driver noch nicht implementiert — Portal-URL unbekannt.',
  }),
};
