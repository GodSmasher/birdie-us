import { fillKundenmarktplatz } from './_kundenmarktplatz.js';
import type { PortalDriver } from '../types.js';

export const ggewDriver: PortalDriver = {
  netzbetreiber: 'GGEW',
  fillDraft: fillKundenmarktplatz,
};
