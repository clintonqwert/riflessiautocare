"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { buttonClasses } from "@/components/ui/button";
import { PRIMARY_CTA } from "@/lib/content/navigation";

/**
 * Mobile-only persistent booking bar.
 *
 * The body carries matching bottom padding on small screens (layout.tsx) so
 * content and footer are never hidden behind it.
 *
 * It hides on the page it points at. On a phone the bar is a permanent strip
 * across the bottom of the booking form itself, and every tap on it is a
 * no-op navigation to the current route — it costs the form its most valuable
 * screen space to offer the visitor something they are already doing.
 */
export function StickyBookBar() {
  const pathname = usePathname();
  if (pathname === PRIMARY_CTA.href) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/85 px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md md:hidden">
      <Link
        href={PRIMARY_CTA.href}
        className={buttonClasses({ size: "md", className: "w-full" })}
      >
        {PRIMARY_CTA.label}
      </Link>
    </div>
  );
}
