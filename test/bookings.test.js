import assert from "node:assert/strict";
import { once } from "node:events";
import test from "node:test";
import { buildServer } from "../src/server.js";

const validBooking = {
  providerId: "maple-home-cleaning", customerName: "Alex Chen", customerEmail: "alex@example.ca",
  requestedDate: "2099-09-10", timeWindow: "morning", serviceAddress: "123 Main St, Chilliwack, BC",
  note: "Kitchen and two bathrooms",
};

test("creates an auditable request and protects it with an HttpOnly capability", async () => {
  await withServer(async (origin) => {
    const created = await createBooking(origin, validBooking, "booking_key_123456789");
    assert.equal(created.response.status, 201);
    assert.equal(created.body.data.status, "requested");
    assert.equal(created.body.data.events[0].type, "booking.requested");
    assert.equal(created.body.meta.paymentRequired, false);
    assert.match(created.cookie, /HttpOnly; SameSite=Strict/);

    const denied = await fetch(`${origin}/api/v1/bookings/${created.body.data.id}`);
    assert.equal(denied.status, 404);
    const found = await fetch(`${origin}/api/v1/bookings/${created.body.data.id}`, { headers: { Cookie: created.cookie.split(";")[0] } });
    assert.equal(found.status, 200);
    assert.equal((await found.json()).data.providerName, "Fraser Home Cleaning");
  });
});

test("replays identical idempotent requests and rejects slot conflicts", async () => {
  await withServer(async (origin) => {
    const first = await createBooking(origin, validBooking, "booking_key_123456789");
    const replay = await createBooking(origin, validBooking, "booking_key_123456789");
    assert.equal(replay.response.status, 200); assert.equal(replay.body.meta.replayed, true);
    assert.equal(replay.body.data.id, first.body.data.id);
    const conflict = await createBooking(origin, { ...validBooking, customerEmail: "other@example.ca" }, "booking_key_987654321");
    assert.equal(conflict.response.status, 409); assert.equal(conflict.body.error.code, "booking_conflict");
  });
});

test("validates booking input and same-origin JSON requests", async () => {
  await withServer(async (origin) => {
    const badOrigin = await fetch(`${origin}/api/v1/bookings`, { method: "POST", headers: { Origin: "https://evil.example", "Content-Type": "application/json", "Idempotency-Key": "booking_key_123456789" }, body: JSON.stringify(validBooking) });
    assert.equal(badOrigin.status, 403);
    const invalid = await createBooking(origin, { ...validBooking, serviceAddress: "Toronto, ON" }, "booking_key_123456789");
    assert.equal(invalid.response.status, 400); assert.equal(invalid.body.error.code, "invalid_booking");
  });
});

async function createBooking(origin, booking, key) {
  const response = await fetch(`${origin}/api/v1/bookings`, { method: "POST", headers: { Origin: origin, "Content-Type": "application/json", "Idempotency-Key": key }, body: JSON.stringify(booking) });
  return { response, body: await response.json(), cookie: response.headers.get("set-cookie") ?? "" };
}
async function withServer(run) {
  const server = buildServer().listen(0, "127.0.0.1"); await once(server, "listening");
  try { await run(`http://127.0.0.1:${server.address().port}`); } finally { server.close(); await once(server, "close"); }
}
