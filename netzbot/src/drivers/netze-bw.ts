import type { PortalDriver } from '../types.js';

export const netzeBwDriver: PortalDriver = {
  netzbetreiber: 'Netze BW',
  fillDraft: async () => ({
    ok: false,
    error: 'Netze BW: Driver noch nicht implementiert (anschlussportal.netze-bw.de).',
  }),
};
