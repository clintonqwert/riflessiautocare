# Riflessi component map

- `layout/` owns navigation, footer, and persistent booking affordances.
- `home/` owns sections specific to the homepage experience.
- `cinema/` owns the reusable scroll-driven paint-stage sequence and its capability checks.
- `shared/` owns cross-page fragments such as heroes, CTAs, media, FAQ, JSON-LD, and stats.
- `forms/` owns the booking interface; validation and delivery stay in the server action and library layers.
- `ui/` owns primitives and class recipes.

Routes compose components and access content through typed accessors. Components should not reach into content modules themselves.
