export const categories = ["Home cleaning", "Handyman", "Pet care", "Outdoor care"];

/** @typedef {"Home cleaning" | "Handyman" | "Pet care" | "Outdoor care"} Category
 * @typedef {{id:string,name:string,category:Category,city:string,province:string,description:string,priceFromCents:number,priceUnit:"hour"|"visit"|"walk",verified:boolean,tags:readonly string[]}} Provider
 * @typedef {{query:string,category?:Category}} ProviderQuery */

/** @param {readonly Provider[]} providers @param {ProviderQuery} criteria */
export function searchProviders(providers, criteria) {
  const terms = normalize(criteria.query).split(" ").filter(Boolean);

  return providers.filter((provider) => {
    if (criteria.category && provider.category !== criteria.category) return false;

    const searchable = normalize([
      provider.name,
      provider.category,
      provider.city,
      provider.province,
      provider.description,
      ...provider.tags,
    ].join(" "));

    return terms.every((term) => searchable.includes(term));
  });
}

/** @param {readonly Provider[]} providers @param {string} id */
export function findProviderById(providers, id) {
  return providers.find((provider) => provider.id === id);
}

/** @param {string} value */
function normalize(value) {
  return value.trim().toLocaleLowerCase("en-CA").replace(/\s+/g, " ");
}
