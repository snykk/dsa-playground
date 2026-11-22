/**
 * Link previews (og:image): one 1200 x 630 card per page with the page title and where it sits
 * in the repository, drawn as SVG on the site's design (a paper page, a graph-paper sheet, slate
 * ink, the step blue) and rasterized at build time by src/pages/og/[...slug].png.ts.
 *
 * This file is pure: text is measured and turned into outlines by a Shaper (fontkit with the
 * site's own fonts in ogFonts.ts, a fixed-width fake in the tests), so a card looks the same on
 * every machine that builds it and needs no installed fonts and no network.
 */
import type { DocNode } from './repo';

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

/** Image name of the home page; the 404 page uses it too. */
export const OG_HOME = 'home';

/** Where a page sits, as in its breadcrumbs: the folders above it, e.g. 'Algorithms / Sorting'. */
export function areaOf(node: DocNode): string {
  const names: string[] = [];
  for (let p = node.parent; p && p.kind !== 'root'; p = p.parent) names.unshift(p.title);
  return names.join(' / ');
}

/**
 * The og:image path (relative to the base path) for the page whose BaseLayout `currentSlug` is
 * given: every route passes the slug its card is named after, the home page passes '' and the
 * 404 page passes nothing.
 */
export function ogImagePath(currentSlug: string | undefined): string {
  return `og/${currentSlug ? currentSlug : OG_HOME}.png`;
}

/** One preview image: `og/<slug>.png`. */
export interface OgCard {
  /** Image path under og/ without the extension, e.g. 'algorithms/sorting/quick-sort'. */
  slug: string;
  title: string;
  /** Where the page sits, e.g. 'Algorithms / Sorting'; empty for a top-level page. */
  area: string;
  /** Optional line under the title, e.g. '12 topics'. */
  note?: string;
}

/** Measures and outlines one font at one weight. */
export interface Shaper {
  /** Advance width of `text` set at `size` px. */
  measure(text: string, size: number): number;
  /** SVG path data for `text` at `size` px with the baseline starting at (x, y). */
  outline(text: string, size: number, x: number, y: number): string;
}

export interface CardFonts {
  /** Titles and the brand name (bold). */
  heading: Shaper;
  /** The area and the note (medium). */
  text: Shaper;
  /** The site address (monospace). */
  mono: Shaper;
}

/** Light-theme tokens from src/styles/tokens.css. */
const C = {
  paper: '#f4f6f9',
  sheet: '#ffffff',
  rule: '#d9dfe8',
  grid: '#e9edf3',
  axis: '#c2cad6',
  ink: '#1c2230',
  ink2: '#4a5468',
  ink3: '#6b7487',
  step: '#2a5fd0',
  neutral: '#c9d0db',
  compare: '#2a78d6',
  active: '#eb6834',
  done: '#1baf7a',
};

/**
 * Greedy word wrap: as many words per line as fit in `maxWidth`. A word wider than the line
 * gets a line of its own (callers pick a smaller size when that happens).
 */
