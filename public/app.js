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
    const note = element("p", "preview-note", "Anna will send one request to this sample provider. It stays pending until the business accepts. No payment is collected.");
    dialogContent.replaceChildren(status, heading, element("p", "dialog-description", provider.description), facts, note, buildBookingForm(provider));
  } catch (error) {
    dialogContent.replaceChildren(messageCard(error instanceof Error ? error.message : "Provider details are unavailable."));
  }
}

function buildBookingForm(provider) {
  const form = element("form", "booking-form");
  form.append(field("Your name", "customerName", "text", "Alex Chen"), field("Email", "customerEmail", "email", "alex@example.ca"), field("Requested date", "requestedDate", "date"), selectField("Time window", "timeWindow", [["morning", "Morning"], ["afternoon", "Afternoon"], ["evening", "Evening"]]), field("Chilliwack service address", "serviceAddress", "text", "123 Example St, Chilliwack, BC"), field("What needs cleaning?", "note", "text", "Kitchen and two bathrooms"));
  const status = element("p", "booking-status"); status.setAttribute("aria-live", "polite");
  const submit = element("button", "request-button", "Ask Anna to request this booking"); submit.type = "submit";
  form.append(status, submit);
  form.addEventListener("submit", async (event) => {
    event.preventDefault(); submit.disabled = true; status.textContent = "Anna is securely sending your request…";
    const data = Object.fromEntries(new FormData(form)); data.providerId = provider.id;
    try {
      const response = await fetch("/api/v1/bookings", { method: "POST", headers: { "Content-Type": "application/json", "Idempotency-Key": crypto.randomUUID().replaceAll("-", "") }, body: JSON.stringify(data) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error?.message ?? "The request could not be sent.");
      form.replaceChildren(element("strong", "booking-success", "Request sent — awaiting the business"), element("p", "", `Anna is tracking request ${payload.data.id.slice(0, 8)}. No payment was taken.`));
    } catch (error) { status.textContent = error instanceof Error ? error.message : "The request could not be sent."; submit.disabled = false; }
  });
  return form;
}

function field(label, name, type, placeholder = "") {
  const wrapper = element("label", "booking-field", label); const input = document.createElement("input");
  Object.assign(input, { name, type, placeholder, required: true }); if (type === "date") input.min = new Date().toISOString().slice(0, 10);
  wrapper.append(input); return wrapper;
}

function selectField(label, name, options) {
  const wrapper = element("label", "booking-field", label); const select = document.createElement("select"); select.name = name;
  options.forEach(([value, text]) => { const option = element("option", "", text); option.value = value; select.append(option); }); wrapper.append(select); return wrapper;
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
