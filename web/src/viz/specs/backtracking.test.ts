import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { AnyVizSpec } from '../core/types';
import { STACK_SHOWN } from '../renderers/BoardView';
import { graphColoringSpec, nQueensSpec, ratInMazeSpec, sudokuSpec } from './backtracking';

const ALL: AnyVizSpec[] = [ratInMazeSpec, nQueensSpec, graphColoringSpec, sudokuSpec];
const BOARDS: AnyVizSpec[] = [ratInMazeSpec, nQueensSpec, sudokuSpec];
const html = (spec: AnyVizSpec, state: unknown) => renderToStaticMarkup(spec.render(state) as Parameters<typeof renderToStaticMarkup>[0]);

describe('backtracking specs', () => {
  it.each(ALL.map((s) => [s.id, s] as const))('%s: every frame of every example renders', (_, spec) => {
    for (const { value } of spec.examples) {
      const frames = spec.trace(spec.parse(value));
      expect(frames.length, value).toBeGreaterThan(1);
      for (const frame of frames) expect(html(spec, frame.state).length).toBeGreaterThan(100);
    }
  });

  it.each(ALL.map((s) => [s.id, s] as const))('%s: 3 to 5 examples, and random inputs that parse', (_, spec) => {
    expect(spec.examples.length).toBeGreaterThanOrEqual(3);
    expect(spec.examples.length).toBeLessThanOrEqual(5);
    for (let i = 0; i < 20; i++) expect(() => spec.parse(spec.randomInput())).not.toThrow();
  });

  // The stage shows a picture at most 440px tall. A 10 x 10 maze is the largest board, and the
  // stack beside it lists at most STACK_SHOWN calls, so neither needs scaling down.
  it.each(BOARDS.map((s) => [s.id, s] as const))('%s: the board fits the stage, and the stack panel keeps one height through a run', (_, spec) => {
    const inputs = [...spec.examples.map((e) => e.value), ...Array.from({ length: 10 }, () => spec.randomInput())];
    for (const text of inputs) {
      const frames = spec.trace(spec.parse(text));
      const rows = new Set(frames.map((f) => (f.state as { stackRows: number }).stackRows));
      expect(rows.size, text).toBe(1);
      expect([...rows][0]).toBeLessThanOrEqual(STACK_SHOWN);
      const box = html(spec, frames[0].state).match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
      expect(box, text).not.toBeNull();
      expect(Number(box![2]), text).toBeLessThanOrEqual(440);
      expect(Number(box![1]), text).toBeLessThanOrEqual(440);
    }
  });

  it('a deep stack collapses its oldest calls into one line', () => {
    const frames = ratInMazeSpec.trace(ratInMazeSpec.parse('1111111/0000001/1111111/1000000/1111111/0000001/1111111'));
    const deepest = frames.reduce((a, f) => (f.state.stack.length > a.state.stack.length ? f : a));
    expect(deepest.state.stack.length).toBeGreaterThan(STACK_SHOWN);
    const markup = html(ratInMazeSpec, deepest.state);
    expect(markup).toMatch(/\d+ older calls/);
    expect(markup.match(/<li><span class="viz-token/g)!.length).toBe(STACK_SHOWN - 1);
  });
});
