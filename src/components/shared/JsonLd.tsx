/**
 * Renders a JSON-LD structured-data script (server component, zero JS).
 * `<` is escaped so schema content can never break out of the script tag —
 * required once Phase 2 makes this data CMS-supplied.
 */
export function JsonLd({ schema }: { schema: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
      }}
    />
  );
}
