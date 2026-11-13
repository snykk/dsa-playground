/**
 * Root-document pages: hand-written MDX (src/content/pages/*.mdx) that replaces the rendering
 * of a repository-root document, such as README.md (the overview) or STUDY_GUIDE.md (the study
 * guide). The schema lives here so the content collection and the tests share one definition.
 */
import { z } from 'astro/zod';
import { factSchema } from './article';
import { contentsEntrySchema } from './category';

export const pageSchema = z.object({
  /** The root document's page slug, from STANDALONE_DOCS: "overview", "study-guide"... */
  page: z.string(),
  title: z.string(),
  /** One or two sentences under the title. */
  lead: z.string(),
  updated: z.coerce.date(),
  facts: z.array(factSchema).max(6).default([]),
  /**
   * The top-level areas in reading order, shown as a numbered list under the facts (the
   * overview uses it). When present it names every top-level folder exactly once.
   */
  contents: z.array(contentsEntrySchema).default([]),
  related: z.array(z.string()).default([]),
});
export type PageData = z.infer<typeof pageSchema>;

/** The topic folders a <TopicList topics={[...]} /> names, in order, for every list in a page body. */
export function topicListFolders(body: string): string[] {
  return [...body.matchAll(/<TopicList\b[\s\S]*?\btopics=\{\[([^\]]*)\]\}/g)].flatMap((m) =>
    m[1]
      .split(',')
      .map((s) => s.trim().replace(/^['"]|['"]$/g, ''))
      .filter(Boolean),
  );
}
