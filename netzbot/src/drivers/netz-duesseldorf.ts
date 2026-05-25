import type { PortalDriver } from '../types.js';

export const netzDuesseldorfDriver: PortalDriver = {
  netzbetreiber: 'Netz Düsseldorf',
  fillDraft: async () => ({
    ok: false,
    error: 'Netz Düsseldorf: Driver noch nicht implementiert (Lovion-Portal, kundenportal.netz-duesseldorf.de).',
  }),
};
