# Online Score

Mobile-first badminton scoreboard for MilkLife Indonesia Junior International Series 2026.

Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, shadcn/ui components backed by Radix,
and TanStack Query. Node **24.17.0** is pinned in `.nvmrc` and `.node-version` to match the build server
(`package.json` accepts Node 24.17.0 and later, up to Node 26; the Docker runtime uses Node 26).

## Run locally

```sh
nvm install
nvm use
npm ci
```

Copy `.env.example` to `.env.local`. For authenticated Firebase reads, store the service-account
JSON in the server-only `FIREBASE_SERVICE_ACCOUNT_JSON` environment secret. Alternatively, set
`GOOGLE_APPLICATION_CREDENTIALS` to a key file outside the repository. The JSON-secret option has
no dependency on the original downloaded key file. Never put credentials in `public/` or commit them.

```sh
npm run dev
```

Open `http://localhost:2906` for the responsive scoreboard. The home page uses the full scoreboard
layout and shows every court together, without pagination or automatic rotation. `/display`
redirects to `/`. Every court is shown with no filters or search controls. The main heading uses
the full event name from the supplied reference logo, rather than a Firebase field or an
abbreviation. Data refreshes every two seconds while visible, and stale source data is labeled.
Country flags have a 4:3 ratio and no code label; a country without a flag shows its code
in the placeholder.
Flags for the participating countries (Indonesia, Malaysia, Philippines, Singapore, Austria,
France, United States) are local 4:3 SVGs from [flag-icons](https://flagicons.lipis.dev) (MIT,
license in `public/flags/LICENSE-flag-icons.txt`). Chinese Taipei uses its own Olympic flag
(`tpe.png`); any other known country falls back to FlagCDN.

Firebase connection/socket errors show a red alert while preserving the last score and retrying
automatically. The development server allows HMR from `103.6.207.2` as well as localhost. If that
address changes, update `allowedDevOrigins` in `next.config.ts` and restart the dev server.

Use the Node 24 version pinned in `.nvmrc`. Switch to Node 24 before using Yarn scripts,
which enforce the `engines` range.

## Firebase

```text
FIREBASE_DATABASE_URL=https://livescore-bdmntn-default-rtdb.asia-southeast1.firebasedatabase.app
FIREBASE_DATABASE_PATH=bdmntn-jati
GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/service-account.json
```

For deployment, use `FIREBASE_SERVICE_ACCOUNT_JSON` as a server-only secret instead of a local
key file. No Google login is needed for viewers: the server reads the configured score node.
No database writes, rule changes, or project-setting changes are performed by the app.

The configured database belongs to project `livescore-bdmntn`. Service-account credentials are
separate from a personal Google login. Browser requests use `/api/scores`; credentials stay server-side.

## Architecture

- [Global data-flow contract](docs/architecture/data-flow.md): copied unchanged from the
  `srikandi-merdeka-cup` repository.
- [Scoreboard data flow](docs/matches-data-flow.md): source contract, layer ownership, trust
  boundary, freshness, errors and consumers in this app.
- Styling: components use inline Tailwind utility classes. `src/app/globals.css` only holds the
  theme tokens, base element styles and the `page-width` container utility. Only the default
  Tailwind breakpoints are used: `sm` (640px) for tablets and `lg` (1024px) for the wide court layout. Board building blocks (toolbar,
  alerts, footer) live in `src/modules/scores/components/board-parts.tsx`.

## Logo assets

Fourteen separate transparent logos are in [public/logos](public/logos): the event logo, four
organization logos and nine sponsors. Only the event logo is cropped from the supplied 1600 × 900
reference. The rest are separate files (`"supplied": true` in the manifest) that the script below
keeps as is:

- Organizations: the BWF vector logo (`bwf.svg`, from Wikimedia Commons), Badminton Asia (from
  Indonesian Wikipedia, trimmed to 169 × 70; the only size published there), the PBSI crest (from
  pbsi.id, trimmed and resized to 234 × 256) and a 467 × 91 Djarum Foundation export.
- Sponsors, all white for the dark footer: 5 Days Croissant, Blibli, FOX'S, Gajah, Hydroplus and
  Polytron are the SVGs from srikandimerdekacup.com as published; SariWangi is that site's PNG,
  trimmed to 373 × 146. Caffino is the right-hand half of the site's `logo-smc-full.svg` (the
  Srikandi Merdeka Cup mark and divider removed, viewBox fitted to the Caffino shapes). Victor is a
  VectorSeek SVG with the blue box, orange bar and watermark removed, leaving the white mark and
  wordmark.
Crop bounds are in [manifest.json](public/logos/manifest.json).

Regenerate from the original image:

```sh
npm run assets:logos -- '/absolute/path/to/reference.jpeg'
```

## Verify and build

```sh
npm test
npm run typecheck
npm run check:docs
npm run build
npm start
```

If a constrained environment disallows the local sockets used internally by Turbopack, use
`npm run build -- --webpack`. This builds the same Next.js app without Turbopack's worker sockets.

## Venues

The page title and subtitle follow the feed's venue (`venueHeading()` in
`src/modules/scores/lib/scoreboard.ts`): `…-jati` adds "(U17, U15, U13)" and the GOR Djarum Jati
location, `…-kaliputu` adds "(U19)". Each venue runs its own instance with its own
`FIREBASE_DATABASE_PATH`, for example `FIREBASE_DATABASE_PATH=bdmntn-kaliputu`.

## Deploy

Standard Next.js deploy (Node.js 24):

```sh
npm ci
npm run build
npm start          # port 2906 (same as production); set PORT to change it
```

If a reverse proxy serves the app under a sub-path such as `/mlijis-2026/venue2` (proxy forwarding
the path unchanged), set the same `BASE_PATH` for both commands, e.g.
`BASE_PATH=/mlijis-2026/venue2 npm run build` and `BASE_PATH=/mlijis-2026/venue2 npm start`.
Unset, the app is served at the root.
