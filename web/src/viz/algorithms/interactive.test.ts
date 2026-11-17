import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { InputError, type Frame } from '../core/types';
import { bitLength, defaultLimit, JUDGE_CODE, judgeTrace, parseJudge, type JudgeMode, type JudgeState } from './interactive';

const fixtures = JSON.parse(readFileSync(new URL('./__fixtures__/mathAndProblemTypes.json', import.meta.url), 'utf8'));

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

/** Every frame's problems, collected in plain code and asserted once: thousands of expect calls are slow. */
function expectFrames(frames: Array<Frame<JudgeState>>, mode: JudgeMode) {
  expect(frames.length).toBeGreaterThan(0);
  const problems: string[] = [];
  let used = 0;
  frames.forEach((f, i) => {
    const bad = (what: string) => problems.push(`frame ${i}: ${what}`);
    if (f.caption.length <= 10) bad('caption too short');
    if (f.line !== undefined && (f.line < 0 || f.line >= JUDGE_CODE[mode].length)) bad(`line ${f.line} out of range`);
    // The budget only grows, and the transcript alternates query / reply.
    if (f.state.used < used) bad(`queries went down from ${used} to ${f.state.used}`);
    used = f.state.used;
    const replies = f.state.transcript.filter((l) => l.who === 'judge').length;
    const lines = f.state.transcript.filter((l) => l.who === 'solver').length;
    if (replies > lines) bad(`${replies} replies to ${lines} lines`);
  });
  expect(problems).toEqual([]);
}

const verdict = (frames: Array<Frame<JudgeState>>) => frames[frames.length - 1].state.status;

describe('guess_number against a judge', () => {
  it('finds every secret within floor(log2 n) queries, the default limit', () => {
    for (let n = 1; n <= 70; n++) {
      for (let secret = 1; secret <= n; secret++) {
        const run = judgeTrace({ n, secret, values: [], limit: defaultLimit('guess', n) }, 'guess');
        expectFrames(run.frames, 'guess');
        expect(run.error).toBeNull();
        expect(run.queries).toBeLessThanOrEqual(bitLength(n) - 1);
        const last = run.transcript[run.transcript.length - 1].text;
        expect(last === `! ${secret}` || last === 'correct', `${n} ${secret}: ${last}`).toBe(true);
        expect(verdict(run.frames)).toBe('good');
      }
    }
    // The bound is tight: some secret needs every query.
    for (const n of [2, 10, 100, 1000]) {
      const most = Math.max(...Array.from({ length: n }, (_, k) => judgeTrace({ n, secret: k + 1, values: [], limit: 99 }, 'guess').queries));
      expect(most).toBe(defaultLimit('guess', n));
    }
  });

  it('the article trace: 5 higher, 8 lower, 6 higher, then ! 7', () => {
    const run = judgeTrace(parseJudge('n 10; secret 7', 'guess'), 'guess');
    expect(run.transcript.map((l) => l.text)).toEqual(['? 5', 'higher', '? 8', 'lower', '? 6', 'higher', '! 7']);
    const after = run.frames.filter((f) => f.line === 7 || f.line === 8).map((f) => [f.state.range!.lo, f.state.range!.hi]);
    expect(after).toEqual([
      [6, 10],
      [6, 7],
      [7, 7],
    ]);
  });

  it('past the limit the judge replies -1, the code reads it as "lower", and the next read is EOFError', () => {
    const run = judgeTrace(parseJudge('n 100; secret 1; limit 4', 'guess'), 'guess');
    expect(run.error).toBe('EOFError');
    expect(run.transcript.slice(-3).map((l) => l.text)).toEqual(['? 3', '-1', '? 1']);
    expect(verdict(run.frames)).toBe('bad');
  });
});

