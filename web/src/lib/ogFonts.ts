/**
 * The Shapers for the link-preview cards (src/lib/og.ts): the site's own variable fonts, read
 * from the Fontsource packages in node_modules and shaped with fontkit (kerning included), then
 * turned into SVG outlines. Build-time only (Node): no installed fonts, no network.
 */
import { create, type Font } from 'fontkit';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import type { CardFonts, Shaper } from './og';

const require = createRequire(path.join(process.cwd(), 'package.json'));

function loadFont(file: string): Buffer {
  return readFileSync(require.resolve(file));
}

/** One weight of a variable font as a Shaper; `tracking` is extra space per glyph, in em. */
function shaper(data: Buffer, weight: number, tracking = 0): Shaper {
  const font: Font = create(data).getVariation({ wght: weight });
  return {
    measure(text, size) {
      const run = font.layout(text);
      const scale = size / font.unitsPerEm;
      return run.advanceWidth * scale + Math.max(0, run.glyphs.length - 1) * tracking * size;
    },
    outline(text, size, x, y) {
      const run = font.layout(text);
      const scale = size / font.unitsPerEm;
      let penX = 0;
      const out: string[] = [];
      run.glyphs.forEach((glyph, i) => {
        const pos = run.positions[i];
        const gx = x + (penX + pos.xOffset) * scale + i * tracking * size;
        const gy = y - pos.yOffset * scale;
        // Font units are y-up and SVG is y-down, hence the negative vertical scale.
        const d = glyph.path.scale(scale, -scale).translate(gx, gy).toSVG();
        if (d) out.push(d);
        penX += pos.xAdvance;
      });
      return out.join('');
    },
  };
}

let cached: CardFonts | undefined;

/** Atkinson Hyperlegible Next (bold and medium) and JetBrains Mono, loaded once per build. */
export function cardFonts(): CardFonts {
  if (cached) return cached;
  const sans = loadFont('@fontsource-variable/atkinson-hyperlegible-next/files/atkinson-hyperlegible-next-latin-wght-normal.woff2');
  const mono = loadFont('@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2');
  cached = {
    heading: shaper(sans, 700, -0.012),
    text: shaper(sans, 500),
    mono: shaper(mono, 450),
  };
  return cached;
}
