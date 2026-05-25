# @birdie/netzbot

Portal-Bot für die Netzanmeldung. Loggt sich beim Netzbetreiber-Portal ein, füllt
das Online-Formular aus den .birdie-Projektdaten **vor** und speichert es als
**Entwurf** — danach prüft ein Mensch und gibt frei. **Der Bot reicht nichts ein.**

> Prototyp-Stand: ein Driver (MITNETZ STROM, Voltas Region) als Gerüst. Die
> Portal-Selektoren sind Platzhalter und müssen einmal real aufgenommen werden.

## Warum ein eigener Worker (nicht Vercel)

Playwright braucht einen echten Browser und lange Laufzeiten — beides geht auf
Vercel (Serverless, max. 30 s) nicht. Der Bot läuft als dauerhafter Worker auf
Railway / Fly.io / einem kleinen VPS. Dieses Paket ist eigenständig (eigenes
`package.json`/`tsconfig`) und kann wie `@birdie/connectors` in ein eigenes Repo.

## Ablauf (Human-in-the-loop)

```
.birdie (freigegebene Daten)
        │  GET /api/netzanmeldung/jobs
        ▼
   netzbot  ──Login──▶ Netzbetreiber-Portal
        │   ──Formular vorausfüllen──▶
        │   ──Entwurf speichern + Screenshot──▶
        │  POST /api/netzanmeldung { recordDraft }
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

## Neuen Portal-Driver bauen

1. DOM aufnehmen: `npx playwright codegen <portalUrl>` → Selektoren ablesen.
2. `src/drivers/<id>.ts` nach Vorbild `mitnetz.ts` füllen (Login, Felder, „Zwischenspeichern").
3. In `src/drivers/index.ts` registrieren. `netzbetreiber` muss exakt dem Namen aus
   `.birdie` (`netzbetreiberForPlz`) entsprechen.

## Noch in der .birdie-App umzusetzen (Integrations-Vertrag)

- `GET /api/netzanmeldung/jobs` (Bearer-Token) → liefert vorausgefüllte `Job[]`.
- `POST /api/netzanmeldung` muss das Bot-Bearer-Token zusätzlich zum Cookie akzeptieren.

## Lokal

```bash
npm install
npx playwright install chromium
npm run once      # ein Durchlauf
npm run dev       # Dauerschleife
```
