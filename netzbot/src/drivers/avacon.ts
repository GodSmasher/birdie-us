// Driver für Avacon Netz — EON-Gruppe SFDC Installateurportal.
// Delegiert an die gemeinsame EON-Gruppe-Logik in _eon-group.ts.

import { fillEonGroup } from './_eon-group.js';
import type { PortalDriver } from '../types.js';

export const avaconDriver: PortalDriver = {
  netzbetreiber: 'Avacon',
  fillDraft: fillEonGroup,
};
