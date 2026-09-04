import assert from "node:assert/strict";
import { once } from "node:events";
import test from "node:test";
import { BookingStore } from "../src/bookings.js";
import { buildServer } from "../src/server.js";

test("booking domain retains append-only audit and idempotency protections", () => {
  const store = new BookingStore();
  const provider = { id: "verified-provider", name: "Verified Provider" };
  const request = { providerId: provider.id, provider, customerName: "Alex Chen", customerEmail: "alex@example.ca", requestedDate: "2099-09-10", timeWindow: "morning", serviceAddress: "Chilliwack, BC", note: "Requested work", idempotencyKey: "booking_key_123456789" };
  const created = store.create(request);
  const replay = store.create(request);
  assert.equal(created.booking.status, "requested");
  assert.equal(created.booking.events[0].type, "booking.requested");
  assert.equal(replay.replayed, true); assert.equal(replay.booking.id, created.booking.id);
});

test("sample providers cannot be represented as immediately bookable", async () => {
  const server = buildServer().listen(0, "127.0.0.1"); await once(server, "listening");
  try {
    const origin = `http://127.0.0.1:${server.address().port}`;
    const response = await fetch(`${origin}/api/v1/bookings`, { method: "POST", headers: { Origin: origin, "Content-Type": "application/json", "Idempotency-Key": "booking_key_123456789" }, body: JSON.stringify({ providerId: "fraser-cleaning-demo", customerName: "Alex Chen", customerEmail: "alex@example.ca", requestedDate: "2099-09-10", timeWindow: "morning", serviceAddress: "123 Main St, Chilliwack, BC", note: "Kitchen cleaning" }) });
    assert.equal(response.status, 404); assert.equal((await response.json()).error.code, "service_not_found");
  } finally { server.close(); await once(server, "close"); }
});
