import { describe, expect, it } from 'vitest';
import { elementKeepsKey } from './keys';
import { syncScrollStop, type ScrollBoxLike } from './scrollStop';

/** A box of the given widths; `holds` is what querySelector finds inside it. */
function box(scrollWidth: number, clientWidth: number, attrs: Record<string, string> = {}, holds: unknown = null) {
  const a = new Map(Object.entries(attrs));
  const selectors: string[] = [];
  const el: ScrollBoxLike & { attrs: Map<string, string>; scrollWidth: number; selectors: string[] } = {
    scrollWidth,
    clientWidth,
    attrs: a,
    selectors,
    querySelector: (s) => {
      selectors.push(s);
      return holds;
    },
    getAttribute: (n) => a.get(n) ?? null,
    setAttribute: (n, v) => void a.set(n, v),
    removeAttribute: (n) => void a.delete(n),
  };
  return el;
}

describe('syncScrollStop', () => {
  it('adds a tab stop to a box that hides content sideways', () => {
    const b = box(900, 300);
    syncScrollStop(b);
    expect(b.attrs.get('tabindex')).toBe('0');
    expect(b.attrs.has('data-scroll-stop')).toBe(true);
  });

  it('adds none when everything fits, allowing a pixel of rounding', () => {
    const b = box(301, 300);
    syncScrollStop(b);
    expect(b.attrs.has('tabindex')).toBe(false);
  });

  it('adds none when the box holds something focusable, ignoring tabindex -1', () => {
    const b = box(900, 300, {}, {});
    syncScrollStop(b);
    expect(b.attrs.has('tabindex')).toBe(false);
    expect(b.selectors[0]).toContain('a[href]');
    expect(b.selectors[0]).toContain(':not([tabindex="-1"])');
  });

  it('takes its own stop away once the content fits again', () => {
    const b = box(900, 300);
    syncScrollStop(b);
    b.scrollWidth = 300;
    syncScrollStop(b);
    expect(b.attrs.has('tabindex')).toBe(false);
    expect(b.attrs.has('data-scroll-stop')).toBe(false);
  });

  it('leaves a box with a tabindex of its own alone', () => {
    const kept = box(300, 300, { tabindex: '0' });
    syncScrollStop(kept);
    expect(kept.attrs.get('tabindex')).toBe('0');
    const none = box(900, 300, { tabindex: '-1' });
    syncScrollStop(none);
    expect(none.attrs.get('tabindex')).toBe('-1');
    expect(none.attrs.has('data-scroll-stop')).toBe(false);
  });
});

describe('a scroll box in the player', () => {
  it('keeps the keys that scroll it, and only those', () => {
    const list = { tagName: 'OL', hasAttribute: (n: string) => n === 'data-scroll-stop' };
    for (const key of ['ArrowLeft', 'ArrowRight', 'Home', 'End']) expect(elementKeepsKey(list, key)).toBe(true);
    expect(elementKeepsKey(list, ' ')).toBe(false);
    expect(elementKeepsKey(list, '?')).toBe(false);
    // Without the tab stop (everything fits) the arrows step the player as before.
    expect(elementKeepsKey({ tagName: 'OL', hasAttribute: () => false }, 'ArrowRight')).toBe(false);
  });
});
