import { serviceCategories } from "./data/service-categories.js";

/** Normalize user-facing text for deterministic, explainable matching. */
export function normalize(value) {
  return String(value ?? "").normalize("NFKD").replace(/[’']/g, "").toLocaleLowerCase("en-CA").replace(/[^a-z0-9]+/g, " ").trim();
}

/**
 * Resolve an open-ended request against configurable category seed data. Unknown
 * requests remain searchable instead of being rejected by a closed allow-list.
 */
export function classifyService(query, categories = serviceCategories) {
  const normalized = normalize(query);
  let best;
  for (const category of categories) {
    for (const phrase of [category.name, ...category.aliases]) {
      const candidate = normalize(phrase);
      if (!candidate || !normalized.includes(candidate)) continue;
      if (!best || candidate.length > best.match.length) best = { category, match: candidate };
    }
  }
  if (best) return { category: best.category, confidence: "alias", matchedPhrase: best.match };
  const words = normalized.split(" ").filter((word) => word.length > 2 && !["need", "find", "help", "with", "near", "service", "chilliwack"].includes(word));
  const label = words.length ? words.slice(0, 5).map((word) => word[0].toUpperCase() + word.slice(1)).join(" ") : "Other service";
  return { category: { id: `other:${normalize(label).replaceAll(" ", "-")}`, name: label, aliases: [], risk: "review" }, confidence: "unlisted", matchedPhrase: null };
}

export function resolveLocation(query, suppliedLocation) {
  const explicit = String(suppliedLocation ?? "").trim();
  if (explicit) return { location: explicit, usedDefault: false, needsConfirmation: false };
  if (/\bnear me\b/i.test(query)) return { location: null, usedDefault: false, needsConfirmation: true };
  return { location: "Chilliwack, BC", usedDefault: true, needsConfirmation: false };
}

export function searchProviders(providers, { query = "", categoryId, location }) {
  const terms = normalize(query).split(" ").filter(Boolean);
  const locationTerms = normalize(location).split(" ").filter(Boolean);
  return providers.filter((provider) => {
    if (provider.status === "inactive") return false;
    if (categoryId && !provider.serviceCategoryIds.includes(categoryId)) return false;
    const place = normalize(`${provider.city} ${provider.province}`);
    if (locationTerms.length && !locationTerms.every((term) => place.includes(term) || ["bc", "british", "columbia"].includes(term))) return false;
    if (categoryId) return true;
    const searchable = normalize([provider.name, provider.description, provider.city, provider.province, ...provider.tags].join(" "));
    return terms.every((term) => searchable.includes(term));
  });
}

export function findProviderById(providers, id) { return providers.find((provider) => provider.id === id); }
