/**
 * Privacy and Terms copy.
 *
 * TODO(owner): these are plain-language drafts describing how the site
 * actually behaves — they are NOT legal advice and have not been reviewed by
 * a lawyer. Have them reviewed before the production domain goes live, and
 * fill the TODO(owner) gaps flagged inline (retention period, cancellation
 * policy, insurance wording, registered business name).
 *
 * Accuracy rule: every statement here must match what the code really does.
 * If the data pipeline changes (new field, new processor, new analytics),
 * update this file in the same commit.
 */

import { BUSINESS_NAME, CONTACT_EMAIL } from "@/lib/content/site";

export interface LegalSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

/** Keep both in sync — ISO drives <time dateTime>, display drives the text. */
export const LEGAL_LAST_UPDATED_ISO = "2026-07-27";
export const LEGAL_LAST_UPDATED_DISPLAY = "July 27, 2026";

const privacySections: LegalSection[] = [
  {
    heading: "What this policy covers",
    paragraphs: [
      `This policy explains what ${BUSINESS_NAME} collects when you use this website, why it is collected, and what happens to it afterward. It covers this site only — not any third-party site you reach by following a link from here.`,
    ],
  },
  {
    heading: "What you give us",
    paragraphs: [
      "The booking form is the only place this site asks you for personal information. When you submit it, these details are collected:",
    ],
    bullets: [
      "Your name",
      "Your email address and phone number",
      "Your vehicle (year, make, and model) and its size category",
      "The service you selected and your preferred drop-off day",
      "Anything you choose to write in the notes field",
    ],
  },
  {
    heading: "Why it is collected",
    paragraphs: [
      "Solely to answer your booking request: to confirm or propose a drop-off day, share the drop-off address once a booking is confirmed, and reach you about your vehicle while it is in the bay.",
      "Your details are not sold, rented, or traded. They are not used for advertising, and you will not be added to a marketing list because you asked about a detail.",
    ],
  },
  {
    heading: "Where it goes",
    paragraphs: [
      "Booking submissions are transmitted over an encrypted connection to the booking inbox used to manage appointments. They may also appear in server logs kept by the site host as part of normal operation.",
      "This site is hosted on Vercel, which processes requests and stores operational logs on our behalf. No other party receives your booking details.",
    ],
  },
  {
    heading: "Analytics",
    paragraphs: [
      "This site uses Vercel Analytics and Vercel Speed Insights to count page views and measure loading performance. Both are aggregate and privacy-oriented: they do not set advertising cookies, do not build a profile of you, and are not used to identify individual visitors.",
      "There is no advertising network, no social media tracking pixel, and no cross-site tracking on this site.",
    ],
  },
  {
    heading: "How long it is kept",
    paragraphs: [
      "Booking requests are kept for as long as needed to serve the appointment and to hold a basic record of work performed on your vehicle. Requests that never turn into a booking are cleared out once they are clearly stale.",
      // TODO(owner): set a concrete retention period (e.g. 24 months) and state it here.
    ],
  },
  {
    heading: "Your rights",
    paragraphs: [
      `Under British Columbia's Personal Information Protection Act and Canada's PIPEDA, you can ask what personal information is held about you, ask for corrections, and ask for it to be deleted where there is no obligation to keep it.`,
      `Email ${CONTACT_EMAIL} and the request will be handled directly — there is no ticket queue to go through.`,
    ],
  },
  {
    heading: "Security",
    paragraphs: [
      "The site is served over HTTPS and booking submissions are encrypted in transit. No system is perfectly secure, so please do not send payment card numbers or government ID through the booking form — they are never needed to book a detail.",
    ],
  },
  {
    heading: "Changes",
    paragraphs: [
      "If this policy changes, the revised version is posted here with a new date at the top. Material changes to how booking information is handled will be described rather than quietly edited in.",
    ],
  },
];

