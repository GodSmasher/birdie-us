import type { PortalDriver } from '../types.js';

export const celleUelzenNetzDriver: PortalDriver = {
  netzbetreiber: 'Celle-Uelzen Netz',
  fillDraft: async () => ({
    ok: false,
    error: 'Celle-Uelzen Netz: Driver noch nicht implementiert (arbeiten.celle-uelzennetz.de, VPN-Zugang).',
  }),
};
