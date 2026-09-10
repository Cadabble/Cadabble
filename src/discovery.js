import { randomUUID } from "node:crypto";
import { classifyService, resolveLocation, searchProviders } from "./catalog.js";

export class DiscoveryStore {
  constructor({ providers, categories, externalSearch, leadRepository } = {}) { this.providers = providers ?? []; this.categories = categories; this.externalSearch = externalSearch; this.leadRepository = leadRepository; this.unmetRequests = []; this.leads = []; }

  async discover({ query, location }) {
    const place = resolveLocation(query, location);
    const intent = classifyService(query, this.categories);
    const safeguards = safeguardsFor(intent.category);
    if (place.needsConfirmation) return { intent, location: place, safeguards, providers: [], externalBusinesses: [], needsLocation: true };
    const providers = searchProviders(this.providers, { categoryId: intent.category.id, location: place.location });
    if (providers.length) return { intent, location: place, safeguards, providers, externalBusinesses: [], needsLocation: false };

    const demandInput = { query, categoryId: intent.category.id, location: place.location };
    const demand = this.leadRepository?.recordDemand(demandInput) ?? { id: randomUUID(), ...demandInput, createdAt: new Date().toISOString() };
    this.unmetRequests.push(Object.freeze(demand));
    let externalBusinesses = [];
    if (this.externalSearch) {
      try { externalBusinesses = sanitizeExternal(await this.externalSearch({ query, category: intent.category.name, location: place.location })); }
      catch { externalBusinesses = []; }
    }
    for (const business of externalBusinesses) this.createLead(business, demand);
    return { intent, location: place, safeguards, providers: [], externalBusinesses, needsLocation: false, demandId: demand.id };
  }

  createLead(business, demand) {
    if (this.leadRepository) return this.leadRepository.upsertLead(business, demand);
    const duplicate = this.leads.find((lead) => lead.sourceUrl === business.sourceUrl && lead.categoryId === demand.categoryId);
    if (duplicate) return duplicate;
    const lead = Object.freeze({ id: randomUUID(), businessName: business.name, categoryId: demand.categoryId, serviceArea: business.serviceArea, website: business.website, publicPhone: business.publicPhone, publicEmail: business.publicEmail, sourceUrl: business.sourceUrl, discoveredAt: new Date().toISOString(), verificationStatus: "unverified_public_listing", demandId: demand.id, membershipStatus: "not_affiliated", outreachStatus: "not_contacted" });
    this.leads.push(lead); return lead;
  }
}

function safeguardsFor(category) {
  if (category.risk === "sensitive") return { bookingEnabled: false, message: "This sensitive service needs location confirmation and category-specific identity, safety, and screening safeguards before booking." };
  if (category.risk === "regulated") return { bookingEnabled: false, message: "Cadabble must verify category-specific credentials and safeguards before booking this regulated service." };
  return { bookingEnabled: true, message: null };
}

function sanitizeExternal(items) {
  if (!Array.isArray(items)) return [];
  return items.slice(0, 10).filter((item) => item && typeof item.name === "string" && /^https:\/\//.test(item.sourceUrl ?? "")).map((item) => ({ name: item.name.slice(0, 120), serviceArea: String(item.serviceArea ?? "").slice(0, 120), website: safeUrl(item.website), publicPhone: String(item.publicPhone ?? "").slice(0, 40) || null, publicEmail: String(item.publicEmail ?? "").slice(0, 254) || null, sourceUrl: item.sourceUrl.slice(0, 500), affiliation: "not_affiliated", availability: "not_verified", bookingEnabled: false }));
}
function safeUrl(value) { try { const url = new URL(value); return url.protocol === "https:" ? url.href : null; } catch { return null; } }
