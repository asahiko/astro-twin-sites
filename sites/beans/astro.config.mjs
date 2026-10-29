import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// Coffee bean catalog. Its twin is the café portal at brew.asahiko.link.
export default defineConfig({
  site: "https://beans.brew.asahiko.link",
  output: "static",
  trailingSlash: "always",
  build: { format: "directory" },
  integrations: [
    sitemap({ i18n: { defaultLocale: "ja", locales: { ja: "ja-JP", en: "en-US" } } }),
  ],
  vite: { ssr: { noExternal: ["@twin/kit"] } },
});