export function wrapLines(text: string, maxWidth: number, measure: (s: string) => number): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (line && measure(next) > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** Shortens `line` word by word, then character by character, until it fits with a trailing "...". */
export function ellipsize(line: string, maxWidth: number, measure: (s: string) => number): string {
  if (measure(line) <= maxWidth) return line;
  const words = line.split(' ');
  while (words.length > 1) {
    words.pop();
    const candidate = `${words.join(' ').replace(/[\s,;:.-]+$/, '')}...`;
    if (measure(candidate) <= maxWidth) return candidate;
  }
  let chars = words[0] ?? '';
  while (chars.length > 1 && measure(`${chars}...`) > maxWidth) chars = chars.slice(0, -1);
  return `${chars}...`;
}

export interface FittedText {
  size: number;
  lines: string[];
}

/**
 * Wraps `text` into as few lines as fit in `maxWidth`, then evens them out: the narrowest width
 * that still gives that many lines, so a title does not end on one lonely word (what CSS calls
 * text-wrap: balance).
 */
export function balanceLines(text: string, maxWidth: number, measure: (s: string) => number): string[] {
  const lines = wrapLines(text, maxWidth, measure);
  if (lines.length < 2) return lines;
  let lo = 0;
  let hi = maxWidth;
  for (let i = 0; i < 14; i++) {
    const mid = (lo + hi) / 2;
    if (wrapLines(text, mid, measure).length <= lines.length) hi = mid;
    else lo = mid;
  }
  return wrapLines(text, hi, measure);
}

/**
 * The largest of `sizes` (largest first) at which `text` wraps into at most `maxLines` lines that
 * all fit, balanced. If none does, the smallest size with the overflow cut and the last line
 * ellipsized.
 */
export function fitText(
  text: string,
  shaper: Pick<Shaper, 'measure'>,
  maxWidth: number,
  maxLines: number,
  sizes: readonly number[],
): FittedText {
  if (sizes.length === 0) throw new Error('fitText needs at least one size');
  for (const size of sizes) {
    const measure = (s: string) => shaper.measure(s, size);
    const lines = wrapLines(text, maxWidth, measure);
    if (lines.length <= maxLines && lines.every((l) => measure(l) <= maxWidth)) {
      return { size, lines: balanceLines(text, maxWidth, measure) };
    }
  }
  const size = sizes[sizes.length - 1];
  const measure = (s: string) => shaper.measure(s, size);
  const all = wrapLines(text, maxWidth, measure);
  const lines = all.slice(0, maxLines);
  const lastIndex = lines.length - 1;
  const rest = all.slice(maxLines);
  lines[lastIndex] = ellipsize(rest.length > 0 ? `${lines[lastIndex]} ${rest.join(' ')}` : lines[lastIndex], maxWidth, measure);
  return { size, lines: lines.map((l) => ellipsize(l, maxWidth, measure)) };
}

/** The site address for the card's footer: host and base path, no scheme or trailing slash. */
export function siteLabel(site: string, base: string): string {
  const url = new URL(base, site);
  return `${url.host}${url.pathname}`.replace(/\/+$/, '');
}

/** A row of bars in mid-sort, as in the sorting visualizations: neutral, one compared pair, a sorted tail. */
const BARS: { h: number; fill: string }[] = [
  { h: 0.42, fill: C.neutral },
  { h: 0.7, fill: C.neutral },
  { h: 0.3, fill: C.compare },
  { h: 0.55, fill: C.active },
  { h: 0.48, fill: C.neutral },
  { h: 0.76, fill: C.done },
  { h: 0.88, fill: C.done },
  { h: 1, fill: C.done },
];

/** The card as an SVG document; every piece of text is an outline. */
export function cardSvg(card: OgCard, fonts: CardFonts, address: string): string {
  const pad = 88;
  const sheet = { x: 32, y: 32, w: OG_WIDTH - 64, h: OG_HEIGHT - 64, r: 24 };
  const right = sheet.x + sheet.w - 56;
  const textWidth = right - pad;

  // The sheet is graph paper with 32 px cells from its corner. The logo and the bars stand on
  // the same grid line, the bars one per cell, like the stage of a sorting visualization.
  const cell = 32;
  const axisY = sheet.y + 3 * cell;
  const logo = 44;
  const brand = [
    `<g transform="translate(${pad} ${axisY - logo}) scale(${(logo / 32).toFixed(4)})">`,
    `<rect width="32" height="32" rx="7" fill="${C.compare}"/>`,
    '<rect x="7" y="17" width="4" height="8" rx="1" fill="#fff"/>',
    '<rect x="14" y="11" width="4" height="14" rx="1" fill="#fff"/>',
    `<rect x="21" y="7" width="4" height="18" rx="1" fill="${C.done}"/>`,
    '</g>',
    `<path fill="${C.ink}" d="${fonts.heading.outline('DSA Playground', 28, pad + logo + 16, axisY - logo / 2 + 10)}"/>`,
  ].join('');

  const barW = cell - 10;
  const barMax = 2 * cell;
  const lastCell = Math.floor((sheet.w - 40) / cell) - 1;
  const firstCell = lastCell - BARS.length + 1;
  const cellX = (k: number) => sheet.x + k * cell;
  const bars = [
    ...BARS.map((b, i) => {
      const h = Math.round(b.h * barMax);
      return `<rect x="${cellX(firstCell + i) + 5}" y="${axisY - h}" width="${barW}" height="${h}" rx="3" fill="${b.fill}"/>`;
    }),
    `<path d="M${cellX(firstCell)} ${axisY}H${cellX(lastCell + 1)}" stroke="${C.axis}" stroke-width="2"/>`,
  ].join('');

  // Area, title and note are set from the bottom up, so the title always ends at the same height
  // and a long title grows upwards into the empty middle of the sheet. A title that would rise
  // into the brand row is set smaller.
  const footerY = sheet.y + sheet.h - 52;
  const area = card.area ? fitText(card.area, fonts.text, textWidth, 1, [32, 28, 24]) : undefined;
  const note = card.note ? fitText(card.note, fonts.text, textWidth, 1, [30, 26]) : undefined;
  const block = (title: FittedText) => {
    const lineH = Math.round(title.size * 1.12);
    // Below the title, clear its descenders (about 0.25 em) by a comfortable gap.
    const last = footerY - 84 - (note ? Math.round(note.size + title.size * 0.42 + 12) : 0);
    const first = last - (title.lines.length - 1) * lineH;
    // Above it, cap height is about 0.7 em: leave a clear gap between the area and the capitals.
    const areaY = Math.round(first - title.size * 0.7 - 26);
    const top = area ? areaY - area.size * 0.75 : first - title.size * 0.75;
    return { title, lineH, first, areaY, top };
  };
  const minTop = axisY + 56;
  const sizes = [84, 76, 68, 60, 54];
  let layout = block(fitText(card.title, fonts.heading, textWidth, 3, sizes));
  for (const size of sizes.filter((s) => s < layout.title.size)) {
    if (layout.top >= minTop) break;
    layout = block(fitText(card.title, fonts.heading, textWidth, 3, [size]));
  }

  const parts: string[] = [];
  if (note) parts.push(`<path fill="${C.ink2}" d="${fonts.text.outline(note.lines[0], note.size, pad, footerY - 84)}"/>`);
  layout.title.lines.forEach((line, i) => {
    parts.push(`<path fill="${C.ink}" d="${fonts.heading.outline(line, layout.title.size, pad, layout.first + i * layout.lineH)}"/>`);
  });
  if (area) parts.push(`<path fill="${C.step}" d="${fonts.text.outline(area.lines[0], area.size, pad, layout.areaY)}"/>`);
  const footer = `<path fill="${C.ink3}" d="${fonts.mono.outline(address, 22, pad, footerY)}"/>`;

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${OG_WIDTH}" height="${OG_HEIGHT}" viewBox="0 0 ${OG_WIDTH} ${OG_HEIGHT}">`,
    '<defs>',
    `<pattern id="grid" width="${cell}" height="${cell}" patternUnits="userSpaceOnUse" x="${sheet.x}" y="${sheet.y}">`,
    `<path d="M${cell} 0H0V${cell}" fill="none" stroke="${C.grid}" stroke-width="2"/>`,
    '</pattern>',
    `<clipPath id="sheet"><rect x="${sheet.x}" y="${sheet.y}" width="${sheet.w}" height="${sheet.h}" rx="${sheet.r}"/></clipPath>`,
    '</defs>',
    `<rect width="${OG_WIDTH}" height="${OG_HEIGHT}" fill="${C.paper}"/>`,
    `<rect x="${sheet.x}" y="${sheet.y}" width="${sheet.w}" height="${sheet.h}" rx="${sheet.r}" fill="${C.sheet}"/>`,
    `<rect x="${sheet.x}" y="${sheet.y}" width="${sheet.w}" height="${sheet.h}" fill="url(#grid)" clip-path="url(#sheet)"/>`,
    `<rect x="${sheet.x + 1}" y="${sheet.y + 1}" width="${sheet.w - 2}" height="${sheet.h - 2}" rx="${sheet.r - 1}" fill="none" stroke="${C.rule}" stroke-width="2"/>`,
    brand,
    bars,
    ...parts,
    footer,
    '</svg>',
  ].join('');
}
