import { fillKundenmarktplatz } from './_kundenmarktplatz.js';
import type { PortalDriver } from '../types.js';

export const badenovaNetzeDriver: PortalDriver = {
  netzbetreiber: 'badenovaNETZE',
  fillDraft: fillKundenmarktplatz,
};
