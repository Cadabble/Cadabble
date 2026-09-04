import assert from "node:assert/strict";
import test from "node:test";
import { DiscoveryStore } from "../src/discovery.js";
import { providers } from "../src/data/providers.js";
import { serviceCategories } from "../src/data/service-categories.js";

test("does not fabricate a provider when no Cadabble match exists", async () => {
  const store = new DiscoveryStore({ providers, categories: serviceCategories });
  const result = await store.discover({ query: "garage-door repair", location: "Chilliwack, BC" });
  assert.deepEqual(result.providers, []); assert.deepEqual(result.externalBusinesses, []);
  assert.equal(store.unmetRequests.length, 1); assert.equal(store.leads.length, 0);
});

test("nanny near me requests location and applies sensitive safeguards", async () => {
  const store = new DiscoveryStore({ providers, categories: serviceCategories });
  const result = await store.discover({ query: "a nanny near me", location: "" });
  assert.equal(result.needsLocation, true); assert.equal(result.safeguards.bookingEnabled, false);
  assert.equal(store.unmetRequests.length, 0);
});

test("approved external results become non-contacted internal leads", async () => {
  const externalSearch = async () => [{ name: "Public Garage Door Ltd.", serviceArea: "Chilliwack, BC", website: "https://example.test", publicPhone: "604-555-0100", sourceUrl: "https://directory.example.test/business/1" }];
  const store = new DiscoveryStore({ providers, categories: serviceCategories, externalSearch });
  const result = await store.discover({ query: "garage door repair", location: "Chilliwack, BC" });
  assert.equal(result.externalBusinesses[0].affiliation, "not_affiliated");
  assert.equal(result.externalBusinesses[0].bookingEnabled, false);
  assert.equal(store.leads[0].outreachStatus, "not_contacted");
  assert.equal(store.leads[0].membershipStatus, "not_affiliated");
});

test("new category seed is interpreted without changing classifier code", async () => {
  const categories = [...serviceCategories, { id: "piano-tuning", name: "Piano tuning", aliases: ["tune my piano"], risk: "standard" }];
  const store = new DiscoveryStore({ providers, categories });
  const result = await store.discover({ query: "Please tune my piano", location: "Chilliwack" });
  assert.equal(result.intent.category.id, "piano-tuning");
});

test("external integration failures stay honest and do not invent leads", async () => {
  const store = new DiscoveryStore({ providers, categories: serviceCategories, externalSearch: async () => { throw new Error("directory unavailable"); } });
  const result = await store.discover({ query: "window cleaning", location: "Chilliwack" });
  assert.deepEqual(result.externalBusinesses, []); assert.equal(store.leads.length, 0); assert.equal(store.unmetRequests.length, 1);
});
