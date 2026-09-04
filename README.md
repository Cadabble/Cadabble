# Cadabble

Cadabble is a local-services marketplace built around a simple journey:

**Search → Find → Book → Pay → Go**

This repository contains the first runnable request-to-book foundation for **Anna**, Cadabble's AI-assisted trust layer between customers and local businesses. The launch preview focuses on home cleaning in Chilliwack, BC: customers can compare multiple clearly labelled sample businesses, choose one, and create a protected, auditable request.

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

- Search multiple Chilliwack home-cleaning providers and choose one.
- Filter by category and compare transparent starting prices.
- Open an accessible provider detail view without leaving the discovery flow.
- Distinguish verified sample profiles from unverified data.
- Create an idempotent request-to-book, authenticated afterward by an unguessable HttpOnly booking capability cookie.
- Record an append-only `booking.requested` audit event and clearly distinguish pending from confirmed.
- Reject duplicate slot requests and never collect or simulate payment.
- Use a versioned, validated JSON API (`GET /api/v1/providers`).

## Trust and security defaults

- Request input is normalized, bounded, and allow-listed at the API boundary.
- API responses expose a deliberate public-provider shape only.
- Baseline browser security headers and a restrictive Content Security Policy are applied.
- Booking state is server-authoritative. A request remains `requested` until a future authenticated provider workflow accepts it; no payment state is simulated.
- Sample records are labelled in both the API and UI so AI-assisted discovery cannot be confused with verified live inventory.

## Architecture

```text
src/
  bookings.js      Auditable in-memory booking domain and capability authorization
  catalog.js       Pure filtering and documented public provider model
  server.js        HTTP boundary, validation, headers, static serving
  data/            Clearly labelled development fixtures
public/            Dependency-free responsive discovery client
test/              Unit and end-to-end HTTP coverage
```

## Booking API

`POST /api/v1/bookings` requires same-origin JSON and an `Idempotency-Key` of 16–100 URL-safe characters. It validates the Chilliwack launch service, contact fields, future date, time window, BC service address, and job note. Success sets a scoped `HttpOnly`, `SameSite=Strict` capability cookie. `GET /api/v1/bookings/:id` returns the request only when that capability is present.

The current repository is an **ephemeral launch foundation**: bookings and idempotency records are held in memory and disappear on restart. Provider profiles remain labelled fixtures. Before public deployment, replace the store with PostgreSQL, add verified customer and provider identity, encrypt contact/address data at rest, implement transactional provider acceptance and availability, and add retention controls. The five-booking fee waiver must then be enforced against a verified customer account. Payments should follow only after those guarantees exist.

## Product decision note

Gamma-band neural activity is studied in relation to attention and perception, but it cannot confirm the correctness of a software or product decision. Cadabble therefore uses an evidence-based analogue—keeping search, trust signals, booking, and payment states synchronized through explicit contracts, validation, and tests—rather than treating a neuroscience claim as a design requirement.

## Contact

Cadabble Inc.<br>
[sales@cadabble.com](mailto:sales@cadabble.com) · [cadabble.com](https://cadabble.com)
