import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata, SITE_NAME } from "@/lib/seo";
import { buttonClasses } from "@/components/ui/button";
import { BOOKING_RESPONSE_PROMISE } from "@/lib/content/site";

export const metadata: Metadata = {
  ...buildMetadata({
    title: `Request received — ${SITE_NAME}`,
    description: "Your booking request has been received.",
    path: "/thank-you",
  }),
  robots: { index: false },
};

export default function ThankYouPage() {
  return (
    <section className="relative overflow-hidden bg-surface py-28 md:py-40">
      <div aria-hidden className="pointer-events-none absolute inset-0 hero-glow" />
      <div className="relative mx-auto max-w-container px-5 text-center md:px-8">
        <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-accent">
          Grazie
        </p>
        <h1 className="mt-4 text-display-sm font-medium tracking-tight text-fg md:text-display">
          Request received.
        </h1>
        <div aria-hidden className="riflesso-line mx-auto mt-7 w-28" />
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted">
          You&apos;ll get a personal reply {BOOKING_RESPONSE_PROMISE} to confirm
          your slot and share the drop-off address. Until then, the bay is
          being held for one thing: doing your car properly.
        </p>
        <div className="mt-10">
          <Link href="/" className={buttonClasses({ variant: "secondary", size: "md" })}>
            Back to Riflessi
          </Link>
        </div>
      </div>
    </section>
  );
}
