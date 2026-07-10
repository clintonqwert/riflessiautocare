/**
 * Single source of truth for nav + footer link maps.
 * NavBar and SiteFooter both render from these — never hardcode links.
 */

export interface NavLink {
  label: string;
  href: string;
}

export const PRIMARY_NAV: NavLink[] = [
  { label: "Services", href: "/services" },
  { label: "Pricing", href: "/pricing" },
  { label: "Gallery", href: "/gallery" },
  { label: "About", href: "/about" },
];

export const PRIMARY_CTA: NavLink = {
  label: "Book a Detail",
  href: "/contact",
};

export const SERVICES_NAV: NavLink[] = [
  { label: "Interior Detail", href: "/services/interior-detailing" },
  { label: "Exterior Detail", href: "/services/exterior-detailing" },
  { label: "Signature Full Detail", href: "/services/full-detail" },
  { label: "Ceramic Coating", href: "/services/ceramic-coating" },
];

export const SERVICES_COLUMN: { heading: string; links: NavLink[] } = {
  heading: "Services",
  links: [...SERVICES_NAV, { label: "Packages & Pricing", href: "/pricing" }],
};

export const EXPLORE_COLUMN: { heading: string; links: NavLink[] } = {
  heading: "Explore",
  links: [
    { label: "About", href: "/about" },
    { label: "Gallery", href: "/gallery" },
    { label: "Contact", href: "/contact" },
  ],
};

export const LEGAL_LINKS: NavLink[] = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];
