import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { formatIo, IO_CODE, ioTrace, parseIo, pyInt, pyRepr, stabilizeIo, type IoMode } from './fastIo';

const fixtures = JSON.parse(readFileSync(new URL('./__fixtures__/optimizationTechniques.json', import.meta.url), 'utf8'));
const MODES: IoMode[] = ['lines', 'buffered', 'all'];

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

/** Reference model: the three programs on a plain token list, without frames. */
function model(mode: IoMode, stdin: string): { writes: string[]; error: string | null; stdinCalls: number } {
  const isInt = (s: string) => /^[+-]?\d+$/.test(s.trim());
  const toks = stdin.split(/\s+/).filter(Boolean);
  if (mode === 'lines') {
    const lines = stdin.match(/[^\n]*\n|[^\n]+$/g) ?? [];
    let li = 0;
    let calls = 0;
    const writes: string[] = [];
    const readline = () => {
      calls += 1;
      return li < lines.length ? lines[li++] : '';
    };
    const t0 = readline();
    if (!isInt(t0)) return { writes, error: 'ValueError', stdinCalls: calls };
    for (let r = 0; r < Number(t0); r++) {
      const nl = readline();
      if (!isInt(nl)) return { writes, error: 'ValueError', stdinCalls: calls };
      const parts = readline().split(/\s+/).filter(Boolean);
      if (!parts.every(isInt)) return { writes, error: 'ValueError', stdinCalls: calls };
      writes.push(`${parts.reduce((s, p) => s + Number(p), 0)}\n`);
    }
    return { writes, error: null, stdinCalls: calls };
  }
  if (mode === 'buffered') {
    let i = 0;
    const out: string[] = [];
    const next = () => {
      if (i >= toks.length) throw new Error('IndexError');
      const t = toks[i++];
      if (!isInt(t)) throw new Error('ValueError');
      return Number(t);
    };
    try {
      const t = next();
      for (let r = 0; r < t; r++) {
        const n = next();
        let s = 0;
        for (let j = 0; j < n; j++) s += next();
        out.push(`${s}\n`);
      }
    } catch (e) {
      return { writes: [], error: (e as Error).message, stdinCalls: 1 };
    }
    return { writes: [out.join('')], error: null, stdinCalls: 1 };
  }
  if (!toks.every(isInt)) return { writes: [], error: 'ValueError', stdinCalls: 1 };
  const data = toks.map(Number);
  let idx = 0;
  const out: number[] = [];
  const at = (k: number) => {
    const j = k < 0 ? k + data.length : k;
    if (j < 0 || j >= data.length) throw new Error('IndexError');
    return data[j];
  };
  try {
    const t = at(idx++);
    for (let r = 0; r < t; r++) {
      const n = at(idx++);
      const norm = (v: number) => (v < 0 ? Math.max(0, v + data.length) : Math.min(v, data.length));
      const lo = norm(idx);
      const hi = Math.max(lo, norm(idx + n));
      out.push(data.slice(lo, hi).reduce((s, v) => s + v, 0));
      idx += n;
    }
  } catch (e) {
    return { writes: [], error: (e as Error).message, stdinCalls: 1 };
  }
  return { writes: [`${out.join('\n')}\n`], error: null, stdinCalls: 1 };
}

function randomStdin(rand: () => number): string {
  const t = Math.floor(rand() * 5) - (rand() < 0.1 ? 1 : 0);
  const lines = [String(t)];
  for (let r = 0; r < t + (rand() < 0.2 ? 1 : 0); r++) {
    const n = Math.floor(rand() * 4) - (rand() < 0.08 ? 3 : 0);
    const k = Math.max(0, n + (rand() < 0.2 ? (rand() < 0.5 ? -1 : 1) : 0));
    const vals = Array.from({ length: k }, () => (rand() < 0.04 ? 'x' : String(Math.floor(rand() * 199) - 99)));
    lines.push(rand() < 0.08 ? `${n} ${vals[0] ?? 1}` : String(n));
    if (rand() < 0.15 && vals.length > 1) lines.push(vals.slice(0, 1).join(' '), vals.slice(1).join(' '));
    else lines.push(vals.join(' '));
  }
  if (rand() < 0.1) lines.pop();
  return lines.map((l) => `${l}\n`).join('');
}

