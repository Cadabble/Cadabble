import assert from "node:assert/strict";
import test from "node:test";
import { LeadRepository } from "../src/lead-repository.js";

test("lead review is optimistic, stateful, and append-only audited", () => {
  const repository = new LeadRepository();
  const demand = repository.recordDemand({ query: "garage door", categoryId: "garage-doors", location: "Chilliwack, BC" });
  const lead = repository.upsertLead({ name: "Public Business", sourceUrl: "https://example.test/business", serviceArea: "Chilliwack", website: null, publicPhone: null, publicEmail: null }, demand);
  assert.equal(lead.outreachStatus, "not_contacted");
  const reviewed = repository.transition(lead.id, "under_review", "staff_123", 1);
  assert.equal(reviewed.lead.version, 2); assert.equal(reviewed.lead.events.length, 2);
  assert.equal(repository.transition(lead.id, "contacted", "staff_123", 2).error, "invalid_transition");
  assert.equal(repository.transition(lead.id, "approved_for_outreach", "staff_123", 1).error, "version_conflict");
});

test("lead identity is deduplicated by category and public source", () => {
  const repository = new LeadRepository();
  const demand = repository.recordDemand({ query: "garage door", categoryId: "garage-doors", location: "Chilliwack" });
  const business = { name: "Public Business", sourceUrl: "https://example.test/business" };
  assert.equal(repository.upsertLead(business, demand).id, repository.upsertLead(business, demand).id);
  assert.equal(repository.listLeads().length, 1);
});
