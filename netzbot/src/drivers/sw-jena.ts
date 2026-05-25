import type { PortalDriver } from '../types.js';

export const swJenaDriver: PortalDriver = {
  netzbetreiber: 'SW Jena',
  fillDraft: async () => ({
    ok: false,
    error: 'SW Jena: Driver noch nicht implementiert.',
  }),
};
