import type { PortalDriver } from '../types.js';

export const swHalleDriver: PortalDriver = {
  netzbetreiber: 'SW Halle',
  fillDraft: async () => ({
    ok: false,
    error: 'SW Halle: Driver noch nicht implementiert (IWS-Portal, Energieversorgung Halle Netz GmbH).',
  }),
};
