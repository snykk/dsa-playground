/**
 * The part of fontkit's API that src/lib/ogFonts.ts uses (fontkit ships no type declarations).
 * See https://github.com/foliojs/fontkit#readme.
 */
declare module 'fontkit' {
  export interface Path {
    scale(scaleX: number, scaleY?: number): Path;
    translate(x: number, y: number): Path;
    toSVG(): string;
  }

  export interface Glyph {
    id: number;
    path: Path;
    advanceWidth: number;
  }

  export interface GlyphPosition {
    xAdvance: number;
    yAdvance: number;
    xOffset: number;
    yOffset: number;
  }

  export interface GlyphRun {
    glyphs: Glyph[];
    positions: GlyphPosition[];
    advanceWidth: number;
  }

  export interface Font {
    unitsPerEm: number;
    familyName: string;
    variationAxes: Record<string, { name: string; min: number; default: number; max: number }>;
    getVariation(settings: Record<string, number> | string): Font;
    layout(text: string, features?: string[] | Record<string, boolean>): GlyphRun;
  }

  export function create(buffer: Uint8Array, postscriptName?: string): Font;
}
