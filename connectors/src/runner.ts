// CLI to test a connector against the real API.
//   npm run test:connector -- awattar --region=at
//   npm run test:connector -- tibber --token=XXXX
// Config also read from env: TIBBER_TOKEN, SOLCAST_API_KEY, SOLCAST_RESOURCE_ID, OWM_API_KEY, OWM_LAT, OWM_LON, AWATTAR_REGION

import { getConnector, connectors } from './registry.js';
import { createResilientFetch } from './http.js';
import type { ConnectorContext } from './types.js';

function parseArgs(argv: string[]): { id?: string; config: Record<string, string> } {
  const config: Record<string, string> = {};
  let id: string | undefined;
  for (const a of argv) {
    if (a.startsWith('--')) {
      const [k, ...rest] = a.slice(2).split('=');
      config[k] = rest.join('=');
    } else if (!id) {
      id = a;
    }
  }
  return { id, config };
}

function envConfig(id: string): Record<string, string> {
  const e = process.env;
  const map: Record<string, Record<string, string | undefined>> = {
    awattar: { region: e.AWATTAR_REGION },
    tibber: { token: e.TIBBER_TOKEN },
    solcast: { apiKey: e.SOLCAST_API_KEY, resourceId: e.SOLCAST_RESOURCE_ID },
    openweathermap: { apiKey: e.OWM_API_KEY, lat: e.OWM_LAT, lon: e.OWM_LON },
  };
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(map[id] ?? {})) if (v) out[k] = v;
  return out;
}

async function main() {
  const { id, config } = parseArgs(process.argv.slice(2));

  if (!id) {
    console.log('Verfügbare Connectoren:');
    for (const c of connectors) {
      console.log(`  • ${c.manifest.id.padEnd(16)} ${c.manifest.name} (${c.manifest.category}, auth=${c.manifest.authType})`);
    }
    console.log('\nNutzung: npm run test:connector -- <id> [--key=value ...]');
    return;
  }

  const connector = getConnector(id);
  if (!connector) {
    console.error(`Unbekannter Connector: ${id}`);
    process.exit(1);
  }

  const ctx: ConnectorContext = {
    config: { ...envConfig(id), ...config },
    fetch: createResilientFetch({ retries: 3, timeoutMs: 10000 }),
    logger: (m) => console.log('  ' + m),
  };

  console.log(`\n▸ ${connector.manifest.name} (${connector.manifest.id})`);
  console.log('  testConnection...');
  const test = await connector.testConnection(ctx);
  console.log(`  ${test.ok ? '✓' : '✗'} ${test.message}${test.latencyMs != null ? ` · ${test.latencyMs}ms` : ''}`);
  if (!test.ok) {
    process.exit(test.message.includes('Konfiguration') ? 0 : 1);
  }

  console.log('  pull...');
  const data = await connector.pull(ctx);
  const preview = JSON.stringify(data, null, 2);
  console.log(preview.length > 1400 ? preview.slice(0, 1400) + '\n  … (gekürzt)' : preview);
}

main().catch((e) => {
  console.error('Fehler:', (e as Error).message);
  process.exit(1);
});
