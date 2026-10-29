import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// Café topics & news portal. Its twin is the bean catalog at beans.brew.asahiko.link.
export default defineConfig({
  site: "https://brew.asahiko.link",
  output: "static",
  trailingSlash: "always",
  build: { format: "directory" },
  integrations: [
    sitemap({ i18n: { defaultLocale: "ja", locales: { ja: "ja-JP", en: "en-US" } } }),
  ],
  vite: { ssr: { noExternal: ["@twin/kit"] } },
});
