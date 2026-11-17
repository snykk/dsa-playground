/**
 * Interactive problem tracers, drawn with JudgeView: a simulated judge holds the hidden input the
 * reader sets, answers every query, and enforces a query limit.
 *
 * Mirrors four strategies of Utilities/Problem_Types/Interactive_Problems/Python/interactive.py:
 *   'guess'      guess_number(n): binary search, the judge replies higher / lower / correct; the
 *                code prints "! lo" once one value is left, and returns at once on "correct".
 *   'maximum'    find_maximum(n): compare each index with the best so far ("? i j" -> 1, 0, -1);
 *                a tie keeps the earlier index.
 *   'tournament' tournament(n): compare neighbours in rounds, the odd one out gets a bye; a tie
 *                sends the right-hand candidate on.
 *   'bits'       binary_subset_search(n): ask "? 2^b" for each bit b of n.bit_length(); the
 *                judge says whether the hidden number has that bit.
 * The judge: past the limit it replies -1 and closes the stream. The code never checks for -1
 * (check_response() is the helper that would), so it reads -1 like any other reply, and its next
 * input() raises EOFError. Golden fixtures (__fixtures__/mathAndProblemTypes.json) pin every line
 * of every transcript, the return values and the errors, recorded from the Python functions with
 * a scripted judge in place of print and input.
 */
import { InputError, type Frame, type Role } from '../core/types';

export type JudgeMode = 'guess' | 'maximum' | 'tournament' | 'bits';

export interface JudgeInput {
  n: number;
  /** guess, bits: the hidden number. */
  secret: number;
  /** maximum, tournament: the hidden values a[1..n]. */
  values: number[];
  /** Queries the judge answers; one more gets -1. */
  limit: number;
}

export const JUDGE_LIMITS = { maxN: 1000000000, maxValues: 16, maxValue: 99 };

/** n.bit_length() for n >= 0. */
export const bitLength = (n: number) => (n === 0 ? 0 : Math.floor(Math.log2(n)) + 1);

/** The query count each strategy needs in the worst case, the default limit. */
export function defaultLimit(mode: JudgeMode, n: number): number {
  if (mode === 'guess') return Math.max(0, bitLength(n) - 1);
  if (mode === 'bits') return bitLength(n);
  return Math.max(0, n - 1);
}

/* ---------- input ---------- */

/** "n 10, secret 7, limit 3" (guess, bits) or "values 3 9 2 9 5, limit 4" (maximum, tournament). */
export function parseJudge(text: string, mode: JudgeMode): JudgeInput {
  let n: number | undefined;
  let secret: number | undefined;
  let values: number[] | undefined;
  let limit: number | undefined;
  for (const seg of text.split(/[;\n]|,(?=\s*[a-z])/i).map((s) => s.trim()).filter(Boolean)) {
    let m: RegExpMatchArray | null;
    if ((m = seg.match(/^n\s*[:=]?\s*(\d+)$/i))) n = Number(m[1]);
    else if ((m = seg.match(/^(?:secret|hidden|x)\s*[:=]?\s*(-?\d+)$/i))) secret = Number(m[1]);
    else if ((m = seg.match(/^limit\s*[:=]?\s*(\d+)$/i))) limit = Number(m[1]);
    else if ((m = seg.match(/^(?:values?|a)\s*[:=]?\s*(.*)$/i))) {
      values = m[1]
        .replace(/[[\]]/g, ' ')
        .split(/[\s,]+/)
        .filter(Boolean)
        .map((t) => {
          if (!/^-?\d+$/.test(t)) throw new InputError(`Values: "${t}" is not a whole number.`);
          const v = Number(t) + 0;
          if (Math.abs(v) > JUDGE_LIMITS.maxValue) throw new InputError(`Values go from -${JUDGE_LIMITS.maxValue} to ${JUDGE_LIMITS.maxValue} here (got ${t}).`);
          return v;
        });
    } else {
      throw new InputError(
        mode === 'maximum' || mode === 'tournament'
          ? `Cannot read "${seg}". Write the hidden values, "values 3 9 2 9 5", optionally with "; limit 4".`
          : `Cannot read "${seg}". Write "n 10; secret 7", optionally with "; limit 3".`,
      );
    }
  }
  if (mode === 'maximum' || mode === 'tournament') {
    if (!values || values.length === 0) throw new InputError('Give the hidden values a[1..n], e.g. "values 3 9 2 9 5".');
    if (values.length > JUDGE_LIMITS.maxValues) throw new InputError(`At most ${JUDGE_LIMITS.maxValues} values here (got ${values.length}).`);
    n = values.length;
    secret = 0;
  } else {
    if (n === undefined) throw new InputError('Give n, e.g. "n 10; secret 7".');
    const lo = mode === 'guess' ? 1 : 0;
    if (n < lo || n > JUDGE_LIMITS.maxN) throw new InputError(`n goes from ${lo} to ${JUDGE_LIMITS.maxN} here (got ${n}).`);
    if (secret === undefined) throw new InputError(`Give the hidden number the judge holds, e.g. "secret 7" (${lo}..${n}).`);
    if (secret < lo || secret > n) throw new InputError(`The secret must be in ${lo}..${n}, the range the code searches (got ${secret}).`);
    values = [];
  }
  const dflt = defaultLimit(mode, n);
  if (limit !== undefined && limit > 99) throw new InputError('The limit goes up to 99 here.');
  return { n, secret, values, limit: limit ?? dflt };
}

