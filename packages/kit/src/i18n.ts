// Language handling shared by both sites.
// Japanese is the default locale and lives at the root ("/news/"); English lives under "/en/".
export const LANGS = ["ja", "en"] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = "ja";

/** Route params for pages under `src/pages/[...lang]/`. */
export function langPaths() {
  return LANGS.map((lang) => ({
    params: { lang: lang === DEFAULT_LANG ? undefined : lang },
    props: { lang },
  }));
}

export function otherLang(lang: Lang): Lang {
  return lang === "ja" ? "en" : "ja";
}

/** Prefix a site-relative path with the language segment ("/news/" -> "/en/news/"). */
export function localize(lang: Lang, path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return lang === DEFAULT_LANG ? p : `/${lang}${p}`;
}

/** Strip the language segment from a pathname, returning [lang, rest]. */
export function splitLangPath(pathname: string): [Lang, string] {
  for (const lang of LANGS) {
    if (lang !== DEFAULT_LANG && (pathname === `/${lang}` || pathname.startsWith(`/${lang}/`))) {
      return [lang, pathname.slice(lang.length + 1) || "/"];
    }
  }
  return [DEFAULT_LANG, pathname];
}

export function formatDate(date: Date, lang: Lang): string {
  return date.toLocaleDateString(lang === "ja" ? "ja-JP" : "en-US", {
    year: "numeric",
    month: lang === "ja" ? "2-digit" : "short",
    day: "2-digit",
    timeZone: "Asia/Tokyo",
  });
}
