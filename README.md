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
Country flags have a 4:3 ratio with the country code underneath.
Indonesia's flag is local; other supported country icons use FlagCDN SVGs.

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

## Logo assets

Fourteen separate transparent PNGs are in [public/logos](public/logos), including the event logo,
four organization logos and nine sponsors. They are cropped from the supplied 1600 × 900 reference;
small text retains the source image's original resolution. Crop bounds are in
[manifest.json](public/logos/manifest.json).

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

## Static version (no Node.js on the server)

`static/` builds the same live score page as plain HTML/JS/CSS for servers that cannot run a
modern Node.js (e.g. CentOS 6). It reuses the shared components, Tailwind CSS and score logic
from `src/`, but reads Firebase directly in the browser through the Realtime Database REST
streaming API (Server-Sent Events) instead of polling `/api/scores`.

```sh
npm run static:dev      # http://localhost:3007
npm run static:build    # output: static/dist/
npm run static:preview  # serve static/dist on http://localhost:3008
```

Build on your machine and commit `static/dist/` (it is tracked on purpose, so the server only
needs `git pull`), then copy its contents to any folder served by the web server; asset paths are relative, so a subfolder such as `/onlinescore/` works. Override the source
at build time with `VITE_FIREBASE_DATABASE_URL` / `VITE_FIREBASE_DATABASE_PATH`.

The page title and subtitle follow the feed's venue (`venueHeading()` in
`src/modules/scores/lib/scoreboard.ts`): `…-jati` adds "(U17, U15, U13)" and the GOR Djarum Jati
location, `…-kaliputu` adds "(U19)". Each venue therefore needs its own build, for example
`VITE_FIREBASE_DATABASE_PATH=bdmntn-kaliputu npm run static:build`. The Next.js app uses
`FIREBASE_DATABASE_PATH` the same way.

Limits: this only works while the database allows public reads (a static site cannot hold
credentials), and each open page holds one Firebase connection, so the Firebase plan's
simultaneous-connection limit applies (100 on the free Spark plan).

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
