import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { JsonLd } from "@/components/shared/JsonLd";
import { faqSchema } from "@/lib/seo";
import { PRIMARY_CTA } from "@/lib/content/navigation";
import type { FAQItem } from "@/types/content";

interface FAQSectionProps {
  items: FAQItem[];
  heading?: string;
  showCTA?: boolean;
}

export function FAQSection({
  items,
  heading = "Questions people ask before their first drop-off.",
  showCTA = true,
}: FAQSectionProps) {
  return (
    <section className="bg-surface py-16 md:py-24" aria-labelledby="faq-heading">
      <JsonLd schema={faqSchema(items)} />
      <div className="mx-auto max-w-container px-5 md:px-8">
        <div className="mb-10 max-w-2xl" data-reveal>
          <h2
            id="faq-heading"
            className="text-3xl font-medium tracking-tight leading-[1.12] text-fg md:text-[2.5rem]"
          >
            {heading}
          </h2>
          <div aria-hidden className="riflesso-line mt-6 w-24" />
        </div>

        <div
          className="flex max-w-3xl flex-col divide-y divide-line border-y border-line"
          data-reveal
          style={{ "--reveal-i": 1 } as React.CSSProperties}
        >
          {items.map((item, i) => (
            <details key={item.question} {...(i === 0 ? { open: true } : {})} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-sm py-5 text-left transition-colors hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent [&::-webkit-details-marker]:hidden">
                <h3 className="font-sans text-base font-semibold text-fg md:text-lg">
                  {item.question}
                </h3>
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center text-muted transition-colors group-open:text-accent"
                  aria-hidden="true"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    className="transition-transform duration-200 group-open:rotate-45"
                  >
                    <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                  </svg>
                </span>
              </summary>
              <div className="max-w-prose pb-5 text-base leading-relaxed text-muted motion-safe:animate-[fadeUp_0.2s_ease-out]">
                {item.answer}
              </div>
            </details>
          ))}
        </div>

        {showCTA && (
          <div className="mt-10 text-center">
            <p className="mb-4 text-muted">Something else on your mind? Just ask.</p>
            <Link href={PRIMARY_CTA.href} className={buttonClasses({ size: "md" })}>
              {PRIMARY_CTA.label} →
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
