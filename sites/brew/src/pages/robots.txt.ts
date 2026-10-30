// robots.txt with the sitemap URL for wherever this build is served (host and `base`).
import type { APIContext } from "astro";
import { withBase } from "@twin/kit/i18n";

export function GET({ site }: APIContext) {
  const sitemap = new URL(withBase("/sitemap-index.xml"), site);
  return new Response(`User-agent: *\nAllow: /\nSitemap: ${sitemap}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