describe('find_maximum and tournament against a judge', () => {
  it('return an index of a maximum in n - 1 comparisons; ties go left in the scan and right in the tournament', () => {
    const rand = rng(71);
    for (let t = 0; t < 200; t++) {
      const values = Array.from({ length: 1 + Math.floor(rand() * 16) }, () => Math.floor(rand() * 8));
      const best = Math.max(...values);
      for (const mode of ['maximum', 'tournament'] as const) {
        const run = judgeTrace({ n: values.length, secret: 0, values, limit: values.length - 1 }, mode);
        expectFrames(run.frames, mode);
        expect(values[run.result! - 1]).toBe(best);
        expect(run.queries).toBe(values.length - 1);
        expect(verdict(run.frames)).toBe('good');
        if (mode === 'maximum') expect(run.result).toBe(values.indexOf(best) + 1);
      }
    }
    expect(judgeTrace(parseJudge('values 3 9 2 9 5', 'maximum'), 'maximum').result).toBe(2);
    expect(judgeTrace(parseJudge('values 3 9 2 9 5', 'tournament'), 'tournament').result).toBe(4);
  });

  it('draws the tournament as rounds that halve, with byes for an odd count', () => {
    const run = judgeTrace(parseJudge('values 5 1 8 3 9 2 7', 'tournament'), 'tournament');
    const rounds = run.frames[run.frames.length - 1].state.rounds!;
    expect(rounds.map((r) => r.map((c) => c.index))).toEqual([[1, 2, 3, 4, 5, 6, 7], [1, 3, 5, 7], [3, 5], [5]]);
    // Seven candidates: 7 gets a bye in the first round, then 4 and 2 pair up evenly.
    expect(run.frames.filter((f) => f.line === 9).map((f) => f.caption)).toEqual(['Candidate 7 has no partner in this round: a bye, no query.']);
  });

  it('a limit below n - 1 ends in -1 and EOFError or a wrong answer', () => {
    for (const mode of ['maximum', 'tournament'] as const) {
      const run = judgeTrace(parseJudge('values 4 1 7 3; limit 2', mode), mode);
      expect(run.transcript.some((l) => l.text === '-1')).toBe(true);
      expect(verdict(run.frames)).toBe('bad');
    }
  });

  it('find_maximum marks a tie apart from a beaten value, until a larger value beats both', () => {
    const notes = (text: string) => {
      const run = judgeTrace(parseJudge(text, 'maximum'), 'maximum');
      return run.frames[run.frames.length - 1].state.cells!.map((c) => c.note ?? '');
    };
    expect(notes('values 3 9 2 9 5')).toEqual(['beaten', 'max', 'beaten', 'tie', 'beaten']);
    expect(notes('values 9 9 10')).toEqual(['beaten', 'beaten', 'max']);
  });

  it("a comparison's own -1 is an answer; only the reply past the limit is called the judge's error", () => {
    const overLimit = (run: ReturnType<typeof judgeTrace>) => run.frames.filter((f) => f.caption.includes('one more than the limit')).length;
    for (const mode of ['maximum', 'tournament'] as const) {
      const ok = judgeTrace(parseJudge('values 3 9 2 9 5', mode), mode);
      expect(ok.transcript.some((l) => l.who === 'judge' && l.text === '-1')).toBe(true);
      expect(overLimit(ok)).toBe(0);
      const over = judgeTrace(parseJudge('values 4 1 7 3; limit 2', mode), mode);
      expect(overLimit(over)).toBe(1);
      expect(over.transcript.filter((l) => l.error)).toHaveLength(1);
    }
  });
});

describe('binary_subset_search against a judge', () => {
  it('reads the hidden number in n.bit_length() queries', () => {
    for (let n = 0; n <= 70; n++) {
      for (let secret = 0; secret <= n; secret++) {
        const run = judgeTrace({ n, secret, values: [], limit: bitLength(n) }, 'bits');
        expectFrames(run.frames, 'bits');
        expect(run.result).toBe(secret);
        expect(run.queries).toBe(bitLength(n));
        expect(verdict(run.frames)).toBe('good');
      }
    }
  });

  it('past the limit -1 is truthy, so the bit is set, then EOFError', () => {
    const run = judgeTrace(parseJudge('n 20; secret 4; limit 2', 'bits'), 'bits');
    expect(run.error).toBe('EOFError');
    expect(run.transcript.map((l) => l.text)).toEqual(['? 1', '0', '? 2', '0', '? 4', '-1', '? 8']);
  });
});

describe('the judge matches the Python functions with a scripted judge (golden fixtures)', () => {
  type Case = { mode: JudgeMode; n: number; secret: number; values: number[]; limit: number; transcript: Array<[string, string]>; result: number | null; error: string | null };
  const list = fixtures.judge as Case[];

  it('has cases for every strategy', () => {
    for (const mode of ['guess', 'maximum', 'tournament', 'bits']) expect(list.filter((c) => c.mode === mode).length).toBeGreaterThanOrEqual(25);
  });

  it('reproduces every transcript line, return value and error', () => {
    for (const c of list) {
      const run = judgeTrace({ n: c.n, secret: c.secret, values: c.values, limit: c.limit }, c.mode);
      const label = `${c.mode} n=${c.n} secret=${c.secret} values=${c.values.join(',')} limit=${c.limit}`;
      expect(run.transcript.map((l) => [l.who, l.text]), label).toEqual(c.transcript);
      expect(run.result, label).toBe(c.result);
      expect(run.error, label).toBe(c.error);
    }
  });
});

describe('parseJudge', () => {
  it('reads the hidden input and the limit, with the strategy worst case as the default limit', () => {
    expect(parseJudge('n 10; secret 7', 'guess')).toEqual({ n: 10, secret: 7, values: [], limit: 3 });
    expect(parseJudge('n 10, secret 7, limit 5', 'guess').limit).toBe(5);
    expect(parseJudge('values 3 9 2 9 5', 'maximum')).toEqual({ n: 5, secret: 0, values: [3, 9, 2, 9, 5], limit: 4 });
    expect(parseJudge('n 20; secret 13', 'bits').limit).toBe(5);
    expect(parseJudge('n 0; secret 0', 'bits').limit).toBe(0);
  });

  it('gives friendly errors', () => {
    expect(() => parseJudge('n 10', 'guess')).toThrow(InputError);
    expect(() => parseJudge('n 10; secret 11', 'guess')).toThrow(/1\.\.10/);
    expect(() => parseJudge('n 10; secret 0', 'guess')).toThrow(/1\.\.10/);
    expect(() => parseJudge('values', 'maximum')).toThrow(/hidden values/);
    expect(() => parseJudge(`values ${Array(17).fill(1).join(' ')}`, 'tournament')).toThrow(/16/);
    expect(() => parseJudge('n 2000000000; secret 1', 'bits')).toThrow(/10{9}|1000000000/);
    expect(() => parseJudge('secret 3; n 5; banana', 'guess')).toThrow(/Cannot read/);
  });
});
