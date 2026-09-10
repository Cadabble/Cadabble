// Configurable seed taxonomy. Add categories and aliases here; Anna's matching
// logic does not need to change. Booking safeguards are conservative by default.
export const serviceCategories = [
  { id: "home-cleaning", name: "Home cleaning", aliases: ["cleaning", "house cleaning", "maid", "housekeeping", "deep cleaning"], risk: "standard" },
  { id: "automotive", name: "Automotive services", aliases: ["auto service", "car repair", "mechanic", "auto detailing", "towing"], risk: "standard" },
  { id: "health-wellness", name: "Health and wellness", aliases: ["wellness", "massage", "physiotherapy", "fitness", "personal trainer", "yoga"], risk: "regulated" },
  { id: "professional", name: "Professional services", aliases: ["accounting", "bookkeeping", "tax preparation", "legal services", "consulting", "real estate"], risk: "regulated" },
  { id: "childcare", name: "Nanny and childcare", aliases: ["nanny", "babysitter", "babysitting", "child care", "childcare"], risk: "sensitive" },
  { id: "lawn-landscaping", name: "Lawn care and landscaping", aliases: ["lawn care", "mowing", "gardening", "landscaping"], risk: "standard" },
  { id: "garage-doors", name: "Garage-door services", aliases: ["garage door", "garage-door repair", "overhead door"], risk: "standard" },
  { id: "window-cleaning", name: "Window cleaning", aliases: ["window washing", "wash windows"], risk: "standard" },
  { id: "events-hospitality", name: "Events and hospitality", aliases: ["event planning", "catering", "hotel", "florist", "travel agent"], risk: "standard" },
  { id: "technology", name: "Technology services", aliases: ["software development", "web design", "computer repair", "cybersecurity", "it consulting"], risk: "standard" },
];
