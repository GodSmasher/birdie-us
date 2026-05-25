// Driver für Bayernwerk Netz — EON-Gruppe SFDC Installateurportal.
// Delegiert an die gemeinsame EON-Gruppe-Logik in _eon-group.ts.

import { fillEonGroup } from './_eon-group.js';
import type { PortalDriver } from '../types.js';

export const bayernwerkDriver: PortalDriver = {
  netzbetreiber: 'Bayernwerk',
  fillDraft: fillEonGroup,
};
