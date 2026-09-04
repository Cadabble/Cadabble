const form = document.querySelector("#search-form");
const input = document.querySelector("#search");
const results = document.querySelector("#results");
const empty = document.querySelector("#empty");
const resultCount = document.querySelector("#result-count");
const filters = document.querySelector("#filters");
const dialog = document.querySelector("#provider-dialog");
const dialogContent = document.querySelector("#dialog-content");
let selectedCategory = "";

async function loadProviders() {
  results.setAttribute("aria-busy", "true");
  const params = new URLSearchParams({ q: input.value });
  if (selectedCategory) params.set("category", selectedCategory);

  try {
    const response = await fetch(`/api/v1/providers?${params}`);
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error?.message ?? "Search is unavailable.");
    renderProviders(payload.data);
  } catch (error) {
    results.replaceChildren(messageCard(error instanceof Error ? error.message : "Search is unavailable."));
    empty.hidden = true;
    resultCount.textContent = "";
  } finally {
    results.removeAttribute("aria-busy");
  }
}

function renderProviders(providers) {
  results.replaceChildren(...providers.map(providerCard));
  empty.hidden = providers.length !== 0;
  resultCount.textContent = `${providers.length} sample ${providers.length === 1 ? "provider" : "providers"}`;
}

function providerCard(provider) {
  const article = document.createElement("article");
  article.className = "provider-card";
  const top = element("div", "card-top");
  top.append(element("span", "category", provider.category), element("span", provider.verified ? "verified" : "reviewing", provider.verified ? "✓ Sample verified" : "Review pending"));
  article.append(top, element("h3", "", provider.name), element("p", "location", `${provider.city}, ${provider.province}`), element("p", "description", provider.description));
  const tags = element("div", "tags");
  provider.tags.forEach((tag) => tags.append(element("span", "", tag)));
  const bottom = element("div", "card-bottom");
  const price = element("p", "price");
  price.append("From ", element("strong", "", formatPrice(provider.priceFromCents)), ` / ${provider.priceUnit}`);
  const detailsButton = element("button", "details-button", "View details →");
  detailsButton.type = "button";
  detailsButton.addEventListener("click", () => showProvider(provider.id));
  bottom.append(price, detailsButton);
  article.append(tags, bottom);
  return article;
}

async function showProvider(providerId) {
  dialogContent.replaceChildren(element("p", "dialog-loading", "Loading provider details…"));
  dialog.showModal();
  try {
    const response = await fetch(`/api/v1/providers/${encodeURIComponent(providerId)}`);
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error?.message ?? "Provider details are unavailable.");
    const provider = payload.data;
    const heading = element("h2", "", provider.name);
    heading.id = "dialog-title";
    const status = element("p", provider.verified ? "verified dialog-status" : "reviewing dialog-status", provider.verified ? "✓ Sample verified profile" : "Verification review pending");
    const facts = element("dl", "provider-facts");
    addFact(facts, "Service", provider.category);
    addFact(facts, "Location", `${provider.city}, ${provider.province}`);
    addFact(facts, "Pricing", `${formatPrice(provider.priceFromCents)} / ${provider.priceUnit}`);
    const note = element("p", "preview-note", "This is a product preview. Live availability and booking are not yet enabled.");
    const contact = element("a", "request-button", "Join booking early access");
    contact.href = `mailto:sales@cadabble.com?subject=${encodeURIComponent(`Booking early access: ${provider.name}`)}`;
    dialogContent.replaceChildren(status, heading, element("p", "dialog-description", provider.description), facts, note, contact);
  } catch (error) {
    dialogContent.replaceChildren(messageCard(error instanceof Error ? error.message : "Provider details are unavailable."));
  }
}

function addFact(list, label, value) {
  list.append(element("dt", "", label), element("dd", "", value));
}

function messageCard(message) {
  const card = element("div", "error-card");
  card.append(element("strong", "", "We couldn't load providers."), element("p", "", message));
  return card;
}

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function formatPrice(cents) {
  return new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 }).format(cents / 100);
}

form.addEventListener("submit", (event) => { event.preventDefault(); loadProviders(); });
filters.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-category]");
  if (!button) return;
  selectedCategory = button.dataset.category;
  filters.querySelectorAll("button").forEach((item) => item.classList.toggle("active", item === button));
  loadProviders();
});
dialog.querySelector(".dialog-close").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });

loadProviders();