/* ---------- pseudocode ---------- */

export const JUDGE_CODE: Record<JudgeMode, string[]> = {
  guess: [
    'def guess_number(n):',
    '    lo, hi = 1, n',
    '    while lo < hi:',
    '        mid = (lo + hi) // 2',
    '        print(f"? {mid}", flush=True)',
    '        response = input().strip()',
    '        if response == "correct": return',
    '        elif response == "higher": lo = mid + 1',
    '        else: hi = mid - 1                  # "lower"',
    '    print(f"! {lo}", flush=True)',
  ],
  maximum: [
    'def find_maximum(n):',
    '    def compare(i, j):                     # 1 if a[i] > a[j], 0 if equal, -1 if less',
    '        print(f"? {i} {j}", flush=True)',
    '        return int(input())',
    '    max_idx = 1',
    '    for i in range(2, n + 1):',
    '        if compare(i, max_idx) > 0:',
    '            max_idx = i',
    '    print(f"! {max_idx}", flush=True)',
    '    return max_idx',
  ],
  tournament: [
    'def tournament(n):',
    '    candidates = list(range(1, n + 1))',
    '    while len(candidates) > 1:',
    '        next_round = []',
    '        for i in range(0, len(candidates), 2):',
    '            if i + 1 < len(candidates):',
    '                winner = candidates[i] if compare(candidates[i], candidates[i+1]) > 0 else candidates[i+1]',
    '                next_round.append(winner)',
    '            else:',
    '                next_round.append(candidates[i])     # a bye',
    '        candidates = next_round',
    '    print(f"! {candidates[0]}", flush=True)',
    '    return candidates[0]',
  ],
  bits: [
    'def binary_subset_search(n):',
    '    def query_mask(mask):                  # is (hidden & mask) non-zero?',
    '        print(f"? {mask}", flush=True)',
    '        return int(input())',
    '    result = 0',
    '    for bit in range(n.bit_length()):',
    '        if query_mask(1 << bit):',
    '            result |= (1 << bit)',
    '    print(f"! {result}", flush=True)',
    '    return result',
  ],
};

/* ---------- frames ---------- */

export interface JudgeLine {
  who: 'solver' | 'judge';
  text: string;
  /** The -1 the judge sends past the limit (not a comparison's -1). */
  error?: boolean;
}

export interface JudgeCellView {
  index: number;
  value: number;
  role: Role;
  /** A short note under the cell: "max", "beaten". */
  note?: string;
}

