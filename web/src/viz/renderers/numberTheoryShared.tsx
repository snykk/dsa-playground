/**
 * SVG pieces shared by the number theory renderers (EuclidTiling, ResidueClock, PowerLadder,
 * WitnessChains, CongruenceCombs, SieveGrid): a value cell with a role, a table of such cells,
 * and text measures for the monospace font. Positions are passed in, so the organisms keep
 * their own layouts.
 */
import { useEffect, useRef, useState } from 'react';
import type { Frame, Role } from '../core/types';
import type { StripSlot } from '../algorithms/numberTheoryCommon';
import { Strips, type StripData } from '../ui/molecules/Strip';
import '../ui/roles.css';
import { SYM } from '../ui/symbols';
import './numberTheoryShared.css';

/* ---------- strips that keep the stage's height ---------- */

const stripKey = (label: string) => label.replace(/\s*\(.*\)$/, '');

/** Widths in px of a strip's pieces: the 13px label with its margin, then each token (13px mono, 8px padding, 1px border). */
const stripPieces = (s: StripData) => [s.label.length * 6.7 + 6, ...s.items.map((it) => it.text.length * 7.9 + 19)];

/** For a whole run: every strip that appears in some frame, with its widest content. */
export function stripSlots(frames: Array<Frame<{ strips: StripData[] }>>): StripSlot[] {
  const slots = new Map<string, number[]>();
  for (const f of frames) {
    for (const s of f.state.strips) {
      const key = stripKey(s.label);
      const pieces = stripPieces(s);
      const old = slots.get(key);
      const sum = (ws: number[]) => ws.reduce((a, b) => a + b + 6, 0);
      if (!old || sum(pieces) > sum(old)) slots.set(key, pieces);
    }
  }
  return [...slots].map(([key, widths]) => ({ key, widths }));
}

/** Lines a strip takes when flex-wrap packs its pieces (6px apart) into `width` px; a token wider than the box wraps inside itself. */
function packedLines(widths: number[], width: number): number {
  let lines = 1;
  let used = 0;
  for (const piece of widths) {
    const w = Math.min(piece, width);
    // Its text wraps at spaces, which can waste much of a line: count lines generously.
    if (piece > width) lines += Math.ceil(piece / Math.max(1, 0.6 * width)) - 1;
    if (used > 0 && used + 6 + w > width) {
      lines += 1;
      used = w;
    } else used += (used > 0 ? 6 : 0) + w;
  }
  return lines;
}

const STRIP_TOP = 10;
const STRIP_LINE = 29;
const STRIP_GAP = 6;

/**
 * The strips under a picture, in a box that reserves room for every strip of the run at its
 * widest, wrapped to the box's current width: the stage keeps one height while strips appear,
 * grow and wrap.
 */
export function StableStrips({ strips, slots }: { strips: StripData[]; slots?: StripSlot[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(620);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w) setWidth(w);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const minHeight = (slots ?? []).reduce((h, s) => h + STRIP_TOP + STRIP_LINE + (packedLines(s.widths, width) - 1) * (STRIP_LINE + STRIP_GAP), 0);
  return (
    <div ref={ref} className="nt-strips" style={{ minHeight }}>
      <Strips strips={strips} />
    </div>
  );
}

/** Approximate advance of the monospace font: 0.6 em per character. */
export const monoW = (chars: number, size = 12) => chars * size * 0.6;

/** A cell holding a value; status roles get a check / cross glyph so colour is never alone. */
export function SvgCell({
  x,
  y,
  w,
  h,
  text,
  role,
  align = 'middle',
  emphasis,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  text: string;
  role?: Role;
  align?: 'start' | 'middle' | 'end';
  emphasis?: boolean;
}) {
  const r = role ?? 'idle';
  const glyph = r === 'good' ? SYM.check : r === 'bad' ? SYM.cross : null;
  const tx = align === 'start' ? 6 : align === 'end' ? w - 6 : w / 2;
  return (
    <g className={`nt-cell role-${r}${emphasis ? ' strong' : ''}`} transform={`translate(${x},${y})`}>
      <rect width={w} height={h} rx={4} />
      <text x={tx} y={h / 2} style={{ textAnchor: align }}>
        {text}
      </text>
      {glyph && (
        <g className="nt-glyph" transform={`translate(${w - 2},${2})`}>
          <circle r={6.5} />
          <text>{glyph}</text>
        </g>
      )}
    </g>
  );
}

export interface SvgTableCell {
  text: string;
  role?: Role;
}

/** A table: a header row, then rows of cells; `colW` gives each column's width. */
export function SvgTable({
  x,
  y,
  columns,
  colW,
  rows,
  rowH = 18,
  gap = 3,
  headH = 16,
}: {
  x: number;
  y: number;
  columns: string[];
  colW: number[];
  rows: SvgTableCell[][];
  rowH?: number;
  gap?: number;
  headH?: number;
}) {
  const xs: number[] = [];
  let at = x;
  for (const w of colW) {
    xs.push(at);
    at += w + gap;
  }
  return (
    <g className="nt-table">
      {columns.map((c, i) => (
        <text key={`h${i}`} className="nt-head" x={xs[i] + colW[i] / 2} y={y + headH / 2}>
          {c}
        </text>
      ))}
      {rows.map((row, r) =>
        row.map((cell, i) =>
          cell.text === '' && (cell.role ?? 'idle') === 'idle' ? (
            <rect key={`c${r}-${i}`} className="nt-blank" x={xs[i]} y={y + headH + r * (rowH + gap)} width={colW[i]} height={rowH} rx={4} />
          ) : (
            <SvgCell key={`c${r}-${i}`} x={xs[i]} y={y + headH + r * (rowH + gap)} w={colW[i]} h={rowH} text={cell.text} role={cell.role} />
          ),
        ),
      )}
    </g>
  );
}

/** Width of a table with these column widths. */
export const tableWidth = (colW: number[], gap = 3) => colW.reduce((s, w) => s + w, 0) + gap * Math.max(0, colW.length - 1);

/** Height of a table with `rows` rows. */
export const tableHeight = (rows: number, rowH = 18, gap = 3, headH = 16) => headH + rows * (rowH + gap);