const termsSections: LegalSection[] = [
  {
    heading: "About these terms",
    paragraphs: [
      `These terms cover your use of this website and the detailing services offered by ${BUSINESS_NAME}, operating in Metro Vancouver, British Columbia. Using the site means you accept them.`,
      // TODO(owner): insert the registered business name / sole proprietorship
      // details once confirmed, if they differ from the trading name.
    ],
  },
  {
    heading: "Bookings are requests until confirmed",
    paragraphs: [
      "Submitting the booking form sends a request — it does not reserve a slot on its own. A slot is reserved only once you receive a reply confirming the date, the service, and the drop-off address.",
      "Only one vehicle is taken at a time, so a confirmed booking holds the bay for that visit and will not be bumped for another vehicle.",
    ],
  },
  {
    heading: "Prices and what can change them",
    paragraphs: [
      "Prices on this site are listed by vehicle size and are what most vehicles in that size pay for that service.",
      "Condition can change the work required. Heavy soiling, pet hair, mould, smoke odour, or neglected paint take materially more time. Where that applies, it is raised with you at drop-off and any difference is agreed before work starts. Nothing is added to the price after the fact.",
    ],
  },
  {
    heading: "What detailing can and cannot do",
    paragraphs: [
      "Detailing improves the condition of a vehicle; it does not make an older vehicle new. Machine polishing lifts light swirls and restores gloss, but deeper scratches, etched or failing clear coat, dents, and worn or torn upholstery are outside what a detail can correct.",
      "The realistic result for your vehicle is discussed with you at drop-off. No promise is made that every defect will be removed, and no result is guaranteed beyond what the vehicle's condition allows.",
      "Ceramic coating longevity depends on how the vehicle is washed and used afterward. Aftercare guidance is provided with every coating; protection claims assume that guidance is followed.",
    ],
  },
  {
    heading: "Your part",
    paragraphs: [
      "To keep drop-off day straightforward, please:",
    ],
    bullets: [
      "Remove valuables, personal documents, and anything irreplaceable before drop-off — items left in the vehicle remain your responsibility.",
      "Mention existing damage, aftermarket paint or wrap, and any sensitive trim or electronics before work starts.",
      "Give accurate vehicle and contact details so the booking and the quote match the car that arrives.",
      "Collect the vehicle at the arranged time, or let us know in advance if plans change.",
    ],
  },
  {
    heading: "Cancelling or rescheduling",
    paragraphs: [
      "Plans change. Let us know as early as you can and the slot can usually be moved — because only one vehicle is booked at a time, a late cancellation leaves the bay empty for the day.",
      // TODO(owner): confirm whether a deposit, notice window, or late-cancellation
      // fee applies, and state it explicitly here before launch.
      "Specific cancellation arrangements, if any apply to your booking, are set out in your booking confirmation.",
    ],
  },
  {
    heading: "Liability",
    paragraphs: [
      "Work is carried out with reasonable care and skill, using methods appropriate to the vehicle's condition.",
      "Nothing in these terms limits liability for anything that cannot lawfully be limited. Otherwise, liability is limited to the amount paid for the service in question, and does not extend to indirect losses such as lost time or loss of use.",
      // TODO(owner): confirm insurance coverage and state it plainly here.
      // Do not publish a coverage claim until it is verified.
    ],
  },
  {
    heading: "Website content",
    paragraphs: [
      "Text, photography, and branding on this site belong to the business and may not be reproduced as your own work. Service descriptions and prices are kept current, but the site may briefly be out of date — the price and scope confirmed in your booking reply are the ones that apply.",
    ],
  },
  {
    heading: "Governing law",
    paragraphs: [
      "These terms are governed by the laws of the Province of British Columbia and the applicable laws of Canada.",
    ],
  },
  {
    heading: "Questions",
    paragraphs: [
      `Anything here that is unclear, ask before you book: ${CONTACT_EMAIL}.`,
    ],
  },
];

export function getPrivacySections(): LegalSection[] {
  return privacySections;
}

export function getTermsSections(): LegalSection[] {
  return termsSections;
}
