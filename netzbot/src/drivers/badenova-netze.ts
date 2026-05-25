import type { PortalDriver } from '../types.js';

export const badenovaNetzeDriver: PortalDriver = {
  netzbetreiber: 'badenovaNETZE',
  fillDraft: async () => ({
    ok: false,
    error: 'badenovaNETZE: Driver noch nicht implementiert (Kundenmarktplatz-Plattform, netzportal.badenovanetze.de).',
  }),
};
