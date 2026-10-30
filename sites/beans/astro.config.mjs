import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { htaccess } from "@twin/kit/htaccess";
import { astroSite } from "@twin/kit/sites";

// Coffee bean catalog. Its twin is the café portal at brew.asahiko.link.
// Host and base path come from BEANS_URL (see packages/kit/src/sites.ts).
export default defineConfig({
  ...astroSite("beans"),
  output: "static",
  trailingSlash: "always",
  build: { format: "directory" },
  integrations: [
    htaccess(),
    sitemap({ i18n: { defaultLocale: "ja", locales: { ja: "ja-JP", en: "en-US" } } }),
  ],
  vite: { ssr: { noExternal: ["@twin/kit"] } },
});
