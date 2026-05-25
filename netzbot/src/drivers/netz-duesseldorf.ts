import { fillLovion } from './_lovion.js';
import type { PortalDriver } from '../types.js';

export const netzDuesseldorfDriver: PortalDriver = {
  netzbetreiber: 'Netz Düsseldorf',
  fillDraft: fillLovion,
};
