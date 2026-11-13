/**
 * Shared input handling for the string-structure visualizations (string basics, string
 * manipulation, rope): a script is a string followed by operations,
 *   "hello world"; substring 1 4, concat "!"
 * separated by commas, semicolons or new lines. Text arguments are quoted ('...' or "...").
 */
import { InputError } from '../core/types';

export type Tok = { kind: 'word'; text: string } | { kind: 'num'; value: number; text: string } | { kind: 'str'; value: string } | { kind: 'list'; items: string[] };

/** Split at commas, semicolons and new lines that are not inside quotes, () or []. */
export function splitScript(text: string): string[] {
  const out: string[] = [];
  let quote: string | null = null;
  let depth = 0;
  let cur = '';
  for (const c of text) {
    if (quote) {
      if (c === quote) quote = null;
      cur += c;
    } else if (c === '"' || c === "'") {
      quote = c;
      cur += c;
    } else if (c === '(' || c === '[') {
      depth++;
      cur += c;
    } else if (c === ')' || c === ']') {
      depth = Math.max(0, depth - 1);
      cur += c;
    } else if (depth === 0 && (c === ',' || c === ';' || c === '\n')) {
      out.push(cur);
      cur = '';
    } else {
      cur += c;
    }
  }
  if (quote) throw new InputError(`A ${quote} quote is never closed: write text arguments as "text" or 'text'.`);
  out.push(cur);
  return out.map((s) => s.trim()).filter(Boolean);
}

/** Words, whole numbers, quoted strings and [list, of, "strings"]; parentheses and commas count as spaces. */
export function tokenize(segment: string): Tok[] {
  const out: Tok[] = [];
  let k = 0;
  while (k < segment.length) {
    const c = segment[k];
    if (/\s/.test(c) || c === '(' || c === ')' || c === ',' || c === '=') {
      k++;
    } else if (c === '"' || c === "'") {
      const end = segment.indexOf(c, k + 1);
      if (end < 0) throw new InputError(`A ${c} quote is never closed in "${segment}".`);
      out.push({ kind: 'str', value: segment.slice(k + 1, end) });
      k = end + 1;
    } else if (c === '[') {
      const items: string[] = [];
      k++;
      for (;;) {
        while (k < segment.length && /[\s,]/.test(segment[k])) k++;
        if (k >= segment.length) throw new InputError(`A [ is never closed in "${segment}".`);
        if (segment[k] === ']') {
          k++;
          break;
        }
        const q = segment[k];
        if (q !== '"' && q !== "'") throw new InputError(`List items must be quoted strings, as in ["a", "b"] (in "${segment}").`);
        const end = segment.indexOf(q, k + 1);
        if (end < 0) throw new InputError(`A ${q} quote is never closed in "${segment}".`);
        items.push(segment.slice(k + 1, end));
        k = end + 1;
      }
      out.push({ kind: 'list', items });
    } else {
      const m = /^[^\s"'()[\],=]+/.exec(segment.slice(k));
      const t = m ? m[0] : c;
      if (/^[+-]?\d+$/.test(t)) out.push({ kind: 'num', value: Number(t), text: t });
      else out.push({ kind: 'word', text: t.toLowerCase() });
      k += t.length;
    }
  }
  return out;
}

/** The visualizations take printable ASCII (the Python code takes any text, one code point per position). */
export function printable(s: string, what: string): string {
  for (const ch of s) {
    const code = ch.codePointAt(0)!;
    if (code < 32 || code > 126) {
      throw new InputError(`${what} may only use printable ASCII characters (letters, digits, punctuation and spaces); "${ch}" is not one.`);
    }
  }
  return s;
}

/** The string a script starts with: "text", 'text', s = "text", or plain text without quotes. */
export function readSubject(segment: string, what: string, maxLen: number): string {
  const m = segment.match(/^(?:[a-z_]\w*\s*=\s*)?(["'])([\s\S]*)\1$/i);
  const text = m ? m[2] : segment.trim();
  if (!m && /["']/.test(text)) throw new InputError(`Put ${what} in quotes, e.g. "hello world"; a quote inside it must be the other kind ('it"s').`);
  printable(text, what);
  if (text.length > maxLen) throw new InputError(`${what[0].toUpperCase()}${what.slice(1)} may have at most ${maxLen} characters (got ${text.length}).`);
  return text;
}

/** A Python-style literal for captions: 'abc', or "it's" when the text holds a single quote. */
export function q(s: string): string {
  return s.includes("'") && !s.includes('"') ? `"${s}"` : `'${s}'`;
}

/** A Python-style list literal: ['a', 'b', '']. */
export function qList(items: string[]): string {
  return `[${items.map(q).join(', ')}]`;
}

/** Read one whole-number argument. */
export function numArg(tok: Tok | undefined, op: string, what: string, lo: number, hi: number): number {
  if (!tok || tok.kind !== 'num') throw new InputError(`${op} needs ${what} (a whole number).`);
  if (tok.value < lo || tok.value > hi) throw new InputError(`${what[0].toUpperCase()}${what.slice(1)} of ${op} must be between ${lo} and ${hi} (got ${tok.value}).`);
  return tok.value;
}

/** Read one quoted text argument. */
export function strArg(tok: Tok | undefined, op: string, what: string, maxLen: number): string {
  if (!tok || tok.kind !== 'str') throw new InputError(`${op} needs ${what} in quotes, e.g. ${op} "abc".`);
  printable(tok.value, `The ${what} of ${op}`);
  if (tok.value.length > maxLen) throw new InputError(`The ${what} of ${op} may have at most ${maxLen} characters (got ${tok.value.length}).`);
  return tok.value;
}

/** A deterministic random generator for tests and random inputs. */
export function seeded(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

export function pick<T>(items: readonly T[], rand: () => number = Math.random): T {
  return items[Math.floor(rand() * items.length)];
}

export function randomWord(alphabet: string, lo: number, hi: number, rand: () => number = Math.random): string {
  const n = lo + Math.floor(rand() * (hi - lo + 1));
  return Array.from({ length: n }, () => alphabet[Math.floor(rand() * alphabet.length)]).join('');
}
