import type { Metadata } from "next";
import { buildMetadata, SITE_NAME } from "@/lib/seo";
import { PageHero } from "@/components/shared/PageHero";
import { BookingForm } from "@/components/forms/BookingForm";
import { Card } from "@/components/ui/Card";
import { IconKey, IconMapPin, IconClock } from "@/components/ui/icons";
import { BOOKING_RESPONSE_PROMISE, STUDIO_FACTS } from "@/lib/content/site";

export const metadata: Metadata = buildMetadata({
  title: `Book a Detail — ${SITE_NAME} | Metro Vancouver`,
  description:
    "Book a drop-off detailing appointment at Riflessi's private Metro Vancouver studio. Pick a service and a day — you'll get a personal reply within one business day.",
  path: "/contact",
});

const HOW_IT_WORKS = [
  {
    icon: IconClock,
    title: "Request a slot",
    body: `Send the form and you'll get a personal reply ${BOOKING_RESPONSE_PROMISE} to confirm the day.`,
  },
  {
    icon: IconMapPin,
    title: "Get the address",
    body: STUDIO_FACTS.addressPolicy,
  },
  {
    icon: IconKey,
    title: "Drop off",
    body: "Bring the car by in the morning. We walk around it together before any work starts.",
  },
];

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Prenota"
        heading="Book your detail."
        subheading="One vehicle holds the studio at a time — pick your service and a preferred day, and the bay is yours."
      />
      <section className="bg-surface pb-24 md:pb-32">
        <div className="mx-auto max-w-container px-5 md:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-5 lg:gap-16">
            <div className="lg:col-span-3">
              <Card className="p-6 md:p-8">
                <BookingForm />
              </Card>
            </div>
            <aside className="flex flex-col gap-8 lg:col-span-2" aria-label="How booking works">
              {HOW_IT_WORKS.map((step) => {
                const Icon = step.icon;
                return (
                  <div key={step.title} className="flex gap-4">
                    <Icon className="h-6 w-6 shrink-0 text-accent" aria-hidden />
                    <div>
                      <h2 className="font-sans text-base font-semibold text-fg">{step.title}</h2>
                      <p className="mt-1 text-sm leading-relaxed text-muted">{step.body}</p>
                    </div>
                  </div>
                );
              })}
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
