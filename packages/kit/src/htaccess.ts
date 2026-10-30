// public/.htaccess is written for a production site at the root of its host. This integration
// adapts the built dist/.htaccess to the build:
// - Apache resolves the paths in `ErrorDocument` from the host root, so when `base` puts the
//   site in a subdirectory, they get the prefix.
// - A NOINDEX build sends `X-Robots-Tag: noindex` with every file, feeds and search index
//   included. (robots.txt can't do this for a subdirectory: crawlers only read the host's.)
import { appendFile, readFile, writeFile } from "node:fs/promises";
import type { AstroIntegration } from "astro";
import { noindex } from "./sites";

export function htaccess(): AstroIntegration {
  let base = "/";
  return {
    name: "htaccess",
    hooks: {
      "astro:config:done": ({ config }) => {
        base = config.base.replace(/\/?$/, "/");
      },
      "astro:build:done": async ({ dir }) => {
        const file = new URL(".htaccess", dir);
        if (base !== "/") {
          const text = await readFile(file, "utf8");
          await writeFile(file, text.replace(/^(\s*ErrorDocument\s+\d+\s+)\//gm, `$1${base}`));
        }
        if (noindex()) {
          await appendFile(file, [
            "",
            "# Preview build (NOINDEX): keep every file out of search engines.",
            "<IfModule mod_headers.c>",
            '  Header always set X-Robots-Tag "noindex, nofollow"',
            "</IfModule>",
            "",
          ].join("\n"));
        }
      },
    },
  };
}
