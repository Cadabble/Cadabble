/** @import { Provider } from "../catalog.js" */

// Development-only fixtures. Do not replace these with generated claims or live-looking availability.
/** @type {readonly Provider[]} */
export const providers = [
  {
    id: "maple-home-cleaning",
    name: "Fraser Home Cleaning",
    category: "Home cleaning",
    city: "Chilliwack",
    province: "BC",
    description: "Routine and deep cleaning for homes and condos.",
    priceFromCents: 12000,
    priceUnit: "visit",
    verified: true,
    tags: ["Eco-friendly options", "Chilliwack service area"],
  },
  {
    id: "northstar-handyman",
    name: "Valley Fresh Cleaning",
    category: "Home cleaning",
    city: "Chilliwack",
    province: "BC",
    description: "Flexible home cleaning for busy households and move-outs.",
    priceFromCents: 13500,
    priceUnit: "visit",
    verified: true,
    tags: ["Move-out cleaning", "Supplies included"],
  },
  {
    id: "harbour-pet-care",
    name: "Vedder Home Care",
    category: "Home cleaning",
    city: "Chilliwack",
    province: "BC",
    description: "Neighbourhood home cleaning with recurring service options.",
    priceFromCents: 11500,
    priceUnit: "visit",
    verified: true,
    tags: ["Recurring service", "Local team"],
  },
  {
    id: "prairie-snow-yard",
    name: "Sardis Daily Help",
    category: "Home cleaning",
    city: "Chilliwack",
    province: "BC",
    description: "Everyday cleaning help for kitchens, bathrooms, and shared spaces.",
    priceFromCents: 9500,
    priceUnit: "visit",
    verified: false,
    tags: ["Daily essentials", "Verification pending"],
  },
];
