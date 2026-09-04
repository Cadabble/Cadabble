# Cadabble

Cadabble is building a trusted local-services journey: **Search → Find → Book → Pay → Go**. This repository contains Anna's service-discovery foundation for the Chilliwack, BC launch.

## Run locally

Requires Node.js 20+.

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. There are no third-party runtime dependencies.

## What Anna does now

- Interprets open-ended service requests through configurable categories and aliases in `src/data/service-categories.js`.
- Defaults to Chilliwack, BC and explicitly reports that default. A “near me” request requires the customer to confirm a location.
- Searches active Cadabble records and clearly distinguishes fictional samples from external public listings.
- Returns four fictional home-cleaning samples for comparison testing. Samples are not verified or bookable.
- Records an unmet-demand event when no Cadabble provider exists; it never invents a provider.
- Can use an explicitly injected external-search adapter. Sanitized public results are labelled **Not yet available through Cadabble** and create internal, non-contacted Recommended Provider Leads.
- Blocks booking for sensitive or regulated categories until category-specific safeguards are implemented.

The seed taxonomy is deliberately not closed. An unknown request is preserved as an unlisted service intent, and adding a category or synonym requires data configuration rather than changes to Anna's matching code.

## APIs

### `POST /api/v1/discovery`

Same-origin JSON with `query` (2–200 characters) and optional `location` (up to 120 characters). The response includes Anna's normalized intent, explainable default-location state, safeguards, Cadabble providers, and safely labelled external businesses.

### Provider and booking foundation

`GET /api/v1/providers` and `GET /api/v1/providers/:id` expose development samples. The pre-existing booking domain retains idempotency, authorization-capability, conflict, and audit primitives, but the API refuses bookings for sample providers. It must not be publicly enabled until real provider affiliation, identity, availability, authorization, persistence, and category safeguards are verified.

## Trust boundaries and production gaps

- No external web search runs by default. Only an approved adapter may supply public business data.
- Leads retain public business fields, the source URL, demand, discovery time, membership state, verification state, and `not_contacted` outreach state. Discovery never triggers outreach.
- External listings are neither affiliated nor bookable, and their availability is unverified.
- Samples make no claims about price, ratings, licensing, insurance, or availability.
- In-memory demand and lead records are ephemeral. Replace them with PostgreSQL, retention controls, authenticated internal lead access, encryption where appropriate, and an append-only audit log before deployment.
- Medical, financial, legal, government, security, childcare, and adult-service flows need dedicated policy and safety review. Emergency agencies are informational resources, not marketplace providers.

## Commands

```bash
npm test
npm run check
npm start
```

## Contact

Cadabble Inc. · [sales@cadabble.com](mailto:sales@cadabble.com) · [cadabble.com](https://cadabble.com)
