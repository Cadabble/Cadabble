import { createHash, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";

const activeStatuses = new Set(["requested", "accepted", "confirmed"]);

export class BookingStore {
  #bookings = new Map();
  #idempotency = new Map();

  create({ customerName, customerEmail, provider, requestedDate, timeWindow, serviceAddress, note, idempotencyKey }) {
    const fingerprint = JSON.stringify({ customerEmail, providerId: provider.id, requestedDate, timeWindow, serviceAddress, note });
    const idempotencyId = `${customerEmail}:${idempotencyKey}`;
    const existing = this.#idempotency.get(idempotencyId);
    if (existing) {
      if (existing.fingerprint !== fingerprint) return { error: "idempotency_conflict" };
      return { booking: this.#bookings.get(existing.bookingId), token: existing.token, replayed: true };
    }

    const conflict = [...this.#bookings.values()].some((booking) =>
      booking.providerId === provider.id && booking.requestedDate === requestedDate && booking.timeWindow === timeWindow && activeStatuses.has(booking.status),
    );
    if (conflict) return { error: "booking_conflict" };

    const now = new Date().toISOString();
    const booking = {
      id: randomUUID(), customerName, customerEmail, providerId: provider.id, providerName: provider.name,
      requestedDate, timeWindow, serviceAddress, note, status: "requested", createdAt: now,
      events: [{ id: randomUUID(), type: "booking.requested", actor: "customer", occurredAt: now }],
    };
    const token = randomBytes(32).toString("base64url");
    booking.accessTokenHash = hash(token);
    this.#bookings.set(booking.id, booking);
    this.#idempotency.set(idempotencyId, { bookingId: booking.id, fingerprint, token });
    return { booking, token, replayed: false };
  }

  findAuthorized(id, token) {
    const booking = this.#bookings.get(id);
    if (!booking || !token || !safeEqual(booking.accessTokenHash, hash(token))) return undefined;
    return booking;
  }
}

export function publicBooking(booking) {
  return {
    id: booking.id, providerId: booking.providerId, providerName: booking.providerName,
    requestedDate: booking.requestedDate, timeWindow: booking.timeWindow, status: booking.status,
    createdAt: booking.createdAt, events: booking.events,
  };
}

function hash(value) { return createHash("sha256").update(value).digest(); }
function safeEqual(left, right) { return left.length === right.length && timingSafeEqual(left, right); }
