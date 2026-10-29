// RSS 2.0 at /news/feed/ and /en/news/feed/ (served by `DirectoryIndex index.xml` in .htaccess).
// The bean catalog reads these at build time for its "Brew Tsukuba news" section.
import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { langPaths, localize, type Lang } from "@twin/kit/i18n";
import { getNews } from "../../../../lib/content";
import { UI } from "../../../../lib/labels";

export const getStaticPaths = langPaths;

export async function GET({ props, site }: APIContext) {
  const lang = (props as { lang: Lang }).lang;
  const t = UI[lang];
  const items = (await getNews(lang)).slice(0, 20);
  return rss({
    title: `${t.siteName} — ${t.news}`,
    description: t.tagline,
    site: new URL(localize(lang, "/"), site),
    trailingSlash: true,
    customData: `<language>${lang === "ja" ? "ja-JP" : "en-US"}</language>`,
    items: items.map(({ data }) => ({
      title: data.title,
      pubDate: data.date,
      description: data.summary,
      link: localize(lang, `/news/${data.slug}/`),
      categories: data.category,
    })),
  });
}
