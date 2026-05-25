import type { PortalDriver } from '../types.js';

export const enervieVernetzDriver: PortalDriver = {
  netzbetreiber: 'Enervie Vernetzt',
  fillDraft: async () => ({
    ok: false,
    error: 'Enervie Vernetzt: Driver noch nicht implementiert (HAV-Portal, hav.enervie-vernetzt.de).',
  }),
};
