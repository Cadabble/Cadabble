// Development-only fictional fixtures. They are never represented as real,
// affiliated, verified, available, rated, licensed, or insured businesses.
export const providers = [
  ["fraser-cleaning-demo", "Fraser Cleaning Demo", "Routine and deep home-cleaning comparison example."],
  ["valley-cleaning-demo", "Valley Cleaning Demo", "Move-in and recurring cleaning comparison example."],
  ["vedder-cleaning-demo", "Vedder Cleaning Demo", "Neighbourhood housekeeping comparison example."],
  ["sardis-cleaning-demo", "Sardis Cleaning Demo", "Kitchen and bathroom cleaning comparison example."],
].map(([id, name, description]) => ({ id, name, description, city: "Chilliwack", province: "BC", serviceCategoryIds: ["home-cleaning"], status: "sample", affiliation: "demo", bookingEnabled: false, tags: ["Fictional sample", "No verified claims"] }));
