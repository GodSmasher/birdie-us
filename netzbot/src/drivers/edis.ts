// Driver für E.DIS Netz — EON-Gruppe SFDC Installateurportal.
// Delegiert an die gemeinsame EON-Gruppe-Logik in _eon-group.ts.

import { fillEonGroup } from './_eon-group.js';
import type { PortalDriver } from '../types.js';

export const edisDriver: PortalDriver = {
  netzbetreiber: 'E.DIS',
  fillDraft: fillEonGroup,
};
