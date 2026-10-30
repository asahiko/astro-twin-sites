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

// The site's `base` without its trailing slash: "" at the root of a host, "/dir" in a subdirectory.
const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

/** Prefix a site-relative path with the language segment ("/news/" -> "/en/news/"). */
export function langPath(lang: Lang, path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return lang === DEFAULT_LANG ? p : `/${lang}${p}`;
}

/** Prefix a site-relative path with the site's `base` ("/favicon.svg" -> "/dir/favicon.svg"). */
export function withBase(path: string): string {
  return BASE + (path.startsWith("/") ? path : `/${path}`);
}

/** URL path of a page on this site, for links: `base` + language segment + path. */
export function localize(lang: Lang, path: string): string {
  return withBase(langPath(lang, path));
}

/** Split a URL pathname (with `base`) into its language and the site-relative rest. */
export function splitLangPath(pathname: string): [Lang, string] {
  if (BASE && (pathname === BASE || pathname.startsWith(`${BASE}/`))) pathname = pathname.slice(BASE.length) || "/";
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
