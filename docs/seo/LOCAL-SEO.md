# Riflessi Auto Care — Local SEO Playbook

Target cities: **New Westminster · Burnaby · Coquitlam · Surrey · Vancouver**

## On-site (built into the codebase)

- **Service pages** (PR #2): each targets one service keyword + Metro
  Vancouver modifier — `interior car detailing`, `exterior car detailing`,
  `full car detail`, `ceramic coating`. Structure: outcome hero → benefits →
  what's included → pricing link → FAQ (`FAQPage` schema) → CTA band.
- **Location pages** (PR #4): `/locations/[slug]` for the five cities, driven
  by a `locations.ts` content module. Each page needs genuinely unique copy
  (drive times, drop-off logistics, neighbourhoods) — never doorway-page
  boilerplate. Cross-link every location page to all four service pages;
  footer lists all five cities.
- **Schema**: site-wide `AutoRepair` LocalBusiness node with `areaServed`
  (already live in `layout.tsx`); `Service` + `FAQPage` per service page;
  `OfferCatalog` on /pricing; `BreadcrumbList` on nested routes. Builders
  live in `src/lib/seo.ts`.
- **Blog / guides hub** (phase 2, `/guides`): topic clusters that link up to
  their parent service page:
  - Interior: "detailing before selling your car", "removing pet hair
    properly", "steam vs shampoo"
  - Exterior: "how often should you detail", "swirl marks explained",
    "winter prep for BC drivers"
  - Ceramic: "ceramic coating vs wax", "is ceramic coating worth it",
    "aftercare: washing a coated car"

## Google Business Profile (owner actions)

1. Create GBP as category **Car detailing service**, set up as a
   **service-area business**: hide the home address, list the five cities as
   the service area. This is the correct, policy-safe setup for a home
   studio.
2. NAP consistency: use the exact same business name, phone, and site URL
   everywhere (GBP, site footer, directories).
3. Post weekly: one photo of completed work (before/after pairs perform
   best) with a one-line caption naming the service and city.
4. Reviews: after each pickup, send the GBP review link personally. The
   thank-you page can carry the review ask once the profile exists.
5. Q&A: seed the profile's Q&A with the site's FAQ answers (drop-off model,
   turnaround, pricing-by-size).

## Backlink opportunities (roughly in order of effort/return)

1. Local directories: Google, Bing Places, Apple Business Connect, Yelp,
   YellowPages.ca, 411.ca.
2. Detailing-product brands' "find an installer/detailer" directories for
   any products used in the studio (coating brands especially).
3. Community: r/vancouver and BC car-club forums (genuine participation,
   not link drops), local Facebook groups for the five cities.
4. Partnerships: tint shops, PPF installers, independent mechanics, and
   used-car dealers who don't detail in-house — reciprocal referrals.
5. Local press/blogs: "small business" features in New West/Burnaby
   community publications.

## Measurement

- Vercel Analytics is live; watch `/contact` conversion per landing page.
- Once GBP exists, track direction requests + calls monthly.
- Search Console: submit `sitemap.xml` at launch; watch the five
  city + service query families.
