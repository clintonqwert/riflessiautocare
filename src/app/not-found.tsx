import Link from "next/link";
import { SERVICES_NAV, PRIMARY_CTA } from "@/lib/content/navigation";

// Custom 404 — service links + CTA, never a dead end.
export default function NotFound() {
  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-16 md:px-8 md:py-24">
      <h1 className="text-4xl font-medium tracking-tight text-fg">
        Page not found
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">
        That page didn&apos;t survive the polish. Here&apos;s where to go instead:
      </p>
      <ul className="mt-8 space-y-2">
        {SERVICES_NAV.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-fg underline underline-offset-4 transition-colors hover:text-accent"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
      <Link
        href={PRIMARY_CTA.href}
        className="mt-8 inline-block font-medium text-fg underline underline-offset-4 transition-colors hover:text-accent"
      >
        {PRIMARY_CTA.label}
      </Link>
    </main>
  );
}
