# Cadabble

Cadabble is a local-services marketplace built around a simple journey:

**Search → Find → Book → Pay → Go**

This repository contains the first runnable vertical slice: a trustworthy service-discovery experience backed by a validated API. Results are explicitly identified as sample data until a verified provider source is connected; the interface never invents availability, reviews, or provider credentials.

## Run locally

Requirements: Node.js 20+ and npm.

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. The application uses only Node.js built-ins, so installation has no third-party runtime dependencies.

## Commands

```bash
npm test            # run unit and end-to-end API tests
npm run check       # syntax-check and run the full test suite
npm start           # run the server
```

Set `PORT` to change the listening port. Only numeric ports from 1–65535 are accepted.

## Current product slice

- Search sample providers by service, city, or provider name.
- Filter by category and compare transparent starting prices.
- Distinguish verified sample profiles from unverified data.
- Continue toward booking without claiming live availability or accepting payment.
- Use a versioned, validated JSON API (`GET /api/v1/providers`).

## Trust and security defaults

- Request input is normalized, bounded, and allow-listed at the API boundary.
- API responses expose a deliberate public-provider shape only.
- Baseline browser security headers and a restrictive Content Security Policy are applied.
- Payment and booking state are not simulated. Those flows should be server-authoritative and, when Stripe is introduced, reconciled from signed webhooks.
- Sample records are labelled in both the API and UI so AI-assisted discovery cannot be confused with verified live inventory.

## Architecture

```text
src/
  catalog.js       Pure filtering and documented public provider model
  server.js        HTTP boundary, validation, headers, static serving
  data/            Clearly labelled development fixtures
public/            Dependency-free responsive discovery client
test/              Unit and end-to-end HTTP coverage
```

The next safe vertical slice is **request-to-book**: persistent users/providers/services, authenticated booking ownership, availability holds, and an auditable booking state machine. Payments should follow only after those guarantees exist.

## Product decision note

Gamma-band neural activity is studied in relation to attention and perception, but it cannot confirm the correctness of a software or product decision. Cadabble therefore uses an evidence-based analogue—keeping search, trust signals, booking, and payment states synchronized through explicit contracts, validation, and tests—rather than treating a neuroscience claim as a design requirement.

## Contact

Cadabble Inc.<br>
[sales@cadabble.com](mailto:sales@cadabble.com) · [cadabble.com](https://cadabble.com)
