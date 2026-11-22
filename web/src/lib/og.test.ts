import { describe, expect, it } from 'vitest';
import { areaOf, balanceLines, cardSvg, ellipsize, fitText, ogImagePath, siteLabel, wrapLines, type CardFonts, type Shaper } from './og';
import { ancestors, getContent } from './repo';

/** Every character is half an em wide; an outline records what was drawn where. */
const fake: Shaper = {
  measure: (text, size) => text.length * size * 0.5,
  outline: (text, size, x, y) => `M${x} ${y}[${size}:${text}]`,
};
const fonts: CardFonts = { heading: fake, text: fake, mono: fake };
const width = (s: string) => s.length;

describe('wrapLines', () => {
  it('fills each line with as many words as fit', () => {
    expect(wrapLines('aa bb cc dd', 5, width)).toEqual(['aa bb', 'cc dd']);
    expect(wrapLines('  aa   bb ', 5, width)).toEqual(['aa bb']);
    expect(wrapLines('', 5, width)).toEqual([]);
  });

  it('gives a word wider than the line a line of its own', () => {
    expect(wrapLines('a verylongword b', 5, width)).toEqual(['a', 'verylongword', 'b']);
  });
});

describe('balanceLines', () => {
  it('keeps the line count of a greedy wrap but evens the lines out', () => {
    expect(wrapLines('aa bb cc dd ee', 11, width)).toEqual(['aa bb cc dd', 'ee']);
    expect(balanceLines('aa bb cc dd ee', 11, width)).toEqual(['aa bb cc', 'dd ee']);
  });

  it('leaves a single line alone', () => {
    expect(balanceLines('aa bb', 11, width)).toEqual(['aa bb']);
  });
});

describe('ellipsize', () => {
  it('keeps a line that fits', () => {
    expect(ellipsize('aa bb', 5, width)).toBe('aa bb');
  });

  it('drops whole words, then characters, to fit with three dots', () => {
    expect(ellipsize('aa bb cc dd', 8, width)).toBe('aa bb...');
    expect(ellipsize('aa, bb', 5, width)).toBe('aa...');
    expect(ellipsize('abcdefghij', 6, width)).toBe('abc...');
  });
});

describe('fitText', () => {
  it('uses the largest size at which the text fits', () => {
    // 10 characters: 300 px at 60, 250 px at 50.
    expect(fitText('abcde fghi', fake, 260, 1, [60, 50, 40])).toEqual({ size: 50, lines: ['abcde fghi'] });
    expect(fitText('abcde fghi', fake, 400, 1, [60, 50])).toEqual({ size: 60, lines: ['abcde fghi'] });
  });

  it('wraps before it shrinks', () => {
    expect(fitText('abcde fghij', fake, 160, 2, [60, 50])).toEqual({ size: 60, lines: ['abcde', 'fghij'] });
  });

  it('cuts and ellipsizes when nothing fits', () => {
    const fitted = fitText('one two three four five six', fake, 100, 2, [20]);
    expect(fitted).toEqual({ size: 20, lines: ['one two', 'three...'] });
    for (const line of fitted.lines) expect(fake.measure(line, 20)).toBeLessThanOrEqual(100);
  });
});

describe('cardSvg', () => {
  const svg = cardSvg({ slug: 'x', title: 'Quick Sort', area: 'Algorithms / Sorting', note: '14 topics' }, fonts, 'example.org/site');
  const y = (text: string) => Number(new RegExp(`M\\d+ (-?\\d+)\\[\\d+:${text}\\]`).exec(svg)?.[1]);

  it('is a 1200 x 630 SVG with the title, area, note, brand and address', () => {
    expect(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"')).toBe(true);
    for (const text of ['Quick Sort', 'Algorithms / Sorting', '14 topics', 'DSA Playground', 'example.org/site']) {
      expect(svg).toContain(`:${text}]`);
    }
  });

  it('sets the area above the title, the note below it and the address at the bottom', () => {
    expect(y('Algorithms / Sorting')).toBeLessThan(y('Quick Sort'));
    expect(y('Quick Sort')).toBeLessThan(y('14 topics'));
    expect(y('14 topics')).toBeLessThan(y('example.org/site'));
    expect(y('example.org/site')).toBeLessThan(630);
  });

  it('sets a tall title smaller rather than into the brand row', () => {
    // Twelve words take three lines at the largest size (24 characters a line), which with an
    // area and a note would reach the brand row.
    const words = 'word '.repeat(12).trim();
    const tall = cardSvg({ slug: 'x', title: words, area: 'Area / Sub-area', note: '3 topics' }, fonts, 'example.org');
    const drawn = [...tall.matchAll(/M\d+ (-?\d+)\[(\d+):([^\]]*)\]/g)].map((m) => ({ y: Number(m[1]), size: Number(m[2]), text: m[3] }));
    const titleLines = drawn.filter((d) => d.text.startsWith('word'));
    expect(titleLines.length).toBeGreaterThan(0);
    expect(titleLines[0].size).toBeLessThan(84);
    const area = drawn.find((d) => d.text === 'Area / Sub-area')!;
    const brand = drawn.find((d) => d.text === 'DSA Playground')!;
    expect(area.y - area.size).toBeGreaterThan(brand.y + 40);
  });

  it('leaves out the area and the note when a page has none', () => {
    const plain = cardSvg({ slug: 'x', title: 'Overview', area: '' }, fonts, 'example.org');
    expect(plain).toContain(':Overview]');
    expect(plain.match(/\[\d+:/g)).toHaveLength(3);
  });
});

describe('page helpers', () => {
  it('names the image after the page, and after home for the home and 404 pages', () => {
    expect(ogImagePath('algorithms/sorting/quick-sort')).toBe('og/algorithms/sorting/quick-sort.png');
    expect(ogImagePath('')).toBe('og/home.png');
    expect(ogImagePath(undefined)).toBe('og/home.png');
  });

  it('prints the site address without scheme or trailing slash', () => {
    expect(siteLabel('https://snykk.github.io', '/dsa-playground/')).toBe('snykk.github.io/dsa-playground');
    expect(siteLabel('https://example.com/', '/')).toBe('example.com');
  });

  it('gives a page the folders of its breadcrumbs as its area, and a top-level folder none', () => {
    const content = getContent();
    const deep = content.nodes.filter((n) => ancestors(n).length >= 2);
    expect(deep.length).toBeGreaterThan(0);
    for (const node of deep) expect(areaOf(node)).toBe(ancestors(node).map((a) => a.title).join(' / '));
    expect(areaOf(content.root.children[0])).toBe('');
  });
});
