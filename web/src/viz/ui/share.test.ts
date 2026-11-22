import { describe, expect, it } from 'vitest';
import { buildStepLink, copyText, readStepLink } from './share';

const PAGE = 'https://snykk.github.io/dsa-playground/problem-patterns/';

describe('buildStepLink', () => {
  it('adds the 1-based step and the anchor to the page URL', () => {
    expect(buildStepLink(PAGE, { index: 6, anchor: 'visualize' })).toBe(`${PAGE}?step=7#visualize`);
    expect(buildStepLink(PAGE, { index: 0 })).toBe(`${PAGE}?step=1`);
  });

  it('names the open tab on a page with several visualizations', () => {
    expect(buildStepLink(PAGE, { index: 11, viz: 'sliding-window', anchor: 'visualize' })).toBe(
      `${PAGE}?viz=sliding-window&step=12#visualize`,
    );
  });

  it('carries an input that is not the default, encoded', () => {
    const link = buildStepLink(PAGE, { index: 2, viz: 'two-pointers', input: '1, 4, 9; target 13' });
    const url = new URL(link);
    expect(url.searchParams.get('input')).toBe('1, 4, 9; target 13');
    expect(url.searchParams.get('step')).toBe('3');
    expect(link).not.toMatch(/ /);
  });

  it('replaces an old step, tab, input and hash, drops the theme preview and keeps other parameters', () => {
    const from = `${PAGE}?theme=dark&step=40&viz=kmp&input=x&ref=notes#faq`;
    expect(buildStepLink(from, { index: 4, anchor: 'visualize' })).toBe(`${PAGE}?ref=notes&step=5#visualize`);
  });

  it('never writes a step below 1', () => {
    expect(buildStepLink(PAGE, { index: -3 })).toBe(`${PAGE}?step=1`);
  });
});

describe('readStepLink', () => {
  const ids = ['two-pointers', 'sliding-window', 'prefix-sum'];

  it('reads what buildStepLink writes', () => {
    const link = buildStepLink(PAGE, { index: 11, viz: 'prefix-sum', input: '3 1 4 1 5', anchor: 'visualize' });
    expect(readStepLink(new URL(link).search, ids)).toEqual({ index: 11, tab: 2, input: '3 1 4 1 5' });
  });

  it('opens the first tab at the first step without parameters', () => {
    expect(readStepLink('', ids)).toEqual({ index: 0, tab: 0, input: undefined });
  });

  it('keeps the old ?step=N links working', () => {
    expect(readStepLink('?step=40', ['quick-sort'])).toEqual({ index: 39, tab: 0, input: undefined });
  });

  it('ignores steps that are not positive whole numbers', () => {
    for (const bad of ['0', '-2', '2.5', 'abc', '', ' ']) expect(readStepLink(`?step=${bad}`, ids).index).toBe(0);
  });

  it('opens the first tab for an unknown visualization and drops its input', () => {
    expect(readStepLink('?viz=kmp&step=3&input=abc', ids)).toEqual({ index: 2, tab: 0, input: undefined });
  });

  it('applies an input without a tab to the first tab', () => {
    expect(readStepLink('?step=2&input=5+3+8', ids)).toEqual({ index: 1, tab: 0, input: '5 3 8' });
  });
});

describe('copyText', () => {
  it('uses the Clipboard API when it works', async () => {
    const copied: string[] = [];
    const ok = await copyText('link', {
      clipboard: { writeText: async (t) => void copied.push(t) },
      legacyCopy: () => {
        throw new Error('should not be called');
      },
    });
    expect(ok).toBe(true);
    expect(copied).toEqual(['link']);
  });

  it('falls back to the legacy copy when the Clipboard API refuses', async () => {
    const legacy: string[] = [];
    const ok = await copyText('link', {
      clipboard: { writeText: () => Promise.reject(new Error('NotAllowedError')) },
      legacyCopy: (t) => legacy.push(t) > 0,
    });
    expect(ok).toBe(true);
    expect(legacy).toEqual(['link']);
  });

  it('falls back when there is no Clipboard API at all', async () => {
    expect(await copyText('link', { legacyCopy: () => true })).toBe(true);
  });

  it('reports failure when nothing can copy, without throwing', async () => {
    expect(await copyText('link', {})).toBe(false);
    expect(await copyText('link', { legacyCopy: () => false })).toBe(false);
    expect(
      await copyText('link', {
        clipboard: { writeText: () => Promise.reject(new Error('no')) },
        legacyCopy: () => {
          throw new Error('no execCommand');
        },
      }),
    ).toBe(false);
  });
});
