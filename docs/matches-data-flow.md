# Scoreboard data flow

The global [data-flow contract](architecture/data-flow.md) was copied verbatim from
`srikandi-merdeka-cup/docs/architecture/data-flow.md`. This document records the concrete
scoreboard pipeline in this repository.

## Shared pipeline

```text
app/page.tsx
  -> ScoresModule
  -> ScoresView (page composition + Suspense)
  -> ScoresSection (connection() + async server boundary)
  -> getScoreboardQuery (request deduplication + canonical result/error contract)
  -> getScoreboardData (runtime envelope validation + freshness ownership)
  -> fetchFirebaseScores (transport parameters and authorization)
  -> fetchJson (HTTPS GET, no-store, timeout)
  -> Firebase Realtime Database /bdmntn-jati.json
```

Client refreshes use TanStack Query and rejoin the same query:

```text
ScoresBoard
  -> GET /api/scores
  -> getScoreboardQuery
  -> the same service, mapper and adapter
```

The client receives only `ScoreboardData`. It never receives the raw Firebase record, a service
account, an access token, or the source's private-LAN image URLs. Browser code calls only the
internal endpoint.

## Source contract and validation

The configured node contains `{ match, updatedAt }`. `match` may be an array, a keyed object,
`null`, or absent: when a match ends the scorer clears that court, and Firebase drops keys whose
value becomes empty, so a fully cleared feed has no `match` key and maps to an empty list. A court
cleared down to just its number (e.g. `{ court: 7 }`) maps to a waiting court (`available: false`). Null holes
and entries whose court number is blank or missing are skipped. Other entries must be objects with
a usable numeric court identifier; duplicate courts and malformed records (e.g. `court: "abc"`)
fail validation rather than turning into empty success. A null root is a missing node.
`mapScoreboard()` applies these rules on the server.

The [mapper](../src/modules/scores/mappers/scores-mapper.ts) owns raw-to-canonical conversion:

- Pair `team1_fullname_p1/p2` with `team1set1/2/3`, and similarly for team 2. Never pair `side*`
  names with `team*` scores: physical side order can change independently.
- Fall back to `teamN_fullname` only when structured names are empty. Trim whitespace and omit
  blank doubles partners. Missing opponents remain missing in the canonical model.
- Accept integer scores 0–30. Missing, blank, boolean, nonnumeric and out-of-range scores map to
  `null`, distinct from numeric zero.
- A nonempty `teamN_service` or `teamN_service_small` string becomes a serving boolean. Never
  expose or fetch that private-LAN URL. Known country codes map to a local Indonesia flag or
  public FlagCDN SVGs, displayed at 4:3 with the code underneath.
- Preserve category and source info message. The raw mapper does not assign match status or
  winner. Negative upstream durations are not shown.
- `updatedAt` accepts epoch milliseconds/seconds or an ISO timestamp; invalid values remain null.

Pure [domain helpers](../src/modules/scores/lib/scoreboard.ts) compose filters, labels and flag
lookups. The highlighted score column is the latest game containing a recorded point; zero-filled
future games do not advance it. This is a presentation aid, not an authoritative game-status field.

The feed has no authoritative status field. As a deliberate presentation derivation,
`matchProgress()` counts completed badminton games (21 with a two-point margin, or the 30-point
cap). Two game wins identify a best-of-three winner. A started match without two game wins is
treated as ongoing for its indicator. A winner gets a static green circle; an ongoing serving
player gets a green Tailwind `animate-pulse` circle. Waiting courts do not pulse. Stale data,
offline state and refresh errors disable the pulse to avoid implying a fresh live feed.

## Freshness and errors

Live scores use a short in-memory service cache instead of `'use cache'`. `getScoreboardData()`
reuses a successful Firebase read for 1.5 seconds per server process (`createCachedLoader()` in
`src/lib/server/ttl-cache.ts`), and concurrent requests share one in-flight read. Firebase load
therefore stays at about one read per 1.5 seconds per instance, no matter how many viewers poll.
Failures are never cached. Transport still uses `cache: no-store`, and React `cache()` only
deduplicates work inside one server request. This is an explicit live-score exception to the
persistent service caching in the global contract.

TanStack Query refreshes every two seconds while the page is visible, retries a failed request
once and refreshes on focus/reconnection. It retains the last successful canonical payload on a
refresh error. No error turns into an empty list.

`sourceUpdatedAt` and `fetchedAt` have separate meanings. A successful HTTP request does not
prove the scorer has sent a new score. Source data older than two minutes, or lacking a valid
source timestamp, gets a stale-source notice. Transport errors and browser offline state get a
separate reconnecting/offline notice.

Socket resets, refused connections, DNS failures and request timeouts are classified into safe
error codes at the HTTP boundary. The query supplies user-facing messages without serializing
raw upstream details. Both initial failures and failed background refreshes show a red alert with
a retry action; the last successful score payload remains visible. Recovery clears the alert.

- Missing node -> HTTP 404 and explicit error result.
- Invalid/configuration/auth/transport failure -> HTTP 503 and a safe error result.
- Empty match collection -> HTTP 200 and an intentional empty state.
- Empty court slots -> remain visible as waiting courts while at least one court has a match.
- Every court waiting, or no courts at all -> `isBoardIdle()` replaces the cards with one
  "Tidak ada pertandingan berlangsung" panel. The feed has no status field; this is derived only
  from the courts being cleared.

## Server credentials

The optional credential path is in ignored `.env.local`; the key itself stays outside the repo.
The server can alternatively read a secret `FIREBASE_SERVICE_ACCOUNT_JSON`. Google Auth Library
exchanges the existing service account for a short-lived OAuth access token. The app only issues
GET requests to the database. The adapter uses a ten-second timeout for both transport and token
exchange, and never serializes credential or upstream error contents.

The read endpoint is intended to expose tournament scores to viewers. Adding private unrelated
fields to the source node does not expose them: only allowlisted canonical fields are returned.

## UI consumers and verification

`/` renders the scoreboard layout and all courts without pagination, rotation or screen-mode
buttons or filters. `/display` is a compatibility redirect to `/` in `next.config.ts`.
All canonical matches are rendered directly; query parameters do not restrict the court list.
The event heading is static branding from the supplied logo, not an upstream Firebase field.

Run `npm test` for score ownership, validation, whitespace, doubles, empty courts, timestamps,
filters and stale-source behavior. Run `npm run typecheck`, `npm run check:docs` and
`npm run build` for project checks.
