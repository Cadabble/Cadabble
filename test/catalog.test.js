import assert from "node:assert/strict";
import test from "node:test";
import { findProviderById, searchProviders } from "../src/catalog.js";
import { providers } from "../src/data/providers.js";

test("search matches normalized terms across provider fields", () => {
  const results = searchProviders(providers, { query: "  cleaning CHILLIWACK " });
  assert.deepEqual(results.map(({ id }) => id), ["maple-home-cleaning", "northstar-handyman", "harbour-pet-care", "prairie-snow-yard"]);
});

test("category filters are exact", () => {
  const results = searchProviders(providers, { query: "", category: "Pet care" });
  assert.deepEqual(results.map(({ id }) => id), []);
});

test("all terms must match the same provider", () => {
  assert.equal(searchProviders(providers, { query: "Vancouver handyman" }).length, 0);
});

test("provider lookup uses stable public identifiers", () => {
  assert.equal(findProviderById(providers, "harbour-pet-care")?.name, "Vedder Home Care");
  assert.equal(findProviderById(providers, "missing-provider"), undefined);
});
