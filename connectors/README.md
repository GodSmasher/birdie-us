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

## Adding a connector

1. Create `src/connectors/<id>.ts` exporting a `Connector`.
2. Implement `manifest`, `testConnection`, `pull`.
3. Register it in `src/registry.ts`.

## Access patterns (important for solar hardware)

- **Cloud API** (Tibber, Solcast, OWM, aWATTar, EcoFlow, Victron VRM, Sungrow iSolarCloud): cloud-to-cloud, just credentials.
- **Local Modbus TCP** (Kostal; local path of Fronius/SMA/Sungrow): the inverter is only reachable inside the customer LAN → needs an on-site **edge agent** that polls Modbus and pushes upstream. Cloud cannot reach it directly.
- **Manufacturer cloud portals** (Fronius Solar.web, SMA ennexOS): official APIs, require registration/approval.
- **No official API** (Anker SOLIX, Bluetti): community/reverse-engineered — use with care.
