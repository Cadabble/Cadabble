const form = document.querySelector("#search-form");
const input = document.querySelector("#search");
const locationInput = document.querySelector("#location");
const results = document.querySelector("#results");
const empty = document.querySelector("#empty");
const resultCount = document.querySelector("#result-count");
const filters = document.querySelector("#filters");
const dialog = document.querySelector("#provider-dialog");
const dialogContent = document.querySelector("#dialog-content");

async function discover() {
  results.setAttribute("aria-busy", "true");
  empty.hidden = true;
  try {
    const response = await fetch("/api/v1/discovery", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query: input.value, location: locationInput.value }) });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error?.message ?? "Discovery is unavailable.");
    renderDiscovery(payload.data);
  } catch (error) {
    results.replaceChildren(messageCard(error instanceof Error ? error.message : "Discovery is unavailable."));
    resultCount.textContent = "";
  } finally { results.removeAttribute("aria-busy"); }
}

function renderDiscovery(data) {
  const cards = [];
  const summary = element("article", "anna-summary");
  summary.append(element("strong", "", data.needsLocation ? "Anna needs your location" : `Anna understood: ${data.intent.category.name}`));
  summary.append(element("p", "", data.needsLocation ? "Tell Anna your city or postal code before she searches for a nearby service." : data.location.usedDefault ? "Using Chilliwack, BC for this launch search. You can change the location above." : `Searching near ${data.location.location}.`));
  if (data.safeguards.message) summary.append(element("p", "safety-note", data.safeguards.message));
  cards.push(summary);
  data.providers.forEach((provider) => cards.push(providerCard(provider)));
  data.externalBusinesses.forEach((business) => cards.push(externalCard(business)));
  results.replaceChildren(...cards);
  const count = data.providers.length + data.externalBusinesses.length;
  resultCount.textContent = `${count} ${count === 1 ? "option" : "options"}`;
  empty.hidden = data.needsLocation || count !== 0;
}

function providerCard(provider) {
  const article = element("article", "provider-card");
  article.append(element("span", "reviewing", "SAMPLE BUSINESS · FICTIONAL DEMO"), element("h3", "", provider.name), element("p", "location", `${provider.city}, ${provider.province}`), element("p", "description", provider.description), element("p", "preview-note", "Not a verified business listing. Pricing, availability, licensing, insurance, and ratings are not claimed."));
  const button = element("button", "details-button", "View sample →"); button.type = "button"; button.addEventListener("click", () => showProvider(provider.id)); article.append(button); return article;
}

function externalCard(business) {
  const article = element("article", "provider-card");
  article.append(element("span", "reviewing", "NOT YET AVAILABLE THROUGH CADABBLE"), element("h3", "", business.name), element("p", "location", business.serviceArea || "Service area not verified"), element("p", "preview-note", "Public listing only. Not affiliated, verified, or immediately bookable through Cadabble. Contact the business directly and mention you found it through Cadabble."));
  if (business.website) { const link = element("a", "details-button", "Visit public website →"); link.href = business.website; link.rel = "noopener noreferrer"; link.target = "_blank"; article.append(link); }
  return article;
}

async function showProvider(id) {
  dialog.showModal(); dialogContent.replaceChildren(element("p", "", "Loading sample…"));
  try { const response = await fetch(`/api/v1/providers/${encodeURIComponent(id)}`); const payload = await response.json(); if (!response.ok) throw new Error(payload.error?.message); const provider = payload.data; const title = element("h2", "", provider.name); title.id = "dialog-title"; dialogContent.replaceChildren(element("p", "reviewing", "Fictional sample—not verified"), title, element("p", "", provider.description), element("p", "preview-note", "This sample supports comparison testing. Anna cannot claim real availability or submit a real booking to it.")); }
  catch (error) { dialogContent.replaceChildren(messageCard(error.message || "Sample unavailable.")); }
}

function messageCard(message) { const card = element("div", "error-card"); card.append(element("strong", "", "Anna couldn't complete that search."), element("p", "", message)); return card; }
function element(tag, className, text) { const node = document.createElement(tag); if (className) node.className = className; if (text !== undefined) node.textContent = text; return node; }

form.addEventListener("submit", (event) => { event.preventDefault(); discover(); });
filters.addEventListener("click", (event) => { const button = event.target.closest("button[data-query]"); if (!button) return; input.value = button.dataset.query; filters.querySelectorAll("button").forEach((item) => item.classList.toggle("active", item === button)); discover(); });
dialog.querySelector(".dialog-close").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
input.value = "home cleaning in Chilliwack";
discover();
