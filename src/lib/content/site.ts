/**
 * Published business facts — the single source of truth for anything a page
 * claims about the business. Copy in code must stay consistent with these
 * everywhere (no-invention rule): if a fact isn't here, don't publish it.
 *
 * Vocabulary rule (owner decision, 2026-07-07): never say "studio" or claim
 * an indoor/controlled facility. The setup is an outdoor detailing bay plus
 * a small garage — the brand sells craft and undivided attention, not
 * square footage.
 */

export const BUSINESS_NAME = "Riflessi Auto Care";

/** The service model — quoted across hero, about, FAQ, schema. */
export const BAY_FACTS = {
  model: "Private, appointment-only detailing",
  intake: "Drop-off only — one vehicle in the bay at a time",
  areaServed: "Metro Vancouver, BC",
  /** Exact address is shared after a booking is confirmed (home bay). */
  addressPolicy: "The drop-off address is shared once your booking is confirmed.",
} as const;

/** Local SEO target cities, in display order. */
export const SERVICE_CITIES = [
  "New Westminster",
  "Burnaby",
  "Coquitlam",
  "Surrey",
  "Vancouver",
] as const;

// TODO(owner): confirm public contact email + phone before launch.
export const CONTACT_EMAIL = "hello@riflessiautocare.ca";

/** Booking response promise — quoted on /thank-you and the booking form. */
export const BOOKING_RESPONSE_PROMISE = "within one business day";
