// Build-time loader for the twin site's RSS headlines.
//
// The sibling's feed is read once per build and baked into static HTML, so the published
// pages never fetch anything at runtime. `source` is either the sibling's base URL
// (https://...) or a local `dist/` directory of a sibling build that just finished, which is
// how CI makes both sites show each other's latest news in a single run. An empty `source`
// skips the sibling section entirely.
// A missing or broken feed only logs a warning: the section renders empty instead of failing
// the build (the very first deploy has no sibling feed to read yet).
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Loader } from "astro/loaders";
import { z } from "astro/zod";
import { XMLParser } from "fast-xml-parser";
import { LANGS, localize } from "./i18n";

export const siblingNewsSchema = z.object({
  lang: z.enum(LANGS),
  title: z.string(),
  link: z.string().url(),
  pubDate: z.coerce.date(),
  description: z.string().optional(),
});

async function readFeed(source: string, feedPath: string): Promise<string> {
  if (/^https?:\/\//.test(source)) {
    const url = new URL(feedPath, source);
    const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
    if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
    return res.text();
  }
  return readFile(join(source, feedPath, "index.xml"), "utf8");
}

export function siblingFeedLoader(options: { source: string; feedPath?: string; limit?: number }): Loader {
  const { source, feedPath = "/news/feed/", limit = 10 } = options;
  return {
    name: "sibling-feed",
    async load({ store, logger, parseData }) {
      store.clear();
      if (!source) {
        logger.info("Sibling feed source is empty; skipping headlines");
        return;
      }
      const parser = new XMLParser({ ignoreAttributes: true });
      for (const lang of LANGS) {
        const path = localize(lang, feedPath);
        const where = /^https?:\/\//.test(source) ? new URL(path, source).href : join(source, path);
        try {
          const xml = await readFeed(source, path);
          const raw = parser.parse(xml)?.rss?.channel?.item ?? [];
          const items = (Array.isArray(raw) ? raw : [raw]).slice(0, limit);
          for (const item of items) {
            const id = `${lang}:${item.guid ?? item.link}`;
            const data = await parseData({
              id,
              data: { lang, title: String(item.title), link: item.link, pubDate: item.pubDate, description: item.description },
            });
            store.set({ id, data });
          }
          logger.info(`${items.length} ${lang} headlines from ${where}`);
        } catch (err) {
          logger.warn(`No ${lang} headlines from ${where}: ${(err as Error).message}`);
        }
      }
    },
  };
}
