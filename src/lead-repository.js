import { randomUUID } from "node:crypto";

export const leadStatuses = Object.freeze(["discovered", "under_review", "approved_for_outreach", "contacted", "deferred", "rejected", "duplicate", "onboarding", "active_provider"]);

const transitions = new Map([
  ["discovered", new Set(["under_review", "duplicate", "rejected"])],
  ["under_review", new Set(["approved_for_outreach", "duplicate", "rejected"])],
  ["approved_for_outreach", new Set(["contacted", "deferred", "rejected"])],
  ["contacted", new Set(["onboarding", "deferred", "rejected"])],
  ["deferred", new Set(["under_review"])],
  ["onboarding", new Set(["active_provider", "rejected"])],
]);

/** In-memory repository for tests/local development; production must use the SQL schema. */
export class LeadRepository {
  #demands = new Map();
  #leads = new Map();
  #events = [];

  recordDemand(input) {
    const demand = Object.freeze({ id: randomUUID(), ...input, createdAt: new Date().toISOString() });
    this.#demands.set(demand.id, demand);
    return demand;
  }

  upsertLead(business, demand) {
    const existing = [...this.#leads.values()].find((lead) => lead.sourceUrl === business.sourceUrl && lead.categoryId === demand.categoryId);
    if (existing) {
      if (!existing.demandIds.includes(demand.id)) existing.demandIds.push(demand.id);
      return structuredClone(existing);
    }
    const now = new Date().toISOString();
    const lead = { id: randomUUID(), businessName: business.name, categoryId: demand.categoryId, serviceArea: business.serviceArea, website: business.website, publicPhone: business.publicPhone, publicEmail: business.publicEmail, sourceUrl: business.sourceUrl, discoveredAt: now, verificationStatus: "unverified_public_listing", demandIds: [demand.id], membershipStatus: "not_affiliated", outreachStatus: "not_contacted", status: "discovered", version: 1 };
    this.#leads.set(lead.id, lead);
    this.#appendEvent(lead.id, "lead.discovered", "system", { demandId: demand.id });
    return structuredClone(lead);
  }

  listLeads() { return [...this.#leads.values()].map((lead) => ({ ...structuredClone(lead), events: this.eventsFor(lead.id) })); }

  transition(id, nextStatus, actorId, expectedVersion) {
    const lead = this.#leads.get(id);
    if (!lead) return { error: "lead_not_found" };
    if (lead.version !== expectedVersion) return { error: "version_conflict" };
    if (!transitions.get(lead.status)?.has(nextStatus)) return { error: "invalid_transition" };
    const previousStatus = lead.status;
    lead.status = nextStatus; lead.version += 1;
    if (nextStatus === "contacted") lead.outreachStatus = "contacted";
    if (nextStatus === "active_provider") lead.membershipStatus = "active";
    this.#appendEvent(id, "lead.status_changed", actorId, { previousStatus, nextStatus });
    return { lead: { ...structuredClone(lead), events: this.eventsFor(id) } };
  }

  eventsFor(id) { return this.#events.filter((event) => event.leadId === id).map((event) => structuredClone(event)); }
  #appendEvent(leadId, type, actorId, metadata) { this.#events.push(Object.freeze({ id: randomUUID(), leadId, type, actorId, metadata, occurredAt: new Date().toISOString() })); }
}
