# @birdie/netzbot

Portal-Bot für die Netzanmeldung. Loggt sich beim Netzbetreiber-Portal ein, füllt
das Online-Formular aus den .birdie-Projektdaten **vor** und speichert es als
**Entwurf** — danach prüft ein Mensch und gibt frei. **Der Bot reicht nichts ein.**

## Unterstützte Portale (42)

### Implementiert (18)

| Netzbetreiber | Plattform | Driver | Status |
|---------------|-----------|--------|--------|
| MITNETZ STROM | EON-Gruppe (SFDC) | `mitnetz.ts` | ✅ verifiziert |
| Bayernwerk | EON-Gruppe (SFDC) | `bayernwerk.ts` | ✅ portiert |
| E.Dis | EON-Gruppe (SFDC) | `edis.ts` | ✅ portiert |
| Avacon | EON-Gruppe (SFDC) | `avacon.ts` | ✅ portiert |
| SW Suhl/Zella-Mehlis | Lovion | `sw-suhl.ts` | ✅ portiert |
| SW Bayreuth | Lovion | `sw-bayreuth.ts` | ✅ portiert |
| ZEV Zwickau | util.portal (MudBlazor) | `zev-zwickau.ts` | ✅ portiert |
| SW Meerane | util.portal (MudBlazor) | `sw-meerane.ts` | ✅ portiert |
| TEN | Standalone | `ten.ts` | ✅ portiert |
| Stromnetz Berlin | Standalone | `stromnetz-berlin.ts` | ✅ portiert |
| Netze Magdeburg | SAP UI5 | `netze-magdeburg.ts` | ✅ portiert |
| SW Lutherstadt | util.portal | `sw-lutherstadt.ts` | ✅ portiert |
| Werra Energie / EVB | ASP.NET WebForms | `werra-energie.ts` | ✅ portiert |
| EMS | Standalone | `ems.ts` | ✅ portiert |
| SW Delitzsch | HAP | `sw-delitzsch.ts` | ✅ portiert |
| SW Eschwege | Standalone | `sw-eschwege.ts` | ✅ portiert |
| SachsenEnergie | cidaas 2FA | `sachsenenergie.ts` | ⚠️ 2FA-Stub |
| Sachsen Netze | cidaas 2FA | `sachsen-netze.ts` | ⚠️ 2FA-Stub |

### Stubs (24 — Portal erkannt, Driver ausstehend)

| Netzbetreiber | Plattform/Hinweis | Driver |
|---------------|-------------------|--------|
| EVI-Netz | ? | `evi-netz.ts` |
| Netze BW | ? | `netze-bw.ts` |
| NRM | URL unbekannt | `nrm.ts` |
| N-Ergie | URL unbekannt | `n-ergie.ts` |
| SW Halle | IWS | `sw-halle.ts` |
| badenovaNETZE | Kundenmarktplatz | `badenova-netze.ts` |
| Celle-Uelzen Netz | VPN? | `celle-uelzen-netz.ts` |
| EAM Netz | URL unbekannt | `eam-netz.ts` |
| iNetz | Kundenmarktplatz | `inetz.ts` |
| Netz Leipzig | URL unbekannt | `netz-leipzig.ts` |
| SW Kulmbach | ? | `sw-kulmbach.ts` |
| ÜZ Mainfranken | AM Servicecenter | `uez-mainfranken.ts` |
| SW Ludwigsfelde | ? | `sw-ludwigsfelde.ts` |
| SW Jena | ? | `sw-jena.ts` |
| Enervie Vernetzt | HAV-Portal | `enervie-vernetzt.ts` |
| Netz Düsseldorf | Lovion? | `netz-duesseldorf.ts` |
| ESM Selb | HAP-Portal | `esm-selb.ts` |
| enercity Netz | Standalone | `enercity-netz.ts` |
| GGEW | Kundenmarktplatz | `ggew.ts` |
| Netze Duisburg | SAP UI5 | `netze-duisburg.ts` |
| Syna | URL unbekannt | `syna.ts` |
| EnR Rudolstadt | URL unbekannt | `enr-rudolstadt.ts` |
| SW Weißwasser | URL unbekannt | `sw-weisswasser.ts` |
| SW Oelsnitz/V. | URL unbekannt | `sw-oelsnitz.ts` |

## Warum ein eigener Worker (nicht Vercel)

Playwright braucht einen echten Browser und lange Laufzeiten — beides geht auf
Vercel (Serverless, max. 300 s) nicht. Der Bot läuft als dauerhafter Worker auf
Railway / Fly.io / einem kleinen VPS. Dieses Paket ist eigenständig (eigenes
`package.json`/`tsconfig`).

## Ablauf (Human-in-the-loop)

```
.birdie (freigegebene Daten)
        │  GET /api/netzanmeldung/bot
        ▼
   netzbot  ──Login──▶ Netzbetreiber-Portal
        │   ──Neuen Auftrag (Energie einspeisen)──▶
        │   ──Adresse + Messkonzept (WR/PV) vorausfüllen──▶
        │   ──Screenshot──▶
        │  POST /api/netzanmeldung/bot { offerId, recordDraft, draftRef }
        ▼
.birdie: Status „bitte prüfen"  ──▶  Mensch prüft & gibt frei  ──▶  (manuell) einreichen
```

## Konfiguration (Env, Secrets des Worker-Hosts — nie ins Repo)

| Var | Zweck |
|-----|-------|
| `BIRDIE_API_URL` | Basis-URL der .birdie-App |
| `BIRDIE_BOT_TOKEN` | Service-Token für Bot↔App (Bearer) |
| `NETZBOT_CREDS_<SLUG>` | Portal-Login `user\|pass\|portalUrl` pro Netzbetreiber |
| `NETZBOT_HEADLESS` | `false` zum Entwickeln (Browser sichtbar) |
| `NETZBOT_POLL_MS` | Poll-Intervall in ms (Default 60000) |

## Neuen Portal-Driver bauen

1. Referenz-Filler in `reference/` prüfen (z.B. `_eon-group.js` für EON-Portale).
2. `src/drivers/<id>.ts` nach Vorbild `mitnetz.ts` erstellen.
3. In `src/drivers/index.ts` registrieren. `netzbetreiber` muss exakt dem Namen aus
   `.birdie` (`netzbetreiberForPlz`) entsprechen.
4. Testen: `NETZBOT_HEADLESS=false npm run once`

## Konsolidierung

Die Portal-Filler wurden aus `birdie-connectoren/portal-bot/` hierher konsolidiert.
`birdie-connectoren` enthält nur noch das Connector-SDK (Reonic, EcoFlow, Gmail, …).
Die JS-Referenzdateien in `reference/` sind nicht Teil des Builds — sie dienen als
Vorlage zum Portieren weiterer TypeScript-Driver.

## Lokal

```bash
npm install
npx playwright install chromium
npm run once      # ein Durchlauf
npm run dev       # Dauerschleife
```
