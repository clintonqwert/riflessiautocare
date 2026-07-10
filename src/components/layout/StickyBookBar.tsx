import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { PRIMARY_CTA } from "@/lib/content/navigation";

/**
 * Mobile-only persistent booking bar (server component, zero JS).
 * The body carries matching bottom padding on small screens (layout.tsx)
 * so content and footer are never hidden behind it.
 */
export function StickyBookBar() {
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
