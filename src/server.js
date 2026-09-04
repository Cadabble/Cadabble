import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { findProviderById, searchProviders } from "./catalog.js";
import { providers } from "./data/providers.js";
import { serviceCategories } from "./data/service-categories.js";
import { DiscoveryStore } from "./discovery.js";
import { BookingStore, publicBooking } from "./bookings.js";

const publicDirectory = resolve(fileURLToPath(new URL("../public", import.meta.url)));
const maxQueryLength = 80;

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
};

export function buildServer({ bookingStore = new BookingStore(), discoveryStore = new DiscoveryStore({ providers, categories: serviceCategories }) } = {}) {
  return createServer(async (request, response) => {
    setSecurityHeaders(response);

    if (!request.url) {
      sendJson(response, 400, { error: { code: "invalid_request", message: "The request could not be read." } });
      return;
    }

    const url = new URL(request.url, "http://localhost");
    if (url.pathname === "/api/v1/discovery" && request.method === "POST") {
      await handleDiscovery(request, response, discoveryStore);
      return;
    }
    if (url.pathname === "/api/v1/bookings" && request.method === "POST") {
      await handleBookingCreate(request, response, bookingStore);
      return;
    }
    const bookingMatch = url.pathname.match(/^\/api\/v1\/bookings\/([a-f0-9-]+)$/);
    if (bookingMatch && request.method === "GET") {
      handleBookingDetail(request, response, bookingStore, bookingMatch[1]);
      return;
    }
    if (request.method !== "GET") {
      sendJson(response, 405, { error: { code: "method_not_allowed", message: "This endpoint does not accept that method." } });
      return;
    }
    if (url.pathname === "/api/v1/providers" && request.method === "GET") {
      handleProviderSearch(url, response);
      return;
    }

    const providerMatch = url.pathname.match(/^\/api\/v1\/providers\/([a-z0-9-]+)$/);
    if (providerMatch && request.method === "GET") {
      handleProviderDetail(providerMatch[1], response);
      return;
    }

    await serveStatic(url.pathname, response);
  });
}

async function handleBookingCreate(request, response, store) {
  if (!isSameOrigin(request) || request.headers["content-type"] !== "application/json") {
    sendJson(response, 403, { error: { code: "request_not_allowed", message: "Use the secure Cadabble booking form." } }); return;
  }
  const idempotencyKey = request.headers["idempotency-key"];
  if (typeof idempotencyKey !== "string" || !/^[a-zA-Z0-9_-]{16,100}$/.test(idempotencyKey)) {
    sendJson(response, 400, { error: { code: "invalid_idempotency_key", message: "A valid booking request key is required." } }); return;
  }
  let body;
  try { body = await readJson(request); } catch { sendJson(response, 400, { error: { code: "invalid_json", message: "Check the booking details and try again." } }); return; }
  const error = validateBooking(body);
  if (error) { sendJson(response, 400, { error: { code: "invalid_booking", message: error } }); return; }
  const provider = findProviderById(providers, body.providerId);
  if (!provider || provider.city !== "Chilliwack" || !provider.serviceCategoryIds.includes("home-cleaning") || !provider.bookingEnabled) {
    sendJson(response, 404, { error: { code: "service_not_found", message: "That launch service is unavailable." } }); return;
  }
  const result = store.create({ ...body, provider, customerEmail: body.customerEmail.toLowerCase(), idempotencyKey });
  if (result.error === "booking_conflict") { sendJson(response, 409, { error: { code: result.error, message: "That time was just requested. Choose another window." } }); return; }
  if (result.error) { sendJson(response, 409, { error: { code: result.error, message: "This request key was already used for different details." } }); return; }
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  response.setHeader("Set-Cookie", `cadabble_booking_${result.booking.id}=${result.token}; HttpOnly; SameSite=Strict; Path=/api/v1/bookings/${result.booking.id}; Max-Age=604800${secure}`);
  sendJson(response, result.replayed ? 200 : 201, { data: publicBooking(result.booking), meta: { replayed: result.replayed, paymentRequired: false } });
}

function handleBookingDetail(request, response, store, id) {
  const token = parseCookies(request.headers.cookie ?? "")[`cadabble_booking_${id}`];
  const booking = store.findAuthorized(id, token);
  if (!booking) { sendJson(response, 404, { error: { code: "booking_not_found", message: "We couldn't find that booking request." } }); return; }
  sendJson(response, 200, { data: publicBooking(booking) });
}

