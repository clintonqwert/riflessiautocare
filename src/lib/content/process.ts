import type { ProcessStep } from "@/types/content";

const steps: ProcessStep[] = [
  {
    title: "Book your slot",
    description:
      "Pick a service and a drop-off day. Because the studio takes one vehicle at a time, your booking is a reservation, not a queue number.",
  },
  {
    title: "Drop off",
    description:
      "Bring the car by in the morning. We walk around it together, note what matters to you, and confirm exactly what's being done.",
  },
  {
    title: "The work",
    description:
      "Your car gets the studio to itself — proper lighting, controlled environment, and no clock pushing the next vehicle in.",
  },
  {
    title: "Reveal & pickup",
    description:
      "You get a message when it's ready. At pickup we do a final walkthrough together, and you drive home in the reflection.",
  },
];

export function getProcessSteps(): ProcessStep[] {
  return steps;
}
