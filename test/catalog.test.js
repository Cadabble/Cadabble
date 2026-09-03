import assert from "node:assert/strict";
import test from "node:test";
import { searchProviders } from "../src/catalog.js";
import { providers } from "../src/data/providers.js";

test("search matches normalized terms across provider fields", () => {
  const results = searchProviders(providers, { query: "  cleaning TORONTO " });
  assert.deepEqual(results.map(({ id }) => id), ["maple-home-cleaning"]);
});

test("category filters are exact", () => {
  const results = searchProviders(providers, { query: "", category: "Pet care" });
  assert.deepEqual(results.map(({ id }) => id), ["harbour-pet-care"]);
});

test("all terms must match the same provider", () => {
  assert.equal(searchProviders(providers, { query: "Vancouver handyman" }).length, 0);
});