export interface JudgeState {
  mode: JudgeMode;
  transcript: JudgeLine[];
  used: number;
  limit: number;
  /** guess: the search interval over 1..n. */
  range?: { n: number; lo: number; hi: number; mid: number | null; secret: number };
  /** maximum: the hidden array; tournament: the hidden array under the bracket. */
  cells?: JudgeCellView[];
  /** tournament: the candidates of every round so far. */
  rounds?: Array<Array<{ index: number; role: Role }>>;
  /** bits: what is known of the hidden number, bit by bit (lowest bit on the right). */
  bits?: { width: number; result: number; current: number | null; secret: number; asked: number };
  status?: 'good' | 'bad';
}

export interface JudgeRun {
  frames: Array<Frame<JudgeState>>;
  /** Every line both sides wrote, in order. */
  transcript: JudgeLine[];
  /** The return value: guess_number returns None (null). */
  result: number | null;
  /** "EOFError" when the code reads after the judge has closed the stream. */
  error: string | null;
  queries: number;
}

class JudgeClosed extends Error {}

export function judgeTrace(input: JudgeInput, mode: JudgeMode): JudgeRun {
  const { n, secret, values, limit } = input;
  const frames: Array<Frame<JudgeState>> = [];
  const transcript: JudgeLine[] = [];
  let used = 0;
  let closed = false;
  let pending: string | null = null;
  const view: Partial<JudgeState> = {};

  const snap = (line: number | undefined, caption: string, status?: 'good' | 'bad') => {
    frames.push({
      line,
      caption,
      vars: [
        ['queries', `${used} of ${limit}`],
        ...((mode === 'guess' && view.range ? [['interval', `[${view.range.lo}, ${view.range.hi}]`]] : []) as Array<[string, string]>),
      ],
      state: {
        mode,
        transcript: transcript.map((l) => ({ ...l })),
        used,
        limit,
        range: view.range && { ...view.range },
        cells: view.cells?.map((c) => ({ ...c })),
        rounds: view.rounds?.map((r) => r.map((c) => ({ ...c }))),
        bits: view.bits && { ...view.bits },
        status,
      },
    });
  };

  /** print(...): one line to the judge, which answers queries (and closes after the limit). */
  const send = (text: string) => {
    transcript.push({ who: 'solver', text });
    if (closed || !text.startsWith('?')) return;
    used += 1;
    let reply: string;
    if (used > limit) {
      reply = '-1';
      closed = true;
    } else if (mode === 'guess') {
      const mid = Number(text.slice(2));
      reply = mid === secret ? 'correct' : secret > mid ? 'higher' : 'lower';
    } else if (mode === 'bits') {
      reply = (secret & Number(text.slice(2))) !== 0 ? '1' : '0';
    } else {
      const [i, j] = text.slice(2).split(' ').map(Number);
      const a = values[i - 1];
      const b = values[j - 1];
      reply = String(Number(a > b) - Number(a < b));
    }
    pending = reply;
  };
  /** input(): the judge's reply, or EOFError once the judge has gone. */
  const receive = (): string => {
    if (pending === null) throw new JudgeClosed();
    const r = pending;
    pending = null;
    transcript.push(closed ? { who: 'judge', text: r, error: true } : { who: 'judge', text: r });
    return r;
  };
  const eof = (line: number, what: string) => {
    snap(line, `${what} input() finds the stream closed and raises EOFError: the judge stopped reading after it replied -1. The verdict is Wrong Answer (query limit exceeded).`, 'bad');
    return { frames, transcript, result: null, error: 'EOFError', queries: used };
  };
  /** Said once, on the reply that went past the limit (a comparison's own -1 is a normal answer). */
  const overNote = () =>
    closed ? ` That was query ${used}, one more than the limit of ${limit}: the judge replies -1 and closes the stream. The code does not check for -1 (check_response() would), so it carries on.` : '';

  /* ----- guess_number ----- */
  if (mode === 'guess') {
    let lo = 1;
    let hi = n;
    view.range = { n, lo, hi, mid: null, secret };
    snap(1, `guess_number(${n}): the judge holds a secret in 1..${n}. Binary search needs at most floor(log2 ${n}) = ${defaultLimit('guess', n)} queries, because each reply leaves at most half of the interval; the judge allows ${limit}.`);
    try {
      while (lo < hi) {
        const mid = Math.floor((lo + hi) / 2);
        view.range = { n, lo, hi, mid, secret };
        send(`? ${mid}`);
        snap(4, `mid = (${lo} + ${hi}) // 2 = ${mid}: print "? ${mid}" and flush, or the judge never sees it.`);
        const response = receive().trim();
        if (response === 'correct') {
          snap(6, `The judge replies "correct": ${mid} is the secret. guess_number returns at once without printing "! ${mid}", because in this protocol the judge ends the game itself. ${used} quer${used === 1 ? 'y' : 'ies'}.`, 'good');
          return { frames, transcript, result: null, error: null, queries: used };
        }
        if (response === 'higher') {
          lo = mid + 1;
          view.range = { n, lo, hi, mid, secret };
          snap(7, `"higher": the secret is above ${mid}, so ${mid} and everything below it are ruled out: lo = ${lo}. ${hi - lo + 1} value${hi - lo + 1 === 1 ? '' : 's'} left.`);
        } else {
          hi = mid - 1;
          view.range = { n, lo, hi, mid, secret };
          snap(
            8,
            response === 'lower'
              ? `"lower": the secret is below ${mid}, so ${mid} and everything above it are ruled out: hi = ${hi}. ${Math.max(0, hi - lo + 1)} value${hi - lo + 1 === 1 ? '' : 's'} left.`
              : `The judge replies "${response}".${overNote()} The reply is neither "correct" nor "higher", so the else branch treats it as "lower": hi = ${hi}.`,
          );
        }
      }
      view.range = { n, lo, hi, mid: null, secret };
      send(`! ${lo}`);
      const ok = !closed && lo === secret;
      snap(
        9,
        closed
          ? `The loop ends and the code prints "! ${lo}", but the judge stopped reading after its -1: Wrong Answer (query limit exceeded).`
          : `lo = hi = ${lo}: one value is left, so print "! ${lo}" without another query. ${ok ? `Correct, in ${used} quer${used === 1 ? 'y' : 'ies'} of the ${limit} allowed.` : 'Wrong answer.'}`,
        ok ? 'good' : 'bad',
      );
      return { frames, transcript, result: null, error: null, queries: used };
    } catch (e) {
      if (e instanceof JudgeClosed) return eof(5, `print("? ...") went nowhere, and`);
      throw e;
    }
  }

  /* ----- find_maximum ----- */
  if (mode === 'maximum') {
    let maxIdx = 1;
    const beaten = new Set<number>();
    /** Indexes that tied with the best so far: not larger, so they stay out, but not beaten either. */
    const tied = new Set<number>();
    const cells = (hl: Record<number, Role> = {}): JudgeCellView[] =>
      values.map((v, k) => ({
        index: k + 1,
        value: v,
        role: hl[k + 1] ?? (k + 1 === maxIdx ? 'active' : beaten.has(k + 1) ? 'muted' : 'idle'),
        note: k + 1 === maxIdx ? 'max' : tied.has(k + 1) ? 'tie' : beaten.has(k + 1) ? 'beaten' : undefined,
      }));
    view.cells = cells();
    snap(4, `find_maximum(${n}): the judge hides a[1..${n}]; the code can only ask "? i j", which a[i] > a[j] answers with 1, a tie with 0 and a smaller value with -1. Start with max_idx = 1. ${n - 1} comparisons will be needed; the judge allows ${limit}.`);
    try {
      for (let i = 2; i <= n; i++) {
        view.cells = cells({ [i]: 'compare', [maxIdx]: 'active' });
        send(`? ${i} ${maxIdx}`);
        snap(2, `Compare a[${i}] with the best so far, a[${maxIdx}]: print "? ${i} ${maxIdx}" and flush.`);
        const r = Number(receive());
        if (r > 0) {
          const old = maxIdx;
          maxIdx = i;
          beaten.add(old);
          tied.clear(); // what tied with the old best is now beaten too
          view.cells = cells();
          snap(7, `The judge replies 1: a[${i}] > a[${old}], so max_idx = ${i}.`);
        } else {
          beaten.add(i);
          if (r === 0 && !closed) tied.add(i);
          view.cells = cells();
          snap(
            6,
            closed
              ? `The judge replies -1.${overNote()} compare() returns -1, which is not > 0, so the code reads it as "a[${i}] is smaller": max_idx stays ${maxIdx}.`
              : `The judge replies ${r}: ${r === 0 ? `a tie, and only a strictly larger value replaces the best, so max_idx stays ${maxIdx}` : `a[${i}] is smaller, so max_idx stays ${maxIdx}`}.`,
          );
        }
      }
      send(`! ${maxIdx}`);
      const best = Math.max(...values);
      const ok = !closed && values[maxIdx - 1] === best;
      view.cells = cells({ [maxIdx]: ok ? 'good' : 'bad' });
      snap(
        8,
        closed
          ? `print "! ${maxIdx}", but the judge stopped reading after its -1: Wrong Answer (query limit exceeded).`
          : `Every index has met the best so far: print "! ${maxIdx}" (a[${maxIdx}] = ${values[maxIdx - 1]}). ${n - 1} comparisons, and no method can use fewer: each one rules out at most one candidate.`,
        ok ? 'good' : 'bad',
      );
      return { frames, transcript, result: maxIdx, error: null, queries: used };
    } catch (e) {
      if (e instanceof JudgeClosed) return eof(3, `The query went nowhere, and`);
      throw e;
    }
  }

  /* ----- tournament ----- */
  if (mode === 'tournament') {
    let candidates = Array.from({ length: n }, (_, k) => k + 1);
    const rounds: Array<Array<{ index: number; role: Role }>> = [candidates.map((c) => ({ index: c, role: 'idle' as Role }))];
    const out = new Set<number>();
    const syncCells = (hl: Record<number, Role> = {}) => {
      view.cells = values.map((v, k) => ({ index: k + 1, value: v, role: hl[k + 1] ?? (out.has(k + 1) ? 'muted' : 'idle') }));
    };
    view.rounds = rounds;
    syncCells();
    snap(1, `tournament(${n}): every index is a candidate. Each round compares neighbours and sends the larger on (the odd one out gets a bye), so the rounds halve the field: ${n - 1} comparisons in about log2(${n}) rounds. The judge allows ${limit}.`);
    try {
      while (candidates.length > 1) {
        const next: number[] = [];
        const row: Array<{ index: number; role: Role }> = [];
        rounds.push(row);
        for (let i = 0; i < candidates.length; i += 2) {
          if (i + 1 < candidates.length) {
            const a = candidates[i];
            const b = candidates[i + 1];
            const prev = rounds[rounds.length - 2];
            prev.forEach((c) => (c.role = c.index === a || c.index === b ? 'compare' : c.role === 'compare' ? 'idle' : c.role));
            syncCells({ [a]: 'compare', [b]: 'compare' });
            send(`? ${a} ${b}`);
            snap(6, `Round ${rounds.length - 1}: compare candidates ${a} and ${b}: print "? ${a} ${b}".`);
            const r = Number(receive());
            const winner = r > 0 ? a : b;
            const loser = winner === a ? b : a;
            next.push(winner);
            out.add(loser);
            row.push({ index: winner, role: 'active' });
            prev.forEach((c) => (c.role = c.index === winner ? 'done' : c.index === loser ? 'muted' : c.role));
            syncCells({ [winner]: 'active' });
            snap(
              7,
              closed
                ? `The judge replies -1.${overNote()} compare() returns -1, which is not > 0, so the code sends ${b} on.`
                : r > 0
                  ? `The judge replies 1: a[${a}] > a[${b}], so ${a} goes on.`
                  : r === 0
                    ? `The judge replies 0, a tie: "> 0" fails, so the right-hand candidate ${b} goes on.`
                    : `The judge replies -1: a[${a}] is smaller, so ${b} goes on.`,
            );
            row[row.length - 1].role = 'idle';
          } else {
            const c = candidates[i];
            next.push(c);
            row.push({ index: c, role: 'active' });
            const prev = rounds[rounds.length - 2];
            prev.forEach((x) => (x.role = x.index === c ? 'done' : x.role === 'compare' ? 'idle' : x.role));
            syncCells({ [c]: 'active' });
            snap(9, `Candidate ${c} has no partner in this round: a bye, no query.`);
            row[row.length - 1].role = 'idle';
          }
        }
        candidates = next;
      }
      send(`! ${candidates[0]}`);
      const w = candidates[0];
      const ok = !closed && values[w - 1] === Math.max(...values);
      rounds[rounds.length - 1].forEach((c) => (c.role = ok ? 'good' : 'bad'));
      syncCells({ [w]: ok ? 'good' : 'bad' });
      snap(
        11,
        closed
          ? `print "! ${w}", but the judge stopped reading after its -1: Wrong Answer (query limit exceeded).`
          : `One candidate is left: print "! ${w}" (a[${w}] = ${values[w - 1]}). ${used} comparisons in ${rounds.length - 1} round${rounds.length - 1 === 1 ? '' : 's'}; the comparisons of one round are independent, so a judge that allows batching could take each round at once.`,
        ok ? 'good' : 'bad',
      );
      return { frames, transcript, result: w, error: null, queries: used };
    } catch (e) {
      if (e instanceof JudgeClosed) return eof(6, `The query went nowhere, and`);
      throw e;
    }
  }

  /* ----- binary_subset_search ----- */
  const width = Math.max(1, bitLength(n));
  let result = 0;
  view.bits = { width, result, current: null, secret, asked: 0 };
  snap(4, `binary_subset_search(${n}): the hidden number is in 0..${n}, which has ${bitLength(n)} bit${bitLength(n) === 1 ? '' : 's'} (n.bit_length()). One query per bit: "is (hidden AND 2^b) non-zero?" The judge allows ${limit}.`);
  try {
    for (let bit = 0; bit < bitLength(n); bit++) {
      view.bits = { width, result, current: bit, secret, asked: bit };
      send(`? ${2 ** bit}`);
      snap(2, `Bit ${bit}: print "? ${2 ** bit}" (the mask 1 << ${bit}).`);
      const r = Number(receive());
      if (r) {
        result += 2 ** bit;
        view.bits = { width, result, current: bit, secret, asked: bit + 1 };
        snap(
          7,
          closed
            ? `The judge replies -1.${overNote()} -1 is truthy in Python, so the code takes bit ${bit} as set: result |= ${2 ** bit} -> ${result}.`
            : `The judge replies 1: bit ${bit} is set, result |= ${2 ** bit} -> ${result}.`,
        );
      } else {
        view.bits = { width, result, current: bit, secret, asked: bit + 1 };
        snap(6, `The judge replies 0: bit ${bit} is not set; result stays ${result}.`);
      }
    }
    view.bits = { width, result, current: null, secret, asked: bitLength(n) };
    send(`! ${result}`);
    const ok = !closed && result === secret;
    snap(
      8,
      closed
        ? `print "! ${result}", but the judge stopped reading after its -1: Wrong Answer (query limit exceeded).`
        : `Every bit is known: print "! ${result}". ${bitLength(n)} queries, one per bit of n, whatever the hidden number is.${n === 0 ? ' With n = 0 there is no bit to ask: the answer 0 needs no query.' : ''}`,
      ok ? 'good' : 'bad',
    );
    return { frames, transcript, result, error: null, queries: used };
  } catch (e) {
    if (e instanceof JudgeClosed) return eof(3, `The query went nowhere, and`);
    throw e;
  }
}
