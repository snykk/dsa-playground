/**
 * Shared pieces of the number theory tracers (euclideanAlgorithm.ts, modularArithmetic.ts,
 * modularExponentiation.ts, millerRabin.ts, chineseRemainder.ts, sieveOfEratosthenes.ts):
 * Python's integer semantics, the extended Euclid every topic copies, and script parsing.
 *
 * Python ints are unbounded, so the tracers whose values can pass 2^53 compute in bigint;
 * the others cap their inputs (their parsers say so).
 */
import { InputError } from '../core/types';

/* ---------- Python integer semantics ---------- */

/** Python's a % m for any non-zero m: the result has the sign of m (floor division). */
export function pyModBig(a: bigint, m: bigint): bigint {
  const r = a % m;
  return r !== 0n && r < 0n !== m < 0n ? r + m : r;
}

/** Python's a // b for any non-zero b: rounds towards minus infinity. */
export function pyDivBig(a: bigint, b: bigint): bigint {
  const q = a / b;
  return a % b !== 0n && a < 0n !== b < 0n ? q - 1n : q;
}

export const absBig = (a: bigint): bigint => (a < 0n ? -a : a);

/** Python's a % m for numbers (safe integers, m != 0). */
export function pyMod(a: number, m: number): number {
  const r = a % m;
  return r !== 0 && r < 0 !== m < 0 ? r + m : r + 0;
}

/** Python's a // b for numbers (safe integers, b != 0). */
export function pyDiv(a: number, b: number): number {
  return Math.floor(a / b);
}

/** int.bit_length() */
export function bitLength(a: bigint): number {
  return a === 0n ? 0 : absBig(a).toString(2).length;
}

/** math.isqrt(n) for 0 <= n < 2^53. */
export function isqrt(n: number): number {
  let r = Math.floor(Math.sqrt(n));
  while (r * r > n) r -= 1;
  while ((r + 1) * (r + 1) <= n) r += 1;
  return r;
}

/** A long integer shortened for a cell: 3182...7461 (the full value goes in the caption). */
export function abbreviate(text: string, max = 11): string {
  if (text.length <= max) return text;
  const keep = Math.max(2, Math.floor((max - 3) / 2));
  return `${text.slice(0, keep)}...${text.slice(-keep)}`;
}

/** Parenthesize a negative number inside an expression: 3 * (-4). */
export const paren = (v: bigint | number): string => (v < 0 ? `(${v})` : String(v));

/* ---------- pictures ---------- */

/**
 * One strip of a run as the renderers reserve room for it (numberTheoryShared.tsx, stripSlots):
 * strips match by label, a count in parentheses ignored; `widths` holds the label and the
 * tokens of its widest frame, in px.
 */
export interface StripSlot {
  key: string;
  widths: number[];
}

/* ---------- the extended Euclid every topic copies ---------- */

/** One call of _extended_gcd_nonneg(a, b) with what it returned; q = a // b (null at the base case). */
export interface EgcdLevel {
  a: bigint;
  b: bigint;
  q: bigint | null;
  r: bigint | null;
  g: bigint;
  x: bigint;
  y: bigint;
}

/**
 * _extended_gcd_nonneg(a, b) for a, b >= 0, as every Python topic writes it:
 *   if b == 0: return (a, 1, 0)
 *   g, x1, y1 = _extended_gcd_nonneg(b, a % b); return (g, y1, x1 - (a // b) * y1)
 * Returns every call, outermost first, each with the triple it returned.
 */
export function egcdLevels(a: bigint, b: bigint): EgcdLevel[] {
  const down: Array<{ a: bigint; b: bigint }> = [];
  let p = a;
  let q = b;
  while (q !== 0n) {
    down.push({ a: p, b: q });
    [p, q] = [q, p % q];
  }
  const levels: EgcdLevel[] = new Array(down.length + 1);
  levels[down.length] = { a: p, b: 0n, q: null, r: null, g: p, x: 1n, y: 0n };
  for (let k = down.length - 1; k >= 0; k--) {
    const below = levels[k + 1];
    const quot = down[k].a / down[k].b;
    levels[k] = { a: down[k].a, b: down[k].b, q: quot, r: down[k].a % down[k].b, g: below.g, x: below.y, y: below.x - quot * below.y };
  }
  return levels;
}

/** extended_gcd(a, b): the non-negative version on |a|, |b|, then x flips when a < 0 and y when b < 0. */
export function extendedGcd(a: bigint, b: bigint): { g: bigint; x: bigint; y: bigint; levels: EgcdLevel[] } {
  const levels = egcdLevels(absBig(a), absBig(b));
  const top = levels[0];
  return { g: top.g, x: a < 0n ? -top.x : top.x, y: b < 0n ? -top.y : top.y, levels };
}

/** mod_inverse(a, m): x % m from extended_gcd(a, m) when the gcd is 1, else None (null). */
export function modInverse(a: bigint, m: bigint): bigint | null {
  const e = extendedGcd(a, m);
  return e.g === 1n ? pyModBig(e.x, m) : null;
}

/* ---------- scripts ---------- */

/** Split a script on commas, semicolons and new lines, but not inside parentheses or brackets. */
export function segments(text: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let cur = '';
  for (const ch of text) {
    if (ch === '(' || ch === '[') depth += 1;
    if (ch === ')' || ch === ']') depth = Math.max(0, depth - 1);
    if (depth === 0 && (ch === ',' || ch === ';' || ch === '\n')) {
      if (cur.trim()) out.push(cur.trim());
      cur = '';
    } else cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

/** "name 1 2", "name(1, 2)", "name: 1 2" -> { name, args }. Names are letters, digits and underscores. */
export function callOf(segment: string): { name: string; args: string[] } | null {
  const m = segment.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*(?:\((.*)\)|[:=]?\s*(.*))$/s);
  if (!m) return null;
  const rest = (m[2] ?? m[3] ?? '').trim();
  return { name: m[1].toLowerCase(), args: rest ? rest.split(/[\s,]+/).filter(Boolean) : [] };
}

/** A whole number written in decimal (an optional sign, digits, optional _ separators). `range` words the bounds for the message. */
export function parseBig(token: string, what: string, lo: bigint, hi: bigint, range = `between ${lo} and ${hi}`): bigint {
  const t = token.replace(/_/g, '');
  if (!/^[+-]?\d+$/.test(t)) throw new InputError(`"${token}" is not a whole number (${what}).`);
  const v = BigInt(t);
  if (v < lo || v > hi) throw new InputError(`${what} must be ${range} (got ${token}).`);
  return v;
}

export function parseNum(token: string, what: string, lo: number, hi: number): number {
  return Number(parseBig(token, what, BigInt(lo), BigInt(hi)));
}
