import assert from "node:assert/strict";
import test from "node:test";
import { classifyService, findProviderById, resolveLocation, searchProviders } from "../src/catalog.js";
import { providers } from "../src/data/providers.js";

test("home cleaning returns four explicitly sample Chilliwack businesses", () => {
  const intent = classifyService("home cleaning in Chilliwack");
  const results = searchProviders(providers, { categoryId: intent.category.id, location: "Chilliwack, BC" });
  assert.equal(results.length, 4);
  assert.ok(results.every(({ status, affiliation }) => status === "sample" && affiliation === "demo"));
});

test("aliases normalize garage-door repair without core logic changes", () => {
  assert.equal(classifyService("Please find garage-door repair").category.id, "garage-doors");
  assert.equal(classifyService("I need an artisan piano tuner").confidence, "unlisted");
});

test("near me requires location while other requests use an explicit launch default", () => {
  assert.equal(resolveLocation("a nanny near me", "").needsConfirmation, true);
  assert.deepEqual(resolveLocation("window cleaning", ""), { location: "Chilliwack, BC", usedDefault: true, needsConfirmation: false });
});

test("provider lookup uses stable identifiers", () => {
  assert.equal(findProviderById(providers, "vedder-cleaning-demo")?.name, "Vedder Cleaning Demo");
});
