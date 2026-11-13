/**
 * Topic articles: hand-written MDX pages (src/content/articles/*.mdx) that replace the
 * README rendering for a topic. The frontmatter schema lives here so the content
 * collection, the components and the tests share one definition.
 */
import { z } from 'astro/zod';

export const LEVELS = ['Beginner', 'Intermediate', 'Advanced'] as const;
export type Level = (typeof LEVELS)[number];

export const factSchema = z.object({
  label: z.string(),
  /** A complexity such as "O(n log n)" is set in a monospace font; anything else in the text font. */
  value: z.string(),
  hint: z.string().optional(),
  /** "warn" marks a value the reader should be careful about (e.g. a quadratic worst case). */
  tone: z.enum(['neutral', 'warn']).optional(),
});
export type Fact = z.infer<typeof factSchema>;

export const propertySchema = z.object({ label: z.string(), value: z.boolean() });
export type Property = z.infer<typeof propertySchema>;

export const articleSchema = z.object({
  /** Repository folder the article belongs to, e.g. "Algorithms/Sorting/Quick Sort". */
  topic: z.string(),
  title: z.string(),
  /** One or two sentences under the title: what it is and why it matters. */
  lead: z.string(),
  level: z.enum(LEVELS),
  updated: z.coerce.date(),
  facts: z.array(factSchema).min(2).max(6),
  /** Yes/no properties such as "In-place" or "Stable". */
  properties: z.array(propertySchema).default([]),
  /** Repository folders to read first, and folders to read next. */
  prerequisites: z.array(z.string()).default([]),
  related: z.array(z.string()).default([]),
});
export type ArticleData = z.infer<typeof articleSchema>;
