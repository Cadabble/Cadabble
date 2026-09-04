import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { categories, findProviderById, searchProviders } from "./catalog.js";
import { providers } from "./data/providers.js";

const publicDirectory = resolve(fileURLToPath(new URL("../public", import.meta.url)));
const maxQueryLength = 80;

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
};

export function buildServer() {
  return createServer(async (request, response) => {
    setSecurityHeaders(response);

    if (!request.url || request.method !== "GET") {
      sendJson(response, 405, { error: { code: "method_not_allowed", message: "This endpoint only accepts GET requests." } });
      return;
    }

    const url = new URL(request.url, "http://localhost");
    if (url.pathname === "/api/v1/providers") {
      handleProviderSearch(url, response);
      return;
    }

    const providerMatch = url.pathname.match(/^\/api\/v1\/providers\/([a-z0-9-]+)$/);
    if (providerMatch) {
      handleProviderDetail(providerMatch[1], response);
      return;
    }

    await serveStatic(url.pathname, response);
  });
}

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

  if (categoryInput && !categories.includes(categoryInput)) {
    sendJson(response, 400, { error: { code: "invalid_category", message: "Choose a supported service category." } });
    return;
  }

  const criteria = categoryInput ? { query, category: categoryInput } : { query };
  const results = searchProviders(providers, criteria);
  sendJson(response, 200, {
    data: results,
    meta: { count: results.length, sampleData: true },
  });
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
