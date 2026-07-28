/**
 * Content shapes — the swap contract. Pages fetch these through
 * `src/lib/content/*` accessors only; components receive them as props and
 * never fetch. Keeping the shapes stable is what makes a future CMS swap a
 * data-layer change, not a component change.
 */

export interface FAQItem {
  question: string;
  answer: string;
}

export const SERVICE_SLUGS = [
  "interior-detailing",
  "exterior-detailing",
  "full-detail",
  "ceramic-coating",
] as const;
export type ServiceSlug = (typeof SERVICE_SLUGS)[number];

/**
 * Canonical human-facing service names. services.ts, navigation.ts, and the
 * booking form all derive from this map — rename a service here, and every
 * surface updates together.
 */
export const SERVICE_LABELS: Record<ServiceSlug, string> = {
  "interior-detailing": "Interior Detail",
  "exterior-detailing": "Exterior Detail",
  "full-detail": "Signature Full Detail",
  "ceramic-coating": "Ceramic Coating",
};

export interface DetailService {
  slug: ServiceSlug;
  name: string;
  /** Full <title>, e.g. "Interior Detailing in Metro Vancouver — Riflessi Auto Care" */
  title: string;
  /** Meta description */
  description: string;
  /** One-line card excerpt */
  excerpt: string;
  /** Outcome-first lede used on the service page hero */
  outcome: string;
  primaryKeyword: string;
  benefits: string[];
  /** What's actually done — the education layer */
  included: string[];
  /** Sibling services to cross-link ("Pairs well with…") */
  pairsWith: ServiceSlug[];
  pageFaq: FAQItem[];
}

export const VEHICLE_SIZES = ["coupe-sedan", "suv-crossover", "truck-van"] as const;
export type VehicleSize = (typeof VEHICLE_SIZES)[number];

export const VEHICLE_SIZE_LABELS: Record<VehicleSize, string> = {
  "coupe-sedan": "Coupe / Sedan",
  "suv-crossover": "SUV / Crossover",
  "truck-van": "Truck / Van",
};

export interface PricingPackage {
  service: ServiceSlug;
  name: string;
  tagline: string;
  /** Exact CAD price per vehicle-size tier */
  prices: Record<VehicleSize, number>;
  /** Rough hands-on time, e.g. "4–6 hours" */
  duration: string;
  features: string[];
  /** The anchor package highlighted on home + pricing */
  featured?: boolean;
}

export interface AddOn {
  name: string;
  /** CAD; rendered as "from $X" when `from` is true */
  price: number;
  from?: boolean;
}

export interface ProcessStep {
  title: string;
  description: string;
}

/**
 * Credit for a licensed photograph. Required by Unsplash's API guidelines for
 * anything sourced through their API, and good practice regardless.
 *
 * Only for imagery that depicts nothing specific about this business. Photos
 * of the bay, the owner, or customer vehicles must be genuine — see the
 * no-invention rule in site.ts and the note in gallery.ts.
 */
export interface PhotoCredit {
  photographer: string;
  /** Photographer's profile page. */
  profileUrl: string;
  /** The photo's own page on the source site. */
  photoUrl: string;
  /** e.g. "Unsplash" */
  source: string;
}

export interface GalleryItem {
  slug: string;
  vehicle: string;
  service: ServiceSlug;
  summary: string;
  /** Real photo paths under /public; absent -> MediaFrame placeholder renders */
  beforeSrc?: string;
  afterSrc?: string;
  beforeAlt: string;
  afterAlt: string;
}

export interface Stat {
  value: number;
  /** Rendered after the animated number, e.g. "+", "%", "h" */
  suffix?: string;
  label: string;
}
