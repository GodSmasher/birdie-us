import type { PortalDriver } from '../types.js';

export const swOelsnitzDriver: PortalDriver = {
  netzbetreiber: 'SW Oelsnitz/V.',
  fillDraft: async () => ({
    ok: false,
    error: 'SW Oelsnitz/V.: Driver noch nicht implementiert — Portal-URL unbekannt.',
  }),
};
