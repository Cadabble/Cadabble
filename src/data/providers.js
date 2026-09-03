/** @import { Provider } from "../catalog.js" */

// Development-only fixtures. Do not replace these with generated claims or live-looking availability.
/** @type {readonly Provider[]} */
export const providers = [
  {
    id: "maple-home-cleaning",
    name: "Maple Home Cleaning",
    category: "Home cleaning",
    city: "Toronto",
    province: "ON",
    description: "Routine and deep cleaning for homes and condos.",
    priceFromCents: 12000,
    priceUnit: "visit",
    verified: true,
    tags: ["Eco-friendly options", "Condo service"],
  },
  {
    id: "northstar-handyman",
    name: "Northstar Handyman",
    category: "Handyman",
    city: "Toronto",
    province: "ON",
    description: "Small repairs, furniture assembly, and home maintenance.",
    priceFromCents: 8500,
    priceUnit: "hour",
    verified: true,
    tags: ["Home repairs", "Assembly"],
  },
  {
    id: "harbour-pet-care",
    name: "Harbour Pet Care",
    category: "Pet care",
    city: "Vancouver",
    province: "BC",
    description: "Neighbourhood dog walking and in-home pet visits.",
    priceFromCents: 3200,
    priceUnit: "walk",
    verified: true,
    tags: ["Dog walking", "Home visits"],
  },
  {
    id: "prairie-snow-yard",
    name: "Prairie Snow & Yard",
    category: "Outdoor care",
    city: "Calgary",
    province: "AB",
    description: "Seasonal yard maintenance and snow clearing.",
    priceFromCents: 5500,
    priceUnit: "visit",
    verified: false,
    tags: ["Seasonal", "Snow clearing"],
  },
];
