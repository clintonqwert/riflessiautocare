import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { SERVICE_ICONS } from "@/components/services/service-icons";
import type { DetailService } from "@/types/content";

/**
 * The four service cards on their own, with no section heading — the caller
 * supplies the heading. On the homepage that caller is the cinematic
 * sequence's services act, which already owns the copy above the grid.
 */
export function ServiceCards({ services }: { services: DetailService[] }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {services.map((service, i) => {
        const Icon = SERVICE_ICONS[service.slug];
        return (
          <div
            key={service.slug}
            data-reveal
            style={{ "--reveal-i": i } as React.CSSProperties}
          >
            <Card hover className="group flex h-full flex-col p-6">
              <Icon className="h-7 w-7 text-accent" aria-hidden />
              <h3 className="mt-5 font-sans text-lg font-semibold text-fg">
                {service.name}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                {service.excerpt}
              </p>
              <Link
                href={`/services/${service.slug}`}
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-accent transition-colors group-hover:text-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                What&apos;s included
                <span
                  aria-hidden
                  className="transition-transform duration-150 group-hover:translate-x-0.5"
                >
                  →
                </span>
              </Link>
            </Card>
          </div>
        );
      })}
    </div>
  );
}
