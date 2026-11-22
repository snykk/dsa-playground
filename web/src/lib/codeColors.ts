/**
 * Code highlighting uses Shiki's github-light and github-dark themes (astro.config.mjs for the
 * articles, ./markdown.ts for the README pages, Implementations for the source files). Two of
 * their token colours fall below the 4.5:1 that text needs on the theme's own background; this
 * transformer swaps them for the nearest shade that passes, leaving every other colour alone.
 *
 * A token's style holds the light colour as `color:` and the dark one as `--shiki-dark:`
 * (dual themes), so each side has its own table: the same hex can be fine in one theme and too
 * faint in the other (#6A737D is the comment grey of both).
 */
import type { ShikiConfig } from '@astrojs/markdown-remark';

type ShikiTransformer = NonNullable<ShikiConfig['transformers']>[number];

/** github-light on #ffffff: the orange of variables and list markers (3.5:1 -> 4.8:1). */
export const LIGHT_FIXES: Readonly<Record<string, string>> = { '#e36209': '#c24e00' };

/** github-dark on #24292e: the comment grey (3.0:1 -> 5.3:1). */
export const DARK_FIXES: Readonly<Record<string, string>> = { '#6a737d': '#959da5' };

/** A token's inline style with the failing colours replaced (hex compared case-insensitively). */
export function fixCodeColors(style: string): string {
  return style.replace(/(^|;)\s*(color|--shiki-dark)\s*:\s*(#[0-9a-f]{6})\b/gi, (whole, sep: string, prop: string, hex: string) => {
    const fixes = prop.toLowerCase() === 'color' ? LIGHT_FIXES : DARK_FIXES;
    const fixed = fixes[hex.toLowerCase()];
    return fixed ? `${sep}${prop}:${fixed}` : whole;
  });
}

/** The Shiki transformer: applies fixCodeColors to every token. */
export const codeContrast: ShikiTransformer = {
  name: 'dsa-code-contrast',
  span(node) {
    const style = node.properties.style;
    if (typeof style === 'string') node.properties.style = fixCodeColors(style);
  },
};
