import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { AnyVizSpec } from '../core/types';
import { centroidSpec, heavyLightSpec, lcaEulerSpec, lcaLiftingSpec, mosAlgorithmSpec, sqrtDecompositionSpec } from './specializedTechniques';

const ALL: AnyVizSpec[] = [sqrtDecompositionSpec, mosAlgorithmSpec, lcaLiftingSpec, lcaEulerSpec, heavyLightSpec, centroidSpec];

const html = (spec: AnyVizSpec, state: unknown) => renderToStaticMarkup(spec.render(state) as Parameters<typeof renderToStaticMarkup>[0]);
const viewBox = (markup: string) => {
  const m = markup.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
  return m ? [Number(m[1]), Number(m[2])] : null;
};

/** The largest inputs each parser accepts: 20 or 16 elements; 16 nodes (12 for the LCA tabs) as a star, a path and a broom. */
const LCA_LARGEST = [
  `${Array.from({ length: 11 }, (_, i) => `0-${i + 1}`).join(' ')}; ${Array.from({ length: 8 }, (_, i) => `lca ${i + 1} ${11 - i}`).join(', ')}`,
  `${Array.from({ length: 11 }, (_, i) => `${i}-${i + 1}`).join(' ')}; lca 11 0, dist 0 11, kth 11 11, kth 11 7, lca 5 9, dist 99 0, kth 99 1, lca 11 11`,
  `${Array.from({ length: 5 }, (_, i) => `${i}-${i + 1}`).join(' ')} ${Array.from({ length: 6 }, (_, i) => `5-${i + 6}`).join(' ')}; lca 6 11, dist 0 11, kth 11 6`,
];
const LARGEST: Record<string, string[]> = {
  'lca-up-table': LCA_LARGEST,
  'lca-euler-tour': LCA_LARGEST,
  'sqrt-decomposition': [`[${Array.from({ length: 20 }, (_, i) => -99 + i).join(', ')}]; query 0 19, update 19 -99, query 3 25`],
  'mos-algorithm': [`[${Array.from({ length: 16 }, (_, i) => -99 + i).join(', ')}]; ${Array.from({ length: 8 }, (_, i) => `(${i}, ${15 - i})`).join(' ')}`],
  'heavy-light-decomposition': [
    `${Array.from({ length: 15 }, (_, i) => `0-${i + 1}`).join(' ')}; path 3 9`,
    `${Array.from({ length: 15 }, (_, i) => `${i}-${i + 1}`).join(' ')}; path 0 15`,
    `${Array.from({ length: 7 }, (_, i) => `${i}-${i + 1}`).join(' ')} ${Array.from({ length: 8 }, (_, i) => `7-${i + 8}`).join(' ')}; path 0 15`,
  ],
  'centroid-decomposition': [
    Array.from({ length: 15 }, (_, i) => `0-${i + 1}`).join(' '),
    Array.from({ length: 15 }, (_, i) => `${i}-${i + 1}`).join(' '),
    `${Array.from({ length: 7 }, (_, i) => `${i}-${i + 1}`).join(' ')} ${Array.from({ length: 8 }, (_, i) => `7-${i + 8}`).join(' ')}`,
  ],
};

describe('specialized technique specs', () => {
  it.each(ALL.map((s) => [s.id, s] as const))('%s: every frame of every example renders', (_, spec) => {
    for (const { value } of spec.examples) {
      for (const frame of spec.trace(spec.parse(value))) expect(html(spec, frame.state).length).toBeGreaterThan(100);
    }
  });

  it.each(ALL.map((s) => [s.id, s] as const))('%s: one picture size per run', (_, spec) => {
    for (const text of [...spec.examples.map((e) => e.value), ...LARGEST[spec.id], ...Array.from({ length: 10 }, () => spec.randomInput())]) {
      const sizes = new Set(spec.trace(spec.parse(text)).map((f) => viewBox(html(spec, f.state))!.join('x')));
      expect(sizes.size, text).toBe(1);
    }
  });

  // The player shows a stage picture at most 440px tall and scales a taller SVG down. A deep
  // tree (a path of 16 nodes) is the tallest: its levels shrink to 34px and it is scaled to about
  // two thirds. Two wide trees sit side by side up to 1040px, then one under the other.
  it.each(ALL.map((s) => [s.id, s] as const))('%s: the largest inputs stay legible in the 440px stage', (_, spec) => {
    for (const text of [...spec.examples.map((e) => e.value), ...LARGEST[spec.id]]) {
      const [first] = spec.trace(spec.parse(text));
      const [w, h] = viewBox(html(spec, first.state))!;
      expect(h, text).toBeLessThanOrEqual(680);
      expect(w, text).toBeLessThanOrEqual(1040);
    }
  });

  it('the tree tabs read different inputs, so switching tabs loads each one its own example', () => {
    expect(heavyLightSpec.inputKind).not.toBe(centroidSpec.inputKind);
    expect(sqrtDecompositionSpec.inputKind).not.toBe(mosAlgorithmSpec.inputKind);
  });

  it('the two lowest common ancestor tabs share one input, and every example of one runs on the other', () => {
    expect(lcaLiftingSpec.inputKind).toBe(lcaEulerSpec.inputKind);
    for (const { value } of [...lcaLiftingSpec.examples, ...lcaEulerSpec.examples]) {
      expect(lcaEulerSpec.trace(lcaEulerSpec.parse(value)).length).toBeGreaterThan(0);
      expect(lcaLiftingSpec.trace(lcaLiftingSpec.parse(value)).length).toBeGreaterThan(0);
    }
  });
});
