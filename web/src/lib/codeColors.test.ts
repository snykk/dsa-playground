import { describe, expect, it } from 'vitest';
import { codeContrast, DARK_FIXES, fixCodeColors, LIGHT_FIXES } from './codeColors';

/** WCAG contrast ratio of two #rrggbb colours. */
function contrast(a: string, b: string): number {
  const lum = (hex: string) => {
    const [r, g, b2] = [1, 3, 5].map((i) => {
      const c = parseInt(hex.slice(i, i + 2), 16) / 255;
      return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b2;
  };
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

describe('fixCodeColors', () => {
  it('replaces the light orange and leaves its dark side alone', () => {
    expect(fixCodeColors('color:#E36209;--shiki-dark:#FFAB70')).toBe('color:#c24e00;--shiki-dark:#FFAB70');
  });

  it('replaces the dark comment grey but keeps it in the light theme, where it passes', () => {
    expect(fixCodeColors('color:#6A737D;--shiki-dark:#6A737D')).toBe('color:#6A737D;--shiki-dark:#959da5');
  });

  it('keeps other colours and properties as they are', () => {
    const style = 'color:#D73A49;--shiki-dark:#F97583;font-style:italic';
    expect(fixCodeColors(style)).toBe(style);
    expect(fixCodeColors('background-color:#e36209')).toBe('background-color:#e36209');
  });

  it('only swaps in colours with at least 4.5:1 on the theme background', () => {
    for (const [from, to] of Object.entries(LIGHT_FIXES)) {
      expect(contrast(from, '#ffffff')).toBeLessThan(4.5);
      expect(contrast(to, '#ffffff')).toBeGreaterThanOrEqual(4.5);
    }
    for (const [from, to] of Object.entries(DARK_FIXES)) {
      expect(contrast(from, '#24292e')).toBeLessThan(4.5);
      expect(contrast(to, '#24292e')).toBeGreaterThanOrEqual(4.5);
    }
  });
});

describe('codeContrast', () => {
  it('rewrites the style of a token span', () => {
    const node = { type: 'element' as const, tagName: 'span', properties: { style: 'color:#E36209' }, children: [] };
    codeContrast.span?.call({} as never, node, 1, 1, node, {} as never);
    expect(node.properties.style).toBe('color:#c24e00');
  });
});
