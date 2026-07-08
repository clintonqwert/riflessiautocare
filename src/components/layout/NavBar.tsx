"use client";

import { useState, useEffect, useRef, useSyncExternalStore } from "react";
import Link from "next/link";
import { PRIMARY_NAV, PRIMARY_CTA } from "@/lib/content/navigation";
import { buttonClasses } from "@/components/ui/button";

function subscribeToScroll(cb: () => void) {
  window.addEventListener("scroll", cb, { passive: true });
  return () => window.removeEventListener("scroll", cb);
}
const getScrollSnapshot = () => window.scrollY > 60;
const getServerScrollSnapshot = () => false;

function Wordmark() {
  return (
    <span className="font-serif text-xl font-medium tracking-tight text-fg">
      Riflessi
      <span className="ml-2 align-middle text-[11px] font-sans font-semibold uppercase tracking-[0.18em] text-accent">
        Auto Care
      </span>
    </span>
  );
}

export function NavBar() {
  const isScrolled = useSyncExternalStore(
    subscribeToScroll,
    getScrollSnapshot,
    getServerScrollSnapshot,
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (!isMenuOpen) return;
    const firstFocusable = drawerRef.current?.querySelector<HTMLElement>(
      "a[href], button:not([disabled])",
    );
    firstFocusable?.focus();
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsMenuOpen(false);
        hamburgerRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isMenuOpen]);

  const handleDrawerKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "Tab") return;
    const focusable = Array.from(
      drawerRef.current?.querySelectorAll<HTMLElement>(
        "a[href], button:not([disabled])",
      ) ?? [],
    );
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 border-b transition-[background-color,border-color] duration-300 ${
          isScrolled
            ? "bg-surface/80 backdrop-blur-md border-line"
            : "bg-transparent border-transparent"
        }`}
      >
        <div className="mx-auto max-w-container px-5 md:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link
              href="/"
              aria-label="Riflessi Auto Care home"
              className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <Wordmark />
            </Link>

            {/* Desktop nav */}
            <nav className="hidden items-center gap-7 lg:flex" aria-label="Main navigation">
              {PRIMARY_NAV.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-muted transition-colors duration-150 hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden items-center gap-4 lg:flex">
              <Link href={PRIMARY_CTA.href} className={buttonClasses({ size: "sm" })}>
                {PRIMARY_CTA.label}
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button
              ref={hamburgerRef}
              type="button"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-nav-drawer"
              onClick={() => setIsMenuOpen((v) => !v)}
              className="flex h-11 w-11 flex-col justify-center gap-1.5 rounded-md text-fg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent lg:hidden"
            >
              <span
                className={`mx-auto block h-0.5 w-6 rounded-full bg-current transition-transform duration-200 ${
                  isMenuOpen ? "translate-y-2 rotate-45" : ""
                }`}
              />
              <span
                className={`mx-auto block h-0.5 w-6 rounded-full bg-current transition-opacity duration-200 ${
                  isMenuOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`mx-auto block h-0.5 w-6 rounded-full bg-current transition-transform duration-200 ${
                  isMenuOpen ? "-translate-y-2 -rotate-45" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          aria-modal="true"
          role="dialog"
          aria-label="Navigation menu"
          onKeyDown={handleDrawerKeyDown}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60" onClick={() => setIsMenuOpen(false)} />
          {/* Drawer panel */}
          <div
            ref={drawerRef}
            id="mobile-nav-drawer"
            className="absolute right-0 top-0 flex h-full w-4/5 max-w-xs flex-col border-l border-line bg-surface"
          >
            <div className="flex h-16 items-center justify-between px-5">
              <Link
                href="/"
                className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                onClick={() => setIsMenuOpen(false)}
              >
                <Wordmark />
              </Link>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setIsMenuOpen(false)}
                className="flex h-11 w-11 items-center justify-center text-muted hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <nav className="flex flex-1 flex-col gap-1 px-5 py-4" aria-label="Mobile navigation">
              {PRIMARY_NAV.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="py-3 text-lg font-medium text-muted transition-colors hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
              <Link
                href={PRIMARY_CTA.href}
                className={buttonClasses({ size: "md", className: "w-full" })}
                onClick={() => setIsMenuOpen(false)}
              >
                {PRIMARY_CTA.label}
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
