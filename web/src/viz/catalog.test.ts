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
