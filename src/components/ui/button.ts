export type ButtonVariant = "primary" | "secondary" | "ghost" | "inverse";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-pill font-semibold transition-[color,background-color,border-color,transform] duration-150 motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-accent-fg hover:bg-accent-hover active:bg-accent-active focus-visible:outline-accent shadow-accent",
  secondary:
    "bg-white/5 text-fg border border-line-strong hover:bg-white/10 hover:border-fg/25 active:bg-white/15 focus-visible:outline-accent",
  ghost: "text-muted hover:text-fg active:text-fg focus-visible:outline-accent",
  /** Dark button for accent-surface contexts (bronze CTA bands). */
  inverse:
    "bg-surface text-fg hover:bg-surface/85 active:bg-surface/75 focus-visible:outline-accent-fg",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-10 px-5 text-sm",
  md: "h-12 px-6 text-sm",
  lg: "h-13 px-7 text-base",
};

/**
 * Shared button recipe. A class-string function rather than a component
 * because most call-sites are <Link>, not <button>. Plain concatenation —
 * no tailwind-merge — so client components (NavBar) don't pull the merge
 * runtime into the first-load bundle; `className` must not repeat recipe
 * utilities.
 */
export function buttonClasses({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return [base, variants[variant], sizes[size], className]
    .filter(Boolean)
    .join(" ");
}
