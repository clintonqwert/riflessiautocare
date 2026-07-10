import type { FAQItem } from "@/types/content";
import { BAY_FACTS, BOOKING_RESPONSE_PROMISE } from "@/lib/content/site";

const homeFaq: FAQItem[] = [
  {
    question: "Where do I drop off my car?",
    answer: `Riflessi works from a private home bay in the New Westminster area, serving all of Metro Vancouver. ${BAY_FACTS.addressPolicy}`,
  },
  {
    question: "Why drop-off instead of mobile detailing?",
    answer:
      "Time and focus. A mobile job has to fit whatever the day allows and pack up when it's done or not; a drop-off stays in the bay for as long as the work actually needs. Steam, extraction, and machine polishing happen with full equipment on hand, and nothing is rushed to make the next stop.",
  },
  {
    question: "How long will you have my car?",
    answer:
      "Interior or exterior details are usually same-day: drop off in the morning, pick up in the afternoon. The Signature Full Detail takes six to eight hours, and ceramic coating stays one to two days so it can cure under cover.",
  },
  {
    question: "How does booking work?",
    answer: `Send the booking form with your vehicle and preferred day, and you'll get a personal reply ${BOOKING_RESPONSE_PROMISE} to confirm the slot. One vehicle holds the bay at a time, so confirmed bookings are never bumped.`,
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
