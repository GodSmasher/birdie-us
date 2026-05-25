# @birdie/connectors

Connector SDK + adapters for the .birdie platform — DACH solar hardware, dynamic tariffs, weather/forecast and backoffice integrations.

Every connector implements one interface (`src/types.ts`):

```ts
interface Connector<TPull> {
  manifest: ConnectorManifest;              // self-describing metadata
  testConnection(ctx): Promise<TestResult>; // cheap reachability + auth check
  pull(ctx, opts?): Promise<TPull>;         // normalized data
}
```

The frontend renders the connector catalog from `allManifests()` — no hardcoded lists.

## Live connectors

| ID | Vendor | Category | Auth | Status |
|----|--------|----------|------|--------|
| `awattar` | aWATTar | Tarif | none | stable |
| `tibber` | Tibber | Tarif | token | stable |
| `solcast` | Solcast | Wetter/Prognose | apikey | stable |
| `openweathermap` | OpenWeather | Wetter | apikey | stable |
| `ecoflow` | EcoFlow | Speicher/WR | apikey (HMAC) | beta |
| `reonic` | Reonic | CRM/ERP | token | beta |

## DATANORM ⇄ Reonic bridge

Reonic has no native DATANORM endpoint. `src/datanorm.ts` bridges the wholesale
article standard (Krannich, BayWa r.e., Memodo …) to Reonic `components`:

```bash
npm run datanorm-demo   # parse → map to Reonic → export back (pure transform, no key)
```

- `parseDatanorm(text)` — DATANORM 4.0 Satzart "A" → article records
- `articlesToComponents(...)` — map to Reonic component payloads
- `componentsToDatanorm(...)` — export Reonic components back to DATANORM
- `reonicSyncDatanorm(ctx, text, { dryRun })` — upsert into Reonic by articleNumber

Planned (manifest only, see `registry.ts`): Fronius, SMA, Kostal, Sungrow, EcoFlow, Victron, Anker SOLIX, Bluetti, Bexio, sevDesk, DATEV, WhatsApp.

## Test against the real API

```bash
cd connectors
npm install

# keyless — works out of the box
npm run test:connector -- awattar --region=de
npm run test:connector -- awattar --region=at

# with credentials (or set env vars TIBBER_TOKEN etc.)
npm run test:connector -- tibber --token=YOUR_TOKEN
npm run test:connector -- solcast --apiKey=KEY --resourceId=SITE
npm run test:connector -- openweathermap --apiKey=KEY --lat=46.85 --lon=9.53

# dump the full catalog as JSON
npm run manifests
```

## Runtime — built for volume

The SDK ships a polling runtime so the platform can fan out over many
installations without overwhelming APIs or failing whole batches:

- **`createResilientFetch(policy)`** — timeout (AbortController), retry with
  exponential backoff + jitter, honors HTTP 429 / `Retry-After`. Injected as
  `ctx.fetch`, so connectors stay dumb.
- **`RateGate(minIntervalMs)`** — per-connector minimum-interval guard.
- **`runBatch(jobs, opts)`** — concurrency-limited fan-out with per-job error
  isolation (one failure never kills the batch).
- **`toReadings(pull, meta)`** — flattens any pull into normalized `Reading`
  rows (`metric`, `value`, `unit`, `ts`) ready for bulk-insert into a TSDB.

```bash
npm run poll-demo   # 21 live jobs → ~480 readings in ~1.5s, with one failure isolated
```

```ts
import { runBatch, summarize } from '@birdie/connectors';
const results = await runBatch(jobs, {
  concurrency: 8,
  retry: { retries: 3, timeoutMs: 10000 },
  minIntervalMsPerConnector: 200,
});
```

## Adding a connector

1. Create `src/connectors/<id>.ts` exporting a `Connector`.
2. Implement `manifest`, `testConnection`, `pull`.
3. Register it in `src/registry.ts`.

## Access patterns (important for solar hardware)

- **Cloud API** (Tibber, Solcast, OWM, aWATTar, EcoFlow, Victron VRM, Sungrow iSolarCloud): cloud-to-cloud, just credentials.
- **Local Modbus TCP** (Kostal; local path of Fronius/SMA/Sungrow): the inverter is only reachable inside the customer LAN → needs an on-site **edge agent** that polls Modbus and pushes upstream. Cloud cannot reach it directly.
- **Manufacturer cloud portals** (Fronius Solar.web, SMA ennexOS): official APIs, require registration/approval.
- **No official API** (Anker SOLIX, Bluetti): community/reverse-engineered — use with care.

## Eigenständigkeit / Auslagern in ein eigenes Repo

Dieses Paket ist bewusst **entkoppelt**: es importiert nichts aus der `.birdie`-App,
und die App importiert nichts von hier (sie nutzt eigene gespiegelte Server-Libs).
`connectors/` lässt sich daher 1:1 in ein eigenes GitHub-Repo überführen.

Auslagern **mit erhaltener Git-Historie** (nur den connectors-Ordner):

```bash
# im birdie-Repo, Historie des Unterordners als eigenen Branch herauslösen
git subtree split --prefix=connectors -b connectors-export

# neues, leeres Repo auf GitHub anlegen (z.B. godsmasher/birdie-connectors), dann:
git push git@github.com:godsmasher/birdie-connectors.git connectors-export:main
```

Danach kann der `connectors/`-Ordner aus dem App-Repo entfernt werden; die App bleibt
unberührt, weil sie keine Build-Abhängigkeit auf dieses Paket hat.
