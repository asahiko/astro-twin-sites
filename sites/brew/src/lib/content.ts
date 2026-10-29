import { getCollection, type CollectionEntry } from "astro:content";
import type { Lang } from "@twin/kit/i18n";
import { localizeEntries } from "@twin/kit/pairs";

type Required<T, K extends keyof T> = T & { [P in K]-?: NonNullable<T[P]> };
export type NewsData = Required<CollectionEntry<"news">["data"], "slug" | "date" | "category">;
export type CafeData = Required<CollectionEntry<"cafes">["data"], "slug" | "category" | "area">;

function assertFields(key: string, data: Record<string, unknown>, fields: string[]) {
  const missing = fields.filter((f) => data[f] === undefined);
  if (missing.length) throw new Error(`${key}: missing ${missing.join(", ")} in index.ja.md`);
}

export async function getNews(lang: Lang) {
  const items = localizeEntries<CollectionEntry<"news">, NewsData>(await getCollection("news"), lang);
  items.forEach((n) => assertFields(n.key, n.data, ["slug", "date", "category"]));
  return items.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export async function getCafes(lang: Lang) {
  const items = localizeEntries<CollectionEntry<"cafes">, CafeData>(await getCollection("cafes"), lang);
  items.forEach((c) => assertFields(c.key, c.data, ["slug", "category", "area"]));
  return items.sort((a, b) => a.data.slug.localeCompare(b.data.slug));
}

export async function getSiblingNews(lang: Lang, limit = 5) {
  const items = await getCollection("siblingNews", (e) => e.data.lang === lang);
  return items.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()).slice(0, limit);
}
