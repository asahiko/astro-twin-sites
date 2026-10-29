import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { PAIR_PATTERN, pairId } from "@twin/kit/pairs";
import { siblingFeedLoader, siblingNewsSchema } from "@twin/kit/sibling-feed";
import { AVAILABILITY, BEAN_TYPES, COUNTRIES, NEWS_CATEGORIES, PROCESSES, ROASTS } from "./lib/labels";

// Metadata fields are optional here because English files may leave them out and inherit them
// from the Japanese file; src/lib/content.ts checks that the merged result is complete.
const oneOrMany = <T extends readonly [string, ...string[]]>(values: T) =>
  z.union([z.enum(values), z.array(z.enum(values))]).transform((v) => (Array.isArray(v) ? v : [v]));

const beans = defineCollection({
  loader: glob({ pattern: PAIR_PATTERN, base: "./src/content/beans", generateId: pairId }),
  schema: z.object({
    title: z.string(),
    slug: z.string().optional(),
    /** Romanized name used for sorting and the initial-letter filter. */
    sortName: z.string().optional(),
    type: z.enum(BEAN_TYPES).optional(),
    country: oneOrMany(COUNTRIES).optional(),
    process: oneOrMany(PROCESSES).optional(),
    roast: z.enum(ROASTS).optional(),
    availability: z.enum(AVAILABILITY).optional(),
    staffPick: z.boolean().optional(),
    varietal: z.string().optional(),
    altitude: z.string().optional(),
    flavor: z.array(z.string()).optional(),
    roaster: z.string().optional(),
    summary: z.string().optional(),
    addedAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
    draft: z.boolean().default(false),
  }),
});

const news = defineCollection({
  loader: glob({ pattern: PAIR_PATTERN, base: "./src/content/news", generateId: pairId }),
  schema: z.object({
    title: z.string(),
    slug: z.string().optional(),
    date: z.coerce.date().optional(),
    summary: z.string().optional(),
    category: oneOrMany(NEWS_CATEGORIES).optional(),
    eventDate: z.coerce.date().optional(),
    draft: z.boolean().default(false),
  }),
});

const siblingNews = defineCollection({
  loader: siblingFeedLoader({ source: process.env.SIBLING_FEED_SOURCE ?? "https://brew.asahiko.link/" }),
  schema: siblingNewsSchema,
});

export const collections = { beans, news, siblingNews };
