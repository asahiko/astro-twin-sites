// Translation pairs.
//
// Every entry lives in its own folder holding `index.ja.md` and, optionally, `index.en.md`:
//
//   src/content/news/2026/2026-10-01-latte-art/index.ja.md
//   src/content/news/2026/2026-10-01-latte-art/index.en.md
//
// The folder is the pair; nothing else has to be kept in sync. The Japanese file is canonical
// for language-neutral metadata (slug, dates, categories, codes); the English file only needs
// the fields that are actually translated (title, summary, body), and anything it does set
// overrides the Japanese value.
import type { GenerateIdOptions } from "astro/loaders";
import { DEFAULT_LANG, type Lang } from "./i18n";

export const PAIR_PATTERN = "**/index.{ja,en}.md";

/** `2026/2026-10-01-latte-art/index.en.md` -> `2026/2026-10-01-latte-art/en` */
export function pairId({ entry }: GenerateIdOptions): string {
  return entry.replace(/\/index\.(ja|en)\.md$/, "/$1");
}

export function splitPairId(id: string): { key: string; lang: Lang } {
  const i = id.lastIndexOf("/");
  return { key: id.slice(0, i), lang: id.slice(i + 1) as Lang };
}

interface Entry {
  id: string;
  data: Record<string, unknown>;
}

export interface Localized<E extends Entry, D> {
  /** Folder key shared by both languages. */
  key: string;
  /** The entry to render (body) in the requested language. */
  entry: E;
  /** Canonical (ja) metadata merged with the requested language's fields. */
  data: D;
  /** Languages this item exists in. */
  langs: Lang[];
}

/**
 * Resolve entries for one language. Items without a translation in `lang` are omitted;
 * drafts (`draft: true` on the canonical file) are always omitted.
 */
export function localizeEntries<E extends Entry, D = E["data"]>(entries: E[], lang: Lang): Localized<E, D>[] {
  const byKey = new Map<string, Partial<Record<Lang, E>>>();
  for (const e of entries) {
    const { key, lang: l } = splitPairId(e.id);
    byKey.set(key, { ...byKey.get(key), [l]: e });
  }
  const out: Localized<E, D>[] = [];
  for (const [key, versions] of byKey) {
    const canonical = versions[DEFAULT_LANG];
    if (!canonical) throw new Error(`Translation "${key}" has no ${DEFAULT_LANG} file (index.${DEFAULT_LANG}.md)`);
    if (canonical.data.draft) continue;
    const entry = versions[lang];
    if (!entry) continue;
    const translated = Object.fromEntries(Object.entries(entry.data).filter(([, v]) => v !== undefined));
    out.push({
      key,
      entry,
      data: { ...canonical.data, ...translated } as D,
      langs: (Object.keys(versions) as Lang[]).sort(),
    });
  }
  return out;
}
