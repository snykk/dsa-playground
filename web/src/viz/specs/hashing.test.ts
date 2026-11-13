import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { AnyVizSpec } from '../core/types';
import { lfuCacheSpec, lruCacheSpec } from './cache';
import { bloomFilterSpec, hashSetSpec, hashTableSpec, linearProbingSpec, quadraticProbingSpec, separateChainingSpec } from './hashing';

const ALL: AnyVizSpec[] = [hashTableSpec, separateChainingSpec, linearProbingSpec, quadraticProbingSpec, hashSetSpec, bloomFilterSpec, lruCacheSpec, lfuCacheSpec];
const CHAINS: AnyVizSpec[] = [hashTableSpec, separateChainingSpec, hashSetSpec, lruCacheSpec, lfuCacheSpec];

describe('hashing and cache specs', () => {
  it.each(ALL.map((s) => [s.id, s] as const))('%s: every frame of every example renders', (_, spec) => {
    for (const { value } of spec.examples) {
      for (const frame of spec.trace(spec.parse(value))) {
        const html = renderToStaticMarkup(spec.render(frame.state) as Parameters<typeof renderToStaticMarkup>[0]);
        expect(html.length).toBeGreaterThan(100);
      }
    }
  });

  // The player shows a stage picture at most 440px tall and scales a taller SVG down, which
  // shrinks the labels. ChainView packs bucket rows tightly, so the largest table, 16 buckets
  // (the Python default), is about 512px tall: scaled by at most a seventh.
  it.each(CHAINS.map((s) => [s.id, s] as const))('%s: the picture stays legible in the 440px stage', (_, spec) => {
    const inputs = [...spec.examples.map((e) => e.value), ...Array.from({ length: 40 }, () => spec.randomInput())];
    for (const text of inputs) {
      const [first] = spec.trace(spec.parse(text));
      const html = renderToStaticMarkup(spec.render(first.state) as Parameters<typeof renderToStaticMarkup>[0]);
      const box = html.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
      expect(box, text).not.toBeNull();
      expect(Number(box![2]), text).toBeLessThanOrEqual(520);
      expect(Number(box![1]), text).toBeLessThanOrEqual(1000);
    }
  });

  it('the three collision tabs read the same script', () => {
    const tabs = [separateChainingSpec, linearProbingSpec, quadraticProbingSpec];
    expect(new Set(tabs.map((s) => s.inputKind)).size).toBe(1);
    for (const { value } of linearProbingSpec.examples) for (const s of tabs) expect(() => s.parse(value)).not.toThrow();
    expect(lruCacheSpec.inputKind).toBe(lfuCacheSpec.inputKind);
    for (const { value } of [...lruCacheSpec.examples, ...lfuCacheSpec.examples]) {
      expect(() => lruCacheSpec.parse(value)).not.toThrow();
      expect(() => lfuCacheSpec.parse(value)).not.toThrow();
    }
  });
});
