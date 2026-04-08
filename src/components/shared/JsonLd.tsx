/**
 * JsonLd component
 * Renders a <script type="application/ld+json"> tag in the <head>.
 * Invisible to users — read only by search engine crawlers.
 *
 * Usage:
 *   import JsonLd from "@/components/shared/JsonLd";
 *   import { homeJsonLd } from "@/lib/jsonld";
 *   <JsonLd data={homeJsonLd} />
 */
const JsonLd = ({ data }: { data: object }) => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
  />
);

export default JsonLd;