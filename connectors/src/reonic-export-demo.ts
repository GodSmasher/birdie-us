// Exports the live Reonic catalog to DATANORM (Reonic → ERP/Großhandel).
//   REONIC_API_KEY=... REONIC_CLIENT_ID=... npm run reonic-export
// Reads credentials from env only — never hardcode secrets.

import { reonicExportDatanorm } from './connectors/reonic.js';
import { createResilientFetch } from './http.js';
import type { ConnectorContext } from './types.js';

async function main() {
  const { REONIC_API_KEY, REONIC_CLIENT_ID, REONIC_BASE_URL } = process.env;
  if (!REONIC_API_KEY || !REONIC_CLIENT_ID) {
    console.error('Bitte REONIC_API_KEY und REONIC_CLIENT_ID setzen.');
    process.exit(1);
  }

  const ctx: ConnectorContext = {
    config: { apiKey: REONIC_API_KEY, clientId: REONIC_CLIENT_ID, ...(REONIC_BASE_URL ? { baseUrl: REONIC_BASE_URL } : {}) },
    fetch: createResilientFetch({ retries: 2, timeoutMs: 20000 }),
  };

  console.log('\n▸ Reonic-Katalog → DATANORM Export\n');
  const { count, datanorm } = await reonicExportDatanorm(ctx);
  const lines = datanorm.trimEnd().split('\r\n');
  console.log(`  ${count} Komponenten exportiert · ${lines.length} DATANORM-Zeilen\n`);
  console.log('  Kopf + erste 6 Artikel:');
  for (const l of lines.slice(0, 7)) console.log('    ' + l.slice(0, 100));
  console.log('\n✓ Reonic-Katalog ist DATANORM-konform exportierbar (ans Kunden-ERP / Großhandel).');
}

main().catch((e) => {
  console.error('Fehler:', (e as Error).message);
  process.exit(1);
});
