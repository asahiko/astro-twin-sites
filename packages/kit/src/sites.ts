// Public URL of each twin site, read at build time.
//
// A URL may include a path: "https://example.sakura.ne.jp/brew_preview/" builds the site to be
// served from that subdirectory (Astro's `base`). The defaults are the production hosts;
// BREW_URL / BEANS_URL override them, e.g. for a preview deploy before a domain is switched.
// Keep this file free of `import.meta.env`: astro.config.mjs imports it before Vite is set up.
const DEFAULTS = {
  brew: "https://brew.asahiko.link/",
  beans: "https://beans.brew.asahiko.link/",
} as const;

export type SiteName = keyof typeof DEFAULTS;

/** The site's public URL, always ending in "/". */
export function siteUrl(name: SiteName): URL {
  const url = new URL(process.env[`${name.toUpperCase()}_URL`] || DEFAULTS[name]);
  if (!url.pathname.endsWith("/")) url.pathname += "/";
  return url;
}

/** `site` and `base` for the site's astro.config.mjs. */
export function astroSite(name: SiteName): { site: string; base: string } {
  const url = siteUrl(name);
  return { site: url.origin, base: url.pathname };
}

/** True when NOINDEX=1: a preview build that search engines must not index. */
export function noindex(): boolean {
  return process.env.NOINDEX === "1";
}

/** Absolute URL of a site-relative path ("/en/") on one of the twin sites. */
export function siteHref(name: SiteName, path: string): string {
  return new URL(path.replace(/^\//, ""), siteUrl(name)).href;
}
