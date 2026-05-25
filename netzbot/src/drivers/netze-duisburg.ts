import type { PortalDriver } from '../types.js';

export const netzeDuisburgDriver: PortalDriver = {
  netzbetreiber: 'Netze Duisburg',
  fillDraft: async () => ({
    ok: false,
    error: 'Netze Duisburg: Driver noch nicht implementiert (SAP UI5, portal.netze-duisburg.de).',
  }),
};
