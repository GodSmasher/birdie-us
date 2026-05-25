import type { PortalDriver } from '../types.js';

export const swLudwigsfeldeDriver: PortalDriver = {
  netzbetreiber: 'SW Ludwigsfelde',
  fillDraft: async () => ({
    ok: false,
    error: 'SW Ludwigsfelde: Driver noch nicht implementiert.',
  }),
};
