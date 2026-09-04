import assert from "node:assert/strict";
import { once } from "node:events";
import test from "node:test";
import { buildServer } from "../src/server.js";

test("serves the discovery page with security headers", async () => {
  await withServer(async (origin) => {
    const response = await fetch(origin);
    assert.equal(response.status, 200);
    assert.match(await response.text(), /Ask Anna/);
    assert.match(response.headers.get("content-security-policy") ?? "", /default-src 'self'/);
    assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  });
});

test("provider endpoint filters data and marks fixtures as samples", async () => {
  await withServer(async (origin) => {
    const response = await fetch(`${origin}/api/v1/providers?q=Chilliwack&category=home-cleaning`);
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.meta.sampleData, true);
    assert.equal(body.data.length, 4);
  });
});

test("provider endpoint rejects unsupported categories and oversized input", async () => {
  await withServer(async (origin) => {
    const invalidCategory = await fetch(`${origin}/api/v1/providers?category=Anything`);
    assert.equal(invalidCategory.status, 400);
    assert.equal((await invalidCategory.json()).error.code, "invalid_category");

    const oversized = await fetch(`${origin}/api/v1/providers?q=${"a".repeat(81)}`);
    assert.equal(oversized.status, 400);
    assert.equal((await oversized.json()).error.code, "invalid_query");
  });
});

test("provider detail endpoint returns a public profile and safe not-found errors", async () => {
  await withServer(async (origin) => {
    const found = await fetch(`${origin}/api/v1/providers/vedder-cleaning-demo`);
    assert.equal(found.status, 200);
    assert.equal((await found.json()).data.name, "Vedder Cleaning Demo");
    const missing = await fetch(`${origin}/api/v1/providers/not-real`);
    assert.equal(missing.status, 404);
    assert.equal((await missing.json()).error.code, "provider_not_found");
  });
});

test("Anna discovery defaults transparently and returns sample-only matches", async () => {
  await withServer(async (origin) => {
    const response = await fetch(`${origin}/api/v1/discovery`, { method: "POST", headers: { Origin: origin, "Content-Type": "application/json" }, body: JSON.stringify({ query: "home cleaning" }) });
    const body = await response.json();
    assert.equal(response.status, 200); assert.equal(body.data.location.usedDefault, true);
    assert.equal(body.data.providers.length, 4); assert.ok(body.data.providers.every((provider) => provider.status === "sample"));
  });
});

test("unknown paths do not expose filesystem content", async () => {
  await withServer(async (origin) => {
    const response = await fetch(`${origin}/..%2Fpackage.json`);
    assert.equal(response.status, 404);
  });
});

async function withServer(run) {
  const server = buildServer().listen(0, "127.0.0.1");
  await once(server, "listening");
  const { port } = server.address();
  try {
    await run(`http://127.0.0.1:${port}`);
  } finally {
    server.close();
    await once(server, "close");
  }
}