describe('fast I/O programs', () => {
  it.each(MODES)('%s: every call, read, write and exception of the Python program (golden fixtures)', (mode) => {
    const cases = fixtures.fastio as Array<Record<string, unknown>>;
    expect(cases.length).toBeGreaterThanOrEqual(40);
    for (const c of cases) {
      const want = c[mode] as { calls: unknown; reads: unknown; writes: unknown; error: unknown; tokens?: unknown };
      const run = ioTrace(mode, { stdin: c.stdin as string });
      const where = `${mode} ${JSON.stringify(c.stdin)}`;
      expect(run.calls, where).toEqual(want.calls);
      expect(run.reads, where).toEqual(want.reads);
      expect(run.writes, where).toEqual(want.writes);
      expect(run.error, where).toEqual(want.error);
      if (mode === 'buffered') expect(run.tokens, where).toEqual(want.tokens);
    }
  });

  it.each(MODES)('%s: agrees with a plain reference model on random inputs, and the frames are well-formed', (mode) => {
    const rand = rng(mode === 'lines' ? 1 : mode === 'buffered' ? 2 : 3);
    for (let t = 0; t < 150; t++) {
      const stdin = randomStdin(rand);
      const run = ioTrace(mode, { stdin });
      const ref = model(mode, stdin);
      expect(run.writes, stdin).toEqual(ref.writes);
      expect(run.error?.[0] ?? null, stdin).toBe(ref.error);
      expect(run.calls.length, stdin).toBe(ref.stdinCalls);
      const frames = stabilizeIo(run.frames);
      const size = `${frames[0].state.maxLines},${frames[0].state.maxTokens},${frames[0].state.maxWrites},${frames[0].state.maxValues}`;
      for (const f of frames) {
        expect(f.caption.length).toBeGreaterThan(10);
        if (f.line !== undefined) expect(f.line).toBeLessThan(IO_CODE[mode].length);
        expect(`${f.state.maxLines},${f.state.maxTokens},${f.state.maxWrites},${f.state.maxValues}`).toBe(size);
        expect(f.state.values.length).toBeLessThanOrEqual(f.state.maxValues);
        for (const sp of f.state.spans) {
          const line = f.state.lines[sp.line];
          expect(sp.c2).toBeLessThan(line.bytes.length);
          for (let c = sp.c1; c <= sp.c2; c++) expect(/\s/.test(line.bytes[c].ch)).toBe(false);
        }
        expect(f.state.counters[0].value).toBeLessThanOrEqual(run.calls.length);
      }
    }
  });

  it('reads line by line with one call per line, and all at once with one call', () => {
    const stdin = parseIo('2 / 3 / 1 2 3 / 2 / 10 20').stdin;
    expect(stdin).toBe('2\n3\n1 2 3\n2\n10 20\n');
    const lines = ioTrace('lines', { stdin });
    expect(lines.calls.map((c) => c[0])).toEqual(['readline', 'readline', 'readline', 'readline', 'readline']);
    expect(lines.writes).toEqual(['6\n', '30\n']);
    const buffered = ioTrace('buffered', { stdin });
    expect(buffered.calls).toEqual([['read', stdin]]);
    expect(buffered.writes).toEqual(['6\n30\n']);
    // The window covers one line for readline and every byte for read().
    const firstLine = lines.frames.find((f) => f.state.window)!.state.window!;
    expect([firstLine.from, firstLine.to]).toEqual([
      [0, 0],
      [0, 1],
    ]);
    const all = buffered.frames.find((f) => f.state.window)!.state.window!;
    expect([all.from, all.to]).toEqual([
      [0, 0],
      [4, 5],
    ]);
  });

  it('shows what each reader does at the end of the input', () => {
    expect(ioTrace('lines', parseIo('empty')).error).toEqual(['ValueError', "invalid literal for int() with base 10: ''"]);
    expect(ioTrace('buffered', parseIo('empty')).error).toEqual(['IndexError', 'list index out of range']);
    expect(ioTrace('all', parseIo('')).error).toEqual(['IndexError', 'list index out of range']);
    // Answers that wait in BufferedOutput are lost when the program stops before flush().
    const run = ioTrace('buffered', parseIo('3 / 1 / 5'));
    expect(run.writes).toEqual([]);
    expect(run.frames[run.frames.length - 1].caption).toMatch(/never written/);
    // The line reader already printed the first answer.
    expect(ioTrace('lines', parseIo('3 / 1 / 5')).writes).toEqual(['5\n']);
  });

  it('copies Python: int() and repr', () => {
    expect(pyInt(' 3 \n')).toBe(3);
    expect(pyInt('+5')).toBe(5);
    expect(pyInt('-0')).toBe(0);
    expect(() => pyInt('3 4\n')).toThrow(/invalid literal for int\(\) with base 10: '3 4\\n'/);
    expect(pyRepr('a\nb')).toBe("'a\\nb'");
  });

  it('parses lines separated by "/", with friendly errors', () => {
    expect(parseIo('1 / / 2').stdin).toBe('1\n\n2\n');
    expect(parseIo('empty').stdin).toBe('');
    expect(formatIo('1\n\n2\n')).toBe('1 /  / 2');
    expect(() => parseIo(Array.from({ length: 13 }, () => '1').join(' / '))).toThrow(/Up to 12 lines/);
    expect(() => parseIo('1 2 3 4 5 6 7 8 9 10 11')).toThrow(/bytes/);
    expect(() => parseIo('1; 2')).toThrow(/digits, signs/);
    expect(() => parseIo('1234567890')).toThrow(/longer than 9/);
  });
});
