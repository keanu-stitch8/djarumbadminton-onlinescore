# Global data flow

This document is the repository-wide source of truth for application data flow and folder
ownership under `src/`. Domain documents describe concrete pipelines, but they must follow this
contract unless they record a deliberate exception and its reason.

## Canonical dependency direction

For server-rendered feature data, dependencies point inward from route composition to external
transport:

```text
App route
  -> module entry
  -> view (page composition + Suspense)
  -> section (async server boundary)
  -> query (request orchestration/deduplication)
  -> service (cached use case + validation)
  -> API adapter (transport only)
  -> external API
```

Data returns through a trust boundary before it reaches rendering code:

```text
External response
  -> service validation
  -> optional raw-safe filtering
  -> mapper (raw shape -> canonical type)
  -> lib (pure filtering/grouping/derivation)
  -> section view/component (typed rendering only)
```

For browser-side refreshes, a client component calls an internal application endpoint. That
endpoint normalizes HTTP input and rejoins the same query pipeline used by server rendering:

```text
Client component
  -> internal app API route
  -> shared query
  -> service
  -> API adapter
  -> external API
```

Do not bypass a layer to save a short import. In particular:

- Components do not call external APIs.
- Internal app API routes do not duplicate domain or service logic.
- API adapters do not create UI models.
- Raw upstream records do not escape into views or components.
- Lower layers do not import from higher rendering or routing layers.

## Folder contracts

| Folder/file | Owns | Rules |
| --- | --- | --- |
| `src/app/**/page.tsx` | Next.js route entry, locale validation, dictionary and metadata wiring | Keep thin. Forward route-owned inputs to a feature module. Keep transformations out of the route. |
| `src/app/api/**/route.ts` | Browser-facing HTTP boundary | Parse and normalize HTTP values, call a shared query, and serialize its result. Do not duplicate service or domain logic. |
| `src/modules/**/index.tsx` | Public feature-module boundary | Accept route-owned inputs and delegate to a view. No fetching, validation, or mapping. |
| `views/` | Page composition and Suspense topology | Compose sections and fallbacks. No transport or raw-data normalization. |
| `sections/` | Independently streamable async server boundaries | Call queries, select route-level missing states when appropriate, and pass canonical data to a section view. |
| `queries/` | Server-only use-case orchestration | Deduplicate request/render work, compose independent service calls in parallel, and call pure domain builders. Never expose raw responses to rendering code. |
| `services/` | Server-only data-access use cases and freshness policy | Apply persistent cache policy, validate untrusted response structure, combine shared context/assets, invoke mappers, and return canonical types. |
| `api/` | External endpoint adapters | Declare endpoint, method, and transport parameters only. Use the shared client. Return `unknown` when runtime validation is owned by the service. |
| `mappers/` | Raw-to-canonical trust boundary | Normalize unsafe primitives, create canonical typed models, and deliberately reject unusable records. No rendering or network access. |
| `lib/` | Pure domain logic | Own filtering, grouping, sorting, labels, and derived models. No network, cache, React state, or browser APIs. |
| `types/` | Canonical internal contracts | Define query, service, and UI models. Keep raw external contracts with the relevant shared transport domain. |
| `components/` | Typed rendering and local interaction | Render canonical models. Add `'use client'` only when browser state or browser APIs are required. |
| `components/skeletons/`, `sections/*-skeleton.tsx` | Streaming fallbacks | Mirror the layout owned by the corresponding section and contain no data access. |

## Runtime boundaries

### Server and client

Query, service, and external API modules must import `server-only`. Client components may import
serializable types and pure client-safe helpers, but must not import server-only modules.

When a client interaction needs fresh server data, expose an internal app API route and reuse the
existing query. Do not create a second browser-specific service pipeline.

### Raw and canonical data

Treat every external response as untrusted until its structure is validated. The normal ownership
split is:

1. The adapter performs transport only.
2. The service validates the response envelope and coordinates context.
3. The mapper converts acceptable raw records into canonical models.
4. Pure domain functions derive display-ready structures from canonical models.
5. Components render those structures without defensive knowledge of upstream shapes.

A service may perform a raw-safe exclusion or filter before mapping when the decision depends only
on stable upstream identifiers and does not introduce UI or domain presentation semantics. Record
that exception in the domain data-flow document.

### Cache ownership

Use each cache for one purpose:

- React `cache()` deduplicates identical orchestration during a render/request lifecycle.
- `'use cache'` plus an explicit `cacheLife()` defines persistent freshness at the service layer.
- API adapters remain transport-only and do not independently invent cache policy.

Each data source must have one clear freshness authority. Keep key inputs explicit so a cached
result cannot cross event, locale, tenant, or other domain boundaries accidentally.

### Missing, empty, and failed data

These states are different contracts and must remain distinguishable:

- **Missing:** the requested resource does not exist and may map to `notFound()`.
- **Empty:** the resource exists but has no rows or results; render an intentional empty state.
- **Failed:** an upstream or validation boundary failed; allow the route error boundary or an
  explicitly designed error state to handle it.

Do not convert transport failures into empty success payloads unless the product contract explicitly
defines that fallback.

## Allowed simplification

A small feature may omit unnecessary layers, but it must not reverse dependency direction or merge
trust boundaries into rendering code. Examples:

- A static feature can stop at the view/component layer because it has no query pipeline.
- A query can call one service directly; it does not need artificial fan-out.
- A service can return a simple canonical model without a separate mapper only when the input is
  already trusted and the ownership remains explicit.

When a feature needs an exception, document the exception beside that feature's concrete data flow,
including why the global rule is insufficient and which boundary remains responsible.

## Change checklist

Before changing a data flow:

1. Identify the source contract, canonical type, cache owner, and every downstream consumer.
2. Decide whether the change belongs to transport, validation, mapping, domain derivation, or
   rendering; edit that layer rather than compensating elsewhere.
3. Preserve the shared query path between server rendering and internal browser endpoints.
4. Verify missing, empty, and failure behavior separately.
5. Add or update focused tests at the changed boundary.
6. Update this global contract only for repository-wide rules; update a domain document for
   feature-specific behavior.
7. Run `yarn check:docs` after changing documentation links.

## Domain data-flow documents

| Domain | Document | Scope |
| --- | --- | --- |
| Matches | [Matches data flow](../matches-data-flow.md) | Match list, browser filters, detail branches, shared upstream data, caching, and consumers. |