function validateBooking(body) {
  if (!body || typeof body !== "object") return "Booking details are required.";
  if (!/^[a-z0-9-]{3,64}$/.test(body.providerId ?? "")) return "Choose a provider.";
  if (typeof body.customerName !== "string" || body.customerName.trim().length < 2 || body.customerName.length > 80) return "Enter your name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.customerEmail ?? "") || body.customerEmail.length > 254) return "Enter a valid email.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(body.requestedDate ?? "") || body.requestedDate < new Date().toISOString().slice(0, 10)) return "Choose today or a future date.";
  if (!["morning", "afternoon", "evening"].includes(body.timeWindow)) return "Choose a time window.";
  if (typeof body.serviceAddress !== "string" || body.serviceAddress.trim().length < 8 || body.serviceAddress.length > 160 || !/\bBC\b/i.test(body.serviceAddress)) return "Enter a Chilliwack, BC service address.";
  if (typeof body.note !== "string" || body.note.trim().length < 5 || body.note.length > 500) return "Tell Anna what needs cleaning.";
}

async function readJson(request) {
  let raw = "";
  for await (const chunk of request) { raw += chunk; if (raw.length > 10_000) throw new Error("too_large"); }
  return JSON.parse(raw);
}
function isSameOrigin(request) { const origin = request.headers.origin; return !origin || origin === `http://${request.headers.host}` || origin === `https://${request.headers.host}`; }
function parseCookies(value) { return Object.fromEntries(value.split(";").map((item) => item.trim().split("=")).filter(([key, val]) => key && val)); }

function handleProviderDetail(providerId, response) {
  const provider = findProviderById(providers, providerId);
  if (!provider) {
    sendJson(response, 404, { error: { code: "provider_not_found", message: "We couldn't find that provider." } });
    return;
  }
  sendJson(response, 200, { data: provider, meta: { sampleData: true } });
}

function handleProviderSearch(url, response) {
  const query = (url.searchParams.get("q") ?? "").trim();
  const categoryInput = url.searchParams.get("category")?.trim();

  if (query.length > maxQueryLength) {
    sendJson(response, 400, { error: { code: "invalid_query", message: `Search must be ${maxQueryLength} characters or fewer.` } });
    return;
  }

  if (categoryInput && !serviceCategories.some((category) => category.id === categoryInput)) {
    sendJson(response, 400, { error: { code: "invalid_category", message: "Choose a supported service category." } });
    return;
  }

  const criteria = categoryInput ? { query, categoryId: categoryInput } : { query };
  const results = searchProviders(providers, criteria);
  sendJson(response, 200, {
    data: results,
    meta: { count: results.length, sampleData: true },
  });
}

async function handleDiscovery(request, response, store) {
  if (!isSameOrigin(request) || request.headers["content-type"] !== "application/json") {
    sendJson(response, 403, { error: { code: "request_not_allowed", message: "Use Anna's secure discovery form." } }); return;
  }
  let body;
  try { body = await readJson(request); } catch { sendJson(response, 400, { error: { code: "invalid_json", message: "Check your request and try again." } }); return; }
  const query = typeof body?.query === "string" ? body.query.trim() : "";
  const location = typeof body?.location === "string" ? body.location.trim() : "";
  if (query.length < 2 || query.length > 200 || location.length > 120) {
    sendJson(response, 400, { error: { code: "invalid_discovery", message: "Describe a service in 2–200 characters and keep the location under 120 characters." } }); return;
  }
  const result = await store.discover({ query, location });
  sendJson(response, 200, { data: result, meta: { externalSearchAvailable: Boolean(store.externalSearch), leadsCreated: result.externalBusinesses.length } });
}

async function serveStatic(pathname, response) {
  const requestedPath = pathname === "/" ? "/index.html" : pathname;
  const filePath = resolve(publicDirectory, `.${requestedPath}`);
  if (!filePath.startsWith(`${publicDirectory}${sep}`)) {
    sendJson(response, 404, { error: { code: "not_found", message: "Page not found." } });
    return;
  }

  try {
    const content = await readFile(filePath);
    response.writeHead(200, { "Content-Type": contentTypes[extname(filePath)] ?? "application/octet-stream" });
    response.end(content);
  } catch {
    sendJson(response, 404, { error: { code: "not_found", message: "Page not found." } });
  }
}

function setSecurityHeaders(response) {
  response.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'");
  response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("X-Frame-Options", "DENY");
  response.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
}

function sendJson(response, status, body) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  response.end(JSON.stringify(body));
}

function parsePort(value) {
  if (value === undefined) return 3000;
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("PORT must be an integer between 1 and 65535.");
  return port;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = parsePort(process.env.PORT);
  buildServer().listen(port, "127.0.0.1", () => {
    console.log(`Cadabble is ready at http://localhost:${port}`);
  });
}
