/**
 * Published business facts — the single source of truth for anything a page
 * claims about the business. Copy in code must stay consistent with these
 * everywhere (no-invention rule): if a fact isn't here, don't publish it.
 */

export const BUSINESS_NAME = "Riflessi Auto Care";

/** The studio model — quoted across hero, about, FAQ, schema. */
export const STUDIO_FACTS = {
  model: "Private, appointment-only detailing studio",
  intake: "Drop-off only — one vehicle in the studio at a time",
  areaServed: "Metro Vancouver, BC",
  /** Exact address is shared after a booking is confirmed (home studio). */
  addressPolicy:
    "The studio address is shared once your booking is confirmed.",
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
