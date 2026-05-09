// JSON-LD safe-emit helper.
//
// JSON.stringify can produce a literal `</script>` if any input contains it.
// When embedded inside `<script type="application/ld+json">` via
// dangerouslySetInnerHTML, the HTML parser closes the tag early — anything
// after is parsed as HTML (XSS sink).
//
// Threat: admin-edited fields (vendor names, product copy, blog post titles)
// flow into structured data. Compromised admin → bio with `</script><script>
// payload</script>` → XSS on every customer page rendering that JSON-LD.
//
// Defense: replace `<` with `<`. JSON parsers re-decode the escape so
// Google + AI search engines see identical structured data; HTML parser
// never sees a literal `<` so the script tag stays intact.
//
// Sister of GW v2.81.70 + inv same-day. Usage:
//   <script
//     type="application/ld+json"
//     dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLdData) }}
//   />

export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
