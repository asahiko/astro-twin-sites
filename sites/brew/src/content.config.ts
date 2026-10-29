import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { PAIR_PATTERN, pairId } from "@twin/kit/pairs";
import { siblingFeedLoader, siblingNewsSchema } from "@twin/kit/sibling-feed";
import { CAFE_CATEGORIES, NEWS_CATEGORIES } from "./lib/labels";

// Metadata fields are optional here because English files may leave them out and inherit them
// from the Japanese file; src/lib/content.ts checks that the merged result is complete.
const categories = <T extends readonly [string, ...string[]]>(values: T) =>
  z.union([z.enum(values), z.array(z.enum(values))]).transform((v) => (Array.isArray(v) ? v : [v]));

const news = defineCollection({
  loader: glob({ pattern: PAIR_PATTERN, base: "./src/content/news", generateId: pairId }),
  schema: z.object({
    title: z.string(),
    slug: z.string().optional(),
    date: z.coerce.date().optional(),
    summary: z.string().optional(),
    category: categories(NEWS_CATEGORIES).optional(),
    eventDate: z.coerce.date().optional(),
    draft: z.boolean().default(false),
  }),
});

const cafes = defineCollection({
  loader: glob({ pattern: PAIR_PATTERN, base: "./src/content/cafes", generateId: pairId }),
  schema: z.object({
    title: z.string(),
    slug: z.string().optional(),
    category: categories(CAFE_CATEGORIES).optional(),
    area: z.string().optional(),
    summary: z.string().optional(),
    tags: z.array(z.string()).optional(),
    website: z.string().url().optional(),
    updatedAt: z.coerce.date().optional(),
    draft: z.boolean().default(false),
  }),
});

const siblingNews = defineCollection({
  loader: siblingFeedLoader({ source: process.env.SIBLING_FEED_SOURCE ?? "https://beans.brew.asahiko.link/" }),
  schema: siblingNewsSchema,
});

export const collections = { news, cafes, siblingNews };
