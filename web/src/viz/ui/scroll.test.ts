import { describe, expect, it } from 'vitest';
import { hiddenEnds, scrollLeftToShow } from './scroll';

const row = { scrollLeft: 0, viewWidth: 300, contentWidth: 1200, itemWidth: 100, margin: 40 };

describe('scrollLeftToShow', () => {
  it('leaves the row alone when the item is already in view', () => {
    expect(scrollLeftToShow({ ...row, itemLeft: 50 })).toBe(0);
    expect(scrollLeftToShow({ ...row, scrollLeft: 200, itemLeft: 300 })).toBe(200);
  });

  it('brings an item cut off on the right just inside, clear of the hint', () => {
    expect(scrollLeftToShow({ ...row, itemLeft: 500 })).toBe(500 + 100 + 40 - 300);
  });

  it('brings an item cut off on the left just inside', () => {
    expect(scrollLeftToShow({ ...row, scrollLeft: 600, itemLeft: 400 })).toBe(360);
  });

  it('stays inside the scroll range', () => {
    expect(scrollLeftToShow({ ...row, scrollLeft: 300, itemLeft: 10 })).toBe(0);
    expect(scrollLeftToShow({ ...row, itemLeft: 1100 })).toBe(900);
    expect(scrollLeftToShow({ ...row, contentWidth: 250, itemLeft: 150 })).toBe(0);
  });

  it('centres an item too wide for both margins', () => {
    expect(scrollLeftToShow({ ...row, itemLeft: 500, itemWidth: 250 })).toBe(475);
  });

  it('shows the start of an item wider than the view', () => {
    expect(scrollLeftToShow({ ...row, itemLeft: 500, itemWidth: 400 })).toBe(500);
  });

  it('reaches the very end for the last item', () => {
    expect(scrollLeftToShow({ ...row, itemLeft: 960, itemWidth: 240 })).toBe(900);
    expect(scrollLeftToShow({ ...row, itemLeft: 1100, itemWidth: 100 })).toBe(900);
  });
});

describe('hiddenEnds', () => {
  it('reports the ends that hide content', () => {
    expect(hiddenEnds(0, 300, 1200)).toEqual({ before: false, after: true });
    expect(hiddenEnds(450, 300, 1200)).toEqual({ before: true, after: true });
    expect(hiddenEnds(900, 300, 1200)).toEqual({ before: true, after: false });
  });

  it('reports none when everything fits, with slack for fractional offsets', () => {
    expect(hiddenEnds(0, 300, 300)).toEqual({ before: false, after: false });
    expect(hiddenEnds(0, 300, 300.5)).toEqual({ before: false, after: false });
    expect(hiddenEnds(899.5, 300, 1200)).toEqual({ before: true, after: false });
  });
});
