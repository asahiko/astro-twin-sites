import { getCollection, type CollectionEntry } from "astro:content";
import type { Lang } from "@twin/kit/i18n";
import { localizeEntries } from "@twin/kit/pairs";

type Required<T, K extends keyof T> = T & { [P in K]-?: NonNullable<T[P]> };
export type NewsData = Required<CollectionEntry<"news">["data"], "slug" | "date" | "category">;
export type BeanData = Required<
  CollectionEntry<"beans">["data"],
  "slug" | "sortName" | "type" | "country" | "process" | "roast" | "availability" | "addedAt"
>;

function assertFields(key: string, data: Record<string, unknown>, fields: string[]) {
  const missing = fields.filter((f) => data[f] === undefined);
  if (missing.length) throw new Error(`${key}: missing ${missing.join(", ")} in index.ja.md`);
}

export async function getNews(lang: Lang) {
  const items = localizeEntries<CollectionEntry<"news">, NewsData>(await getCollection("news"), lang);
  items.forEach((n) => assertFields(n.key, n.data, ["slug", "date", "category"]));
  return items.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export async function getBeans(lang: Lang) {
  const items = localizeEntries<CollectionEntry<"beans">, BeanData>(await getCollection("beans"), lang);
  items.forEach((b) =>
    assertFields(b.key, b.data, ["slug", "sortName", "type", "country", "process", "roast", "availability", "addedAt"]),
  );
  return items.sort((a, b) => a.data.sortName.localeCompare(b.data.sortName));
}

export async function getSiblingNews(lang: Lang, limit = 5) {
  const items = await getCollection("siblingNews", (e) => e.data.lang === lang);
  return items.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()).slice(0, limit);
}
