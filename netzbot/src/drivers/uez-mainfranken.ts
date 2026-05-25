import type { PortalDriver } from '../types.js';

export const uezMainfrankenDriver: PortalDriver = {
  netzbetreiber: 'ÜZ Mainfranken',
  fillDraft: async () => ({
    ok: false,
    error: 'ÜZ Mainfranken: Driver noch nicht implementiert (am-suite.de Registrierungsportal).',
  }),
};
