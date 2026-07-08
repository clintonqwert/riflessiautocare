import type { FAQItem } from "@/types/content";
import { BOOKING_RESPONSE_PROMISE, STUDIO_FACTS } from "@/lib/content/site";

const homeFaq: FAQItem[] = [
  {
    question: "Where do I drop off my car?",
    answer: `Riflessi is a private, appointment-only studio in the New Westminster area, serving all of Metro Vancouver. ${STUDIO_FACTS.addressPolicy}`,
  },
  {
    question: "Why drop-off instead of mobile detailing?",
    answer:
      "Detailing done in a driveway fights dust, weather, and bad light. In the studio the environment is controlled: paint is polished under inspection lighting, interiors dry properly indoors, and nothing is rushed to beat the rain.",
  },
  {
    question: "How long will you have my car?",
    answer:
      "Interior or exterior details are usually same-day: drop off in the morning, pick up in the afternoon. The Signature Full Detail takes six to eight hours, and ceramic coating stays one to two days to cure indoors.",
  },
  {
    question: "How does booking work?",
    answer: `Send the booking form with your vehicle and preferred day, and you'll get a personal reply ${BOOKING_RESPONSE_PROMISE} to confirm the slot. One vehicle holds the studio at a time, so confirmed bookings are never bumped.`,
  },
  {
    question: "Are the prices on the site final?",
    answer:
      "Prices are listed by vehicle size and are what most vehicles pay. Heavy soiling, pet hair, or neglected paint can add time — if that's the case, we agree on any difference at drop-off, before the work starts. No surprises at pickup.",
  },
];

export function getHomeFaq(): FAQItem[] {
  return homeFaq;
}
