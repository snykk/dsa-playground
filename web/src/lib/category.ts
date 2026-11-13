/**
 * Category articles: hand-written MDX overviews (src/content/categories/*.mdx) for a folder
 * that groups topics. One replaces the README rendering of its folder: it lists the folder's
 * topics in reading order, then compares them. The frontmatter schema lives here so the
 * content collection, the components and the tests share one definition.
 */
import { z } from 'astro/zod';
import { factSchema, LEVELS, type Level } from './article';

export const contentsEntrySchema = z.object({
  /** A sub-folder of the category, by folder name: a topic or a sub-category. */
  folder: z.string(),
  /** One line on what this entry adds to the category; without it the entry's own lead is shown. */
  note: z.string().optional(),
});
export type ContentsEntry = z.infer<typeof contentsEntrySchema>;

export const categorySchema = z.object({
  /** Repository folder of the category, e.g. "Algorithms/String_Algorithms/Pattern_Matching". */
  category: z.string(),
  title: z.string(),
  /** One or two sentences under the title: what the topics have in common. */
  lead: z.string(),
  updated: z.coerce.date(),
  facts: z.array(factSchema).max(6).default([]),
  /** Every sub-folder exactly once, in the order a reader should take them. */
  contents: z.array(contentsEntrySchema).min(1),
  /** Repository folders to read first, and folders to read next. */
  prerequisites: z.array(z.string()).default([]),
  related: z.array(z.string()).default([]),
});
export type CategoryData = z.infer<typeof categorySchema>;

/** The span of levels among a category's topics: "Beginner to Advanced", or one level when they agree. */
export function levelRange(levels: Level[]): string | undefined {
  const present = LEVELS.filter((l) => levels.includes(l));
  if (present.length === 0) return undefined;
  return present.length === 1 ? present[0] : `${present[0]} to ${present[present.length - 1]}`;
}
