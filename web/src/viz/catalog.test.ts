import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { getContent } from '../lib/repo';
import { VIZ_CATALOG, VIZ_GROUP_ORDER } from './catalog';
import { VIZ_LOADERS } from './loaders';

describe('visualization catalog', () => {
  const content = getContent();

  it('has unique ids, known groups and a loader for every entry', () => {
    const ids = VIZ_CATALOG.map((v) => v.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(Object.keys(VIZ_LOADERS).sort()).toEqual([...ids].sort());
    for (const v of VIZ_CATALOG) expect(VIZ_GROUP_ORDER).toContain(v.group);
  });

  it('only points at folders that exist in the repository', () => {
    for (const v of VIZ_CATALOG) {
      for (const rel of v.topics) expect(content.byRel.has(rel), `${v.id}: ${rel}`).toBe(true);
    }
  });

  // `topics` lists the pages that show an entry: its home topic first, then every other topic
  // article or category overview that embeds it with <ArticleViz>. The navigation and the cards
  // mark exactly those pages as visualized, so the registry and the pages must agree.
  it('lists exactly the pages that embed each visualization, home topic first', () => {
    const contentDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'content');
    const embeds = new Map<string, Set<string>>();
    const withPage = new Set<string>();
    for (const [dir, key] of [['articles', 'topic'], ['categories', 'category']] as const) {
      for (const file of readdirSync(path.join(contentDir, dir)).filter((f) => f.endsWith('.mdx'))) {
        const source = readFileSync(path.join(contentDir, dir, file), 'utf8');
        const rel = source.match(new RegExp(`^${key}: (.+)$`, 'm'))?.[1].trim();
        if (!rel) continue;
        withPage.add(rel);
        for (const m of source.matchAll(/<ArticleViz\s+ids=\{\[([^\]]*)\]\}/g)) {
          for (const id of m[1].split(',').map((t) => t.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean)) {
            embeds.set(id, new Set([...(embeds.get(id) ?? []), rel]));
          }
        }
      }
    }
    for (const v of VIZ_CATALOG) {
      expect(content.byRel.get(v.topics[0])?.kind, `${v.id}: the first folder is its home topic`).toBe('topic');
      const shown = [...(embeds.get(v.id) ?? [])].sort();
      const registered = v.topics.filter((rel) => withPage.has(rel)).sort();
      expect(registered, `${v.id}: registered pages vs pages that embed it`).toEqual(shown);
    }
  });

  describe.each(VIZ_CATALOG.map((v) => v.id))('%s', (id) => {
    it('loads, and every example plus random inputs trace without errors', async () => {
      const spec = await VIZ_LOADERS[id]();
      expect(spec.id).toBe(id);
      const inputs = [...spec.examples.map((e) => e.value), ...Array.from({ length: 25 }, () => spec.randomInput())];
      for (const text of inputs) {
        const frames = spec.trace(spec.parse(text));
        expect(frames.length, text).toBeGreaterThan(0);
        for (const f of frames) {
          expect(f.caption.length).toBeGreaterThan(0);
          if (f.line !== undefined) {
            expect(f.line).toBeGreaterThanOrEqual(0);
            expect(f.line).toBeLessThan(spec.pseudocode.length);
          }
        }
      }
    });
  });
});
