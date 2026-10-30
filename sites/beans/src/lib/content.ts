import { getCollection, type CollectionEntry } from "astro:content";
import type { Lang } from "@twin/kit/i18n";
import { localizeEntries } from "@twin/kit/pairs";

type Required<T, K extends keyof T> = T & { [P in K]-?: NonNullable<T[P]> };
export type NewsData = Required<CollectionEntry<"news">["data"], "slug" | "date" | "category">;
export type NoteData = Required<CollectionEntry<"notes">["data"], "slug" | "date" | "kind" | "beans">;
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

export async function getNotes(lang: Lang) {
  const items = localizeEntries<CollectionEntry<"notes">, NoteData>(await getCollection("notes"), lang);
  const beanSlugs = new Set((await getCollection("beans")).map((b) => b.data.slug));
  items.forEach((n) => {
    assertFields(n.key, n.data, ["slug", "date", "kind", "beans"]);
    const unknown = n.data.beans.filter((s) => !beanSlugs.has(s));
    if (unknown.length) throw new Error(`${n.key}: unknown bean slug ${unknown.join(", ")}`);
  });
  return items.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

/** Notes grouped by bean slug, newest first. */
export async function getNotesByBean(lang: Lang) {
  const byBean = new Map<string, Awaited<ReturnType<typeof getNotes>>>();
  for (const note of await getNotes(lang)) {
    for (const slug of note.data.beans) byBean.set(slug, [...(byBean.get(slug) ?? []), note]);
  }
  return byBean;
}

export async function getSiblingNews(lang: Lang, limit = 5) {
  const items = await getCollection("siblingNews", (e) => e.data.lang === lang);
  return items.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()).slice(0, limit);
}
