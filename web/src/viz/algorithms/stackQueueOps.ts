/**
 * Operation scripts shared by the stack and queue visualizations (stack.ts, queue.ts,
 * priorityQueue.ts): "capacity 4; push 10, push(20), pop, peek".
 *
 * Operations are separated by commas, semicolons or new lines; a comma inside parentheses
 * belongs to the call ("enqueue(A, 3)"). Values are short so they fit in a cell.
 */
import { InputError } from '../core/types';
import type { StripData, StripItem } from '../ui/molecules/Strip';

const SPLIT = /[;\n]|,(?![^(]*\))/;
const CALL = /^([A-Za-z_]+)\s*(?:\(\s*([^()]*?)\s*\)|\s+([^()]+?))?$/;
const NUMBER = /^-?\d{1,3}$/;
const WORD = /^[A-Za-z][A-Za-z0-9]{0,2}$/;

export const VALUE_HELP = 'a whole number from -99 to 999 or a word of up to 3 letters and digits';

/** The non-empty operations of a script, trimmed. */
export function splitScript(text: string): string[] {
  return text
    .split(SPLIT)
    .map((t) => t.trim())
    .filter(Boolean);
}

/** "push 5", "push(5)", "enqueue(A, 3)", "pop", "pop()": the lower-case name and its arguments. */
export function readCall(token: string): { name: string; args: string[] } | null {
  const m = token.match(CALL);
  if (!m) return null;
  const rest = m[2] ?? m[3] ?? '';
  return { name: m[1].toLowerCase(), args: rest.split(/[\s,]+/).filter(Boolean) };
}

/** A value as the visualization shows it: numbers are normalized ("007" -> "7"), words kept. */
export function readValue(raw: string): string | null {
  if (NUMBER.test(raw)) {
    const n = Number(raw);
    return n >= -99 && n <= 999 ? String(n) : null;
  }
  return WORD.test(raw) ? raw : null;
}

/** "capacity 4", "cap=4", "capacity: 4" -> 4; anything else -> null. */
export function readCapacity(token: string): number | null {
  const m = token.match(/^(?:capacity|cap)\s*[:=]?\s*\(?\s*(-?\d+)\s*\)?$/i);
  return m ? Number(m[1]) : null;
}

export function badValue(raw: string, op: string): InputError {
  return new InputError(`"${raw}" is not a value ${op} can take here: use ${VALUE_HELP}.`);
}

/** The operations strip: the current one highlighted, the finished ones muted. */
export function opsStrip(labels: string[], current: number): StripData {
  return {
    label: 'Operations',
    items: labels.map((text, i): StripItem => ({ text, role: i === current ? 'active' : i < current ? 'muted' : undefined })),
  };
}

/** A labelled strip of results (popped values, dequeued items), or "(none yet)". */
export function resultStrip(label: string, values: string[], latest = false): StripData {
  return {
    label,
    items: values.length
      ? values.map((text, i): StripItem => ({ text, role: latest && i === values.length - 1 ? 'done' : undefined }))
      : [{ text: '(none yet)' }],
  };
}

export const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/** Python's repr of a value as the caption prints it: numbers bare, words quoted. */
export function pyRepr(value: string): string {
  return NUMBER.test(value) ? value : `'${value}'`;
}

/** Python's repr of a list of values. */
export function pyList(values: Array<string | null>): string {
  return `[${values.map((v) => (v === null ? 'None' : pyRepr(v))).join(', ')}]`;
}

/** Fails when the script would hold more than `max` items at once (`delta` says what each operation adds). */
export function checkLive<O>(ops: O[], delta: (op: O, live: number) => number, max: number, what: string): void {
  let live = 0;
  ops.forEach((op, i) => {
    live = Math.max(0, live + delta(op, live));
    if (live > max) throw new InputError(`At most ${max} ${what} at once fit in the picture; operation ${i + 1} would make ${live}.`);
  });
}
