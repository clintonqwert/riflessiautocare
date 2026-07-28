import type { AddOn, PricingPackage, ServiceSlug } from "@/types/content";

// TODO(owner): every dollar figure below is a placeholder pending owner
// sign-off (no-invention rule). Confirm before launch.

const packages: PricingPackage[] = [
  {
    service: "interior-detailing",
    name: "Interior Detail",
    tagline: "The cabin, reset to clean.",
    prices: { "coupe-sedan": 189, "suv-crossover": 229, "truck-van": 269 },
    duration: "3–5 hours",
    features: [
      "Full vacuum, steam, and hot-water extraction",
      "Carpet and upholstery shampoo",
      "Leather cleaned and conditioned",
      "Interior glass and trim finished",
    ],
  },
  {
    service: "exterior-detailing",
    name: "Exterior Detail",
    tagline: "Decontaminated, polished, protected.",
    prices: { "coupe-sedan": 169, "suv-crossover": 209, "truck-van": 249 },
    duration: "3–4 hours",
    features: [
      "Two-bucket hand wash and foam bath",
      "Clay bar decontamination",
      "Machine polish and sealant",
      "Wheels, tires, and glass finished",
    ],
  },
  {
    service: "full-detail",
    name: "Signature Full Detail",
    tagline: "The complete treatment, one visit.",
    prices: { "coupe-sedan": 329, "suv-crossover": 399, "truck-van": 469 },
    duration: "6–8 hours",
    features: [
      "Everything in the Interior Detail",
      "Everything in the Exterior Detail",
      "Sequenced properly in one dedicated day",
      "Final walkthrough at pickup",
    ],
    featured: true,
  },
  {
    service: "ceramic-coating",
    name: "Ceramic Coating",
    tagline: "Years of protection, prep included.",
    prices: { "coupe-sedan": 899, "suv-crossover": 999, "truck-van": 1099 },
    duration: "1–2 days",
    features: [
      "Full decontamination and clay bar",
      "Machine polish before coating",
      "Ceramic coating, cured under cover",
      "Aftercare guidance included",
    ],
  },
];

const addOns: AddOn[] = [
  { name: "Pet hair removal", price: 40, from: true },
  { name: "Engine bay detail", price: 50 },
  { name: "Headlight restoration (pair)", price: 80 },
  { name: "Odor treatment", price: 60 },
];

export function getPricingPackages(): PricingPackage[] {
  return packages;
}

function requirePackage(slug: ServiceSlug): PricingPackage {
  const pkg = packages.find((p) => p.service === slug);
  if (!pkg) {
    throw new Error(
      `pricing.ts: no package for service "${slug}" — was a service slug renamed?`,
    );
  }
  return pkg;
}

export function getFeaturedPackages(): PricingPackage[] {
  // Home shows three: the featured anchor centered by display order.
  const featured = packages.find((p) => p.featured);
  if (!featured) {
    throw new Error("pricing.ts: no package is flagged `featured`.");
  }
  return [
    requirePackage("interior-detailing"),
    featured,
    requirePackage("ceramic-coating"),
  ];
}

export function getAddOns(): AddOn[] {
  return addOns;
}

/** The package for one service — throws (build-time) if the slug has no package. */
export function getPackageForService(slug: ServiceSlug): PricingPackage {
  return requirePackage(slug);
}
