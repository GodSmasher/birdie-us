import { fillKundenmarktplatz } from './_kundenmarktplatz.js';
import type { PortalDriver } from '../types.js';

export const inetzDriver: PortalDriver = {
  netzbetreiber: 'iNetz',
  fillDraft: fillKundenmarktplatz,
};
