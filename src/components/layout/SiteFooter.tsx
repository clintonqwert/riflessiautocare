import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import {
  SERVICES_COLUMN,
  EXPLORE_COLUMN,
  LEGAL_LINKS,
  PRIMARY_CTA,
} from "@/lib/content/navigation";
import { BAY_FACTS, CONTACT_EMAIL, SERVICE_CITIES } from "@/lib/content/site";

function FooterColumn({
  heading,
  links,
  ariaLabel,
}: {
  heading: string;
  links: { label: string; href: string }[];
  ariaLabel: string;
}) {
  return (
    <div>
      <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
        {heading}
      </p>
      <nav aria-label={ariaLabel}>
        <ul className="flex flex-col gap-2.5">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-sm text-muted transition-colors hover:text-accent"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface text-muted" aria-label="Site footer">
      <div className="mx-auto max-w-container px-5 pt-16 pb-8 md:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4 md:gap-8">
          {/* Col 1 — Brand */}
          <div className="md:col-span-1">
            <Link href="/" aria-label="Riflessi Auto Care home">
              <span className="font-serif text-xl font-medium tracking-tight text-fg">
                Riflessi
              </span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              {BAY_FACTS.model} serving {BAY_FACTS.areaServed}.
            </p>
            <p className="mt-4 text-xs leading-relaxed text-muted">
              Serving {SERVICE_CITIES.join(" · ")}
            </p>
          </div>

          {/* Col 2 — Services */}
          <FooterColumn
            heading={SERVICES_COLUMN.heading}
            links={SERVICES_COLUMN.links}
            ariaLabel="Footer services navigation"
          />

          {/* Col 3 — Explore */}
          <FooterColumn
            heading={EXPLORE_COLUMN.heading}
            links={EXPLORE_COLUMN.links}
            ariaLabel="Footer explore navigation"
          />

          {/* Col 4 — Book */}
          <div>
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
              Book
            </p>
            <Link href={PRIMARY_CTA.href} className={buttonClasses({ size: "sm" })}>
              {PRIMARY_CTA.label}
            </Link>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="mt-4 flex items-center gap-2 text-sm text-muted transition-colors hover:text-accent"
            >
              {CONTACT_EMAIL}
            </a>
          </div>
        </div>

        {/* Copyright bar */}
        <div className="mt-12 flex flex-col gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted">
            © {new Date().getFullYear()} Riflessi Auto Care · By appointment only · Drop-off service
          </p>
          <ul className="flex gap-4">
            {LEGAL_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-xs text-muted transition-colors hover:text-accent"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/*
          CC BY 4.0 on the homepage's 3D model requires attribution that reaches
          visitors, not just a file in the repo — so it lives here rather than
          only in docs/maintenance/STAGE-MODEL.md.
        */}
        <p className="mt-4 text-[11px] leading-relaxed text-muted/70">
          Homepage 3D model &ldquo;Car Concept&rdquo; by Eric Chadwick for
          Darmstadt Graphics Group, used under{" "}
          <a
            href="https://creativecommons.org/licenses/by/4.0/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 transition-colors hover:text-accent"
          >
            CC BY 4.0
          </a>
          . Modified: interior, textures, and logos removed.
        </p>
      </div>
    </footer>
  );
}
