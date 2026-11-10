# Online Score

Mobile-first badminton scoreboard for MilkLife Indonesia Junior International Series 2026.

Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, shadcn/ui components backed by Radix,
and TanStack Query. Node **24.22.2** is pinned in `.nvmrc` and `.node-version` (latest Node 24
release verified against the official distribution on 10 November 2026).

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

Open `http://localhost:3006` for the responsive scoreboard. The home page uses the full scoreboard
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
