/**
 * Fast I/O tracers: the same program read three ways, counting calls into sys.stdin and sys.stdout.
 * The program is "t test cases, each a count n and n numbers; print each sum".
 *
 * Mirrors Utilities/Optimization_Techniques/Fast_IO/Python/fast_io.py:
 *   'lines'     main() with its multi-test lines (t = fast_int(); for _ in range(t): solve()) and
 *               solve(): n = fast_int(); a = fast_ints(); fast_print(sum(a)). fast_int is
 *               int(sys.stdin.readline()), fast_ints is list(map(int, readline().split())), and
 *               fast_print is one sys.stdout.write per call. One readline per line: at the end of
 *               the input it returns '', and int('') raises ValueError.
 *   'buffered'  BufferedInput and BufferedOutput, one test case per round as in demo_buffered_io:
 *               the constructor makes ONE sys.stdin.read() call (buffer_size is accepted and
 *               ignored) and splits it into tokens; next_int is int(self.buffer[self.index]) and
 *               raises IndexError once the tokens run out; write() appends to a list and flush()
 *               makes ONE sys.stdout.write call.
 *   'all'       demo_all_at_once with AllInputReader: list(map(int, sys.stdin.read().split())) up
 *               front, next() raises IndexError at the end, next_n(n) is a slice (it clamps, so it
 *               never raises), and the answers go out in one write of '\n'.join(...) + '\n'.
 * An exception stops the program, as it would in Python: what fast_print wrote stays written,
 * and what waits in BufferedOutput is never flushed. Nothing is timed: the calls are counted.
 * Golden fixtures (__fixtures__/optimizationTechniques.json) pin every call with the text it
 * returned or wrote, every value read, the tokens and the exception.
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { IoStreamState, IoTokenView } from '../renderers/IoStream';

export type IoMode = 'lines' | 'buffered' | 'all';

export interface IoInput {
  stdin: string;
}

export const IO_LIMITS = { maxLines: 12, maxLineBytes: 20, maxTokens: 30, maxTokenChars: 9 };

/** "2 / 3 / 1 2 3 / 2 / 10 20": lines separated by "/"; each line ends with a line break. "empty" is no input at all. */
export function parseIo(text: string): IoInput {
  const t = text.trim();
  if (t === '' || /^(empty|eof|nothing)$/i.test(t)) return { stdin: '' };
  const lines = t.split('/').map((l) => l.trim());
  if (lines.length > IO_LIMITS.maxLines) throw new InputError(`Up to ${IO_LIMITS.maxLines} lines, so every byte fits on screen (got ${lines.length}).`);
  let tokens = 0;
  for (const line of lines) {
    if (!/^[A-Za-z0-9+\-. ]*$/.test(line)) throw new InputError(`"${line}": use digits, signs, letters and spaces (a "/" starts a new line).`);
    if (line.length + 1 > IO_LIMITS.maxLineBytes) throw new InputError(`"${line}" is ${line.length + 1} bytes with its line break; up to ${IO_LIMITS.maxLineBytes} per line fit on screen.`);
    for (const tok of line.split(/\s+/).filter(Boolean)) {
      tokens += 1;
      if (tok.length > IO_LIMITS.maxTokenChars) throw new InputError(`"${tok}" is longer than ${IO_LIMITS.maxTokenChars} characters.`);
    }
  }
  if (tokens > IO_LIMITS.maxTokens) throw new InputError(`Up to ${IO_LIMITS.maxTokens} tokens in all (got ${tokens}).`);
  return { stdin: lines.map((l) => `${l}\n`).join('') };
}

/** The input written back in the box's syntax. */
export function formatIo(stdin: string): string {
  if (stdin === '') return 'empty';
  return stdin.replace(/\n$/, '').split('\n').join(' / ');
}

/* ---------- Python semantics ---------- */

/** Python's repr of a str (single quotes; the input alphabet has no quotes or backslashes). */
export function pyRepr(s: string): string {
  return `'${s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/\t/g, '\\t')}'`;
}

class PyError extends Error {
  constructor(
    readonly type: string,
    readonly pyMessage: string,
  ) {
    super(`${type}: ${pyMessage}`);
  }
}

/** int(text) for a str: surrounding whitespace is allowed, then an optional sign and digits. */
export function pyInt(text: string): number {
  const core = text.trim();
  if (!/^[+-]?\d+$/.test(core)) throw new PyError('ValueError', `invalid literal for int() with base 10: ${pyRepr(text)}`);
  const v = Number(core);
  return v === 0 ? 0 : v;
}

export const pySplit = (s: string) => s.split(/\s+/).filter(Boolean);

/* ---------- pseudocode ---------- */

export const IO_CODE: Record<IoMode, string[]> = {
  lines: [
    'main(): t = fast_int()              # int(sys.stdin.readline())',
    '  for _ in range(t): solve()',
    'solve():',
    '  n = fast_int()                    # one readline call: one line',
    '  a = fast_ints()                   # list(map(int, readline().split()))',
    '  ans = sum(a)',
    '  fast_print(ans)                   # one sys.stdout.write call',
  ],
  buffered: [
    'reader = BufferedInput()            # self.buffer = sys.stdin.read().split()',
    'writer = BufferedOutput()           # self.buffer = []',
    't = reader.next_int()               # int(self.buffer[self.index]); index += 1',
    'for _ in range(t):',
    '  n = reader.next_int()',
    '  a = reader.next_ints(n)           # [self.next_int() for _ in range(n)]',
    '  writer.write(sum(a))              # self.buffer.append(str(sum(a)) + "\\n")',
    "writer.flush()                      # sys.stdout.write(''.join(self.buffer))",
  ],
  all: [
    'reader = AllInputReader()           # list(map(int, sys.stdin.read().split()))',
    'output = []',
    't = reader.next()                   # self.data[self.idx]; self.idx += 1',
    'for _ in range(t):',
    '  n = reader.next()',
    '  a = reader.next_n(n)              # self.data[self.idx:self.idx + n]',
    '  output.append(sum(a))',
    "sys.stdout.write('\\n'.join(map(str, output)) + '\\n')",
  ],
};

/* ---------- tracer ---------- */

export type IoCall = [string, string];
export type IoRead = [string, number | number[]];

export interface IoRun {
  frames: Array<Frame<IoStreamState>>;
  /** Every call into sys.stdin: ['readline' | 'read', the text it returned]. */
  calls: IoCall[];
  /** Every value the program read, as [function, value]. */
  reads: IoRead[];
  /** The text of every sys.stdout.write call. */
  writes: string[];
  /** The exception that stopped the program: [type, message], or null. */
  error: [string, string] | null;
  /** 'buffered' only: the token list of BufferedInput. */
  tokens?: string[];
}

interface Span {
  start: number;
  end: number;
}

/** Python's list[i]: a negative index counts from the end; out of range raises IndexError. */
function pyIndex(i: number, len: number): number | null {
  const k = i < 0 ? i + len : i;
  return k < 0 || k >= len ? null : k;
}

/** Python's list[start:stop] bounds: negative values count from the end, then both clamp to the list. */
function pySlice(start: number, stop: number, len: number): [number, number] {
  const norm = (v: number) => (v < 0 ? Math.max(0, v + len) : Math.min(v, len));
  const a = norm(start);
  const b = norm(stop);
  return [a, Math.max(a, b)];
}

const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? '' : 's'}`;

export function ioTrace(mode: IoMode, input: IoInput): IoRun {
  const { stdin } = input;
  const frames: Array<Frame<IoStreamState>> = [];
  const calls: IoCall[] = [];
  const reads: IoRead[] = [];
  const writes: string[] = [];
  let error: [string, string] | null = null;
  let tokens: string[] | undefined;

  // Bytes by line (each line keeps its line break), and the token spans of the whole input.
  const lineStarts: number[] = [];
  for (let i = 0; i < stdin.length; i++) if (i === 0 || stdin[i - 1] === '\n') lineStarts.push(i);
  const lineOf = (i: number) => {
    let l = 0;
    while (l + 1 < lineStarts.length && lineStarts[l + 1] <= i) l++;
    return l;
  };
  const tokenSpans: Span[] = [];
  for (let i = 0; i < stdin.length; ) {
    if (/\s/.test(stdin[i])) {
      i++;
      continue;
    }
    let j = i;
    while (j < stdin.length && !/\s/.test(stdin[j])) j++;
    tokenSpans.push({ start: i, end: j });
    i = j;
  }
  const lineCount = lineStarts.length;
  const tokenCount = tokenSpans.length;

  let pos = 0; // the next byte sys.stdin will return
  let windowSpan: Span | null = null;
  let stdinCalls = 0;
  let stdoutCalls = 0;
  let buffer: IoTokenView[] = [];
  const bufferTitle = mode === 'lines' ? 'the line, split' : mode === 'buffered' ? 'reader.buffer: tokens (str)' : 'reader.data: numbers (int)';
  let bufferIndex: number | null = null;
  const pending: string[] = [];
  const pendingTitle = mode === 'lines' ? '' : mode === 'buffered' ? 'writer.buffer (not written yet)' : 'output (not written yet)';
  const spanRoles = new Map<number, Role>();
  let eofRole: Role | undefined;
  let outputs: IoTokenView[] = [];
  const values: string[] = ['t = ?', 'n = ?', 'a = ?', 'sum(a) = ?'];
  const setValue = (slot: number, text: string) => {
    values[slot] = text;
  };

  const snap = (line: number | undefined, caption: string, extra: { stdout?: boolean; vars?: Array<[string, string | number]> } = {}) => {
    const byteRole = (i: number): Role | undefined => {
      if (windowSpan && i >= windowSpan.start && i < windowSpan.end) return 'compare';
      if (i < pos) return 'muted';
      return undefined;
    };
    const at = (i: number): [number, number] => [lineOf(i), i - lineStarts[lineOf(i)]];
    frames.push({
      line,
      caption,
      vars: [
        ...(extra.vars ?? []),
        ['calls into sys.stdin', stdinCalls],
        ['calls into sys.stdout', stdoutCalls],
        ['one call per line would be', lineCount],
        ['one call per token would be', tokenCount],
      ],
      state: {
        label: `stdin ${pyRepr(stdin)}; ${stdinCalls} calls into sys.stdin and ${stdoutCalls} into sys.stdout so far; written ${pyRepr(writes.join(''))}`,
        lines: lineStarts.map((s, l) => {
          const end = l + 1 < lineStarts.length ? lineStarts[l + 1] : stdin.length;
          return { bytes: Array.from(stdin.slice(s, end), (ch, k) => ({ ch, role: byteRole(s + k) })) };
        }),
        spans: tokenSpans.map((sp, k) => {
          const [line0, c1] = at(sp.start);
          return { line: line0, c1, c2: c1 + (sp.end - sp.start) - 1, role: spanRoles.get(k) };
        }),
        cursor: pos < stdin.length ? at(pos) : null,
        window: windowSpan ? { from: windowSpan.end > windowSpan.start ? at(windowSpan.start) : null, to: windowSpan.end > windowSpan.start ? at(windowSpan.end - 1) : null } : null,
        eofRole,
        bufferTitle,
        buffer: buffer.map((b) => ({ ...b })),
        bufferIndex,
        pendingTitle,
        // writer.buffer holds strings; demo_all_at_once's output list holds ints.
        pending: pending.map((p) => ({ text: mode === 'buffered' ? pyRepr(p) : p })),
        writes: outputs.map((o) => ({ ...o })),
        counters: [
          { label: 'calls into sys.stdin', value: stdinCalls, role: !extra.stdout && windowSpan ? 'active' : undefined },
          { label: 'calls into sys.stdout', value: stdoutCalls, role: extra.stdout ? 'active' : undefined },
        ],
        values: mode === 'lines' || bufferIndex !== null ? [...values] : [],
        baseline: `one call per line: ${lineCount}, per token: ${tokenCount}`,
        maxLines: 1,
        maxTokens: 1,
        maxWrites: 1,
        maxValues: 0,
      },
    });
  };

  /** sys.stdin.readline(): up to and including the next line break, or '' at the end. */
  const readline = (): string => {
    const end = stdin.indexOf('\n', pos);
    const stop = end === -1 ? stdin.length : end + 1;
    const text = stdin.slice(pos, stop);
    windowSpan = { start: pos, end: stop };
    pos = stop;
    stdinCalls += 1;
    calls.push(['readline', text]);
    if (text === '') eofRole = 'bad';
    return text;
  };

  /** sys.stdin.read(): everything that is left, in one call. */
  const readAll = (): string => {
    const text = stdin.slice(pos);
    windowSpan = { start: pos, end: stdin.length };
    pos = stdin.length;
    stdinCalls += 1;
    calls.push(['read', text]);
    if (text === '') eofRole = 'bad';
    return text;
  };

  const write = (text: string, line: number, caption: string) => {
    writes.push(text);
    stdoutCalls += 1;
    outputs = outputs.map((o) => ({ ...o, role: undefined }));
    outputs.push({ text: pyRepr(text), role: 'active' });
    snap(line, caption, { stdout: true });
  };

  const fail = (e: unknown, line: number, why: string) => {
    if (!(e instanceof PyError)) throw e;
    error = [e.type, e.pyMessage];
    const lost =
      pending.length > 0
        ? ` The ${plural(pending.length, 'answer')} waiting in ${mode === 'buffered' ? 'writer.buffer' : 'output'} ${pending.length === 1 ? 'is' : 'are'} never written, because the write at the end never runs.`
        : '';
    snap(line, `${e.type}: ${e.pyMessage}. ${why} The program stops here, as Python would with a traceback.${lost}`);
  };

  if (mode === 'lines') {
    const showLine = (text: string, start: number) => {
      buffer = pySplit(text).map((t) => ({ text: pyRepr(t), role: 'compare' as Role }));
      spanRoles.clear();
      tokenSpans.forEach((sp, k) => {
        if (sp.start >= start && sp.end <= start + text.length) spanRoles.set(k, 'compare');
      });
    };
    const fastInt = (what: 't' | 'n', line: number): number | null => {
      const start = pos;
      const text = readline();
      showLine(text, start);
      snap(
        line,
        text === ''
          ? `${what} = fast_int(): sys.stdin.readline() is call ${stdinCalls}, and it returns '' because the input has ended.`
          : `${what} = fast_int(): sys.stdin.readline() is call ${stdinCalls}. It returns one whole line, ${pyRepr(text)}, and the stream moves past it.`,
        { vars: [['readline returned', pyRepr(text)]] },
      );
      try {
        const v = pyInt(text);
        reads.push(['fast_int', v]);
        setValue(what === 't' ? 0 : 1, `${what} = ${v}`);
        buffer = buffer.map((b) => ({ ...b, role: 'done' as Role }));
        snap(line, `int(${pyRepr(text)}) = ${v}: int() ignores the spaces and the line break around the number.`, { vars: [[what, v]] });
        return v;
      } catch (e) {
        const count = pySplit(text).length;
        fail(e, line, text === '' ? 'The input ran out: there is no line left to read.' : `int() takes exactly one number, and this line holds ${count === 0 ? 'none' : plural(count, 'token')}.`);
        return null;
      }
    };

    const t = fastInt('t', 0);
    if (t !== null) {
      for (let round = 0; round < t && error === null; round++) {
        setValue(2, 'a = ?');
        setValue(3, 'sum(a) = ?');
        const n = fastInt('n', 3);
        if (n === null) break;
        const start = pos;
        const text = readline();
        showLine(text, start);
        snap(
          4,
          text === ''
            ? `a = fast_ints(): readline is call ${stdinCalls} and returns '': the input has ended, so split() gives no tokens.`
            : `a = fast_ints(): readline is call ${stdinCalls} and returns ${pyRepr(text)}. fast_ints reads one line, whatever n says.`,
          { vars: [['readline returned', pyRepr(text)]] },
        );
        let a: number[];
        try {
          a = pySplit(text).map(pyInt);
        } catch (e) {
          buffer = buffer.map((b) => ({ ...b, role: /^'[+-]?\d+'$/.test(b.text) ? b.role : ('bad' as Role) }));
          fail(e, 4, 'map(int, ...) stops at the first token that is not a number.');
          break;
        }
        reads.push(['fast_ints', a]);
        setValue(2, `a = [${a.join(', ')}]`);
        buffer = buffer.map((b) => ({ ...b, role: 'done' as Role }));
        const note =
          a.length === n ? '' : a.length < n ? ` n says ${n}, but the line holds only ${a.length}: a line reader cannot see numbers on the next line.` : ` n says ${n}, but the line holds ${a.length}: fast_ints keeps them all.`;
        snap(4, `split() cuts the line at the spaces and int() converts each piece: a = [${a.join(', ')}].${note}`, { vars: [['a', `[${a.join(', ')}]`]] });
        const ans = a.reduce((s, v) => s + v, 0);
        setValue(3, `sum(a) = ${ans}`);
        windowSpan = null;
        write(`${ans}\n`, 6, `fast_print(${ans}): sys.stdout.write(${pyRepr(`${ans}\n`)}) is write call ${stdoutCalls + 1}. The answer goes out at once: one call per answer.`);
      }
    }
    if (error === null) {
      windowSpan = null;
      snap(
        undefined,
        `Done: ${plural(stdinCalls, 'call')} into sys.stdin (one per line read) and ${plural(stdoutCalls, 'call')} into sys.stdout (one per answer). ` +
          'Reading everything at once would make 1 read and 1 write for the same answers.',
      );
    }
    return { frames, calls, reads, writes, error };
  }

  // 'buffered' and 'all' read the whole input with one call.
  const text = readAll();
  const toks = pySplit(text);
  snap(
    0,
    mode === 'buffered'
      ? `BufferedInput(): ONE sys.stdin.read() call returns all ${plural(stdin.length, 'byte')} at once. buffer_size (1 << 20) is accepted but never used: the whole stream is one read, so no token can be cut between two reads.`
      : `AllInputReader(): ONE sys.stdin.read() call returns all ${plural(stdin.length, 'byte')} at once.`,
    { vars: [['read returned', plural(stdin.length, 'byte')]] },
  );
  tokenSpans.forEach((_, k) => spanRoles.set(k, 'compare'));
  const readSet = new Set<number>();
  const markRead = (current: number[]) => {
    for (const k of current) readSet.add(k);
    buffer = buffer.map((b, k) => ({ ...b, role: current.includes(k) ? ('active' as Role) : readSet.has(k) ? ('muted' as Role) : b.role === 'bad' ? 'bad' : undefined }));
    tokenSpans.forEach((_, k) => spanRoles.set(k, current.includes(k) ? 'active' : readSet.has(k) ? 'done' : 'compare'));
  };
  if (mode === 'buffered') {
    tokens = toks;
    buffer = toks.map((t) => ({ text: pyRepr(t) }));
    bufferIndex = 0;
    snap(0, `.split() cuts the bytes at every space and line break: ${plural(toks.length, 'token')} in self.buffer, index 0. From now on reading is a list lookup, not a call into sys.stdin.`);
  } else {
    let data: number[];
    try {
      data = toks.map(pyInt);
    } catch (e) {
      buffer = toks.map((t) => ({ text: pyRepr(t), role: /^[+-]?\d+$/.test(t) ? undefined : ('bad' as Role) }));
      fail(e, 0, 'AllInputReader converts every token with map(int, ...) in its constructor, so one bad token fails before the program has read anything.');
      return { frames, calls, reads, writes, error };
    }
    buffer = data.map((v) => ({ text: String(v) }));
    bufferIndex = 0;
    snap(0, `.split() cuts ${plural(toks.length, 'token')}, and map(int, ...) converts them all up front: self.data holds ${data.length} numbers, idx 0.`);
  }
  snap(1, mode === 'buffered' ? 'writer = BufferedOutput(): an empty list. Answers will wait in it until flush().' : 'output = []: the answers will wait in a list until the single write at the end.');

  /** reader.next_int() / reader.next(): one list lookup, no call into sys.stdin. */
  const nextValue = (slot: number, what: string, line: number): number | null => {
    const idx = bufferIndex ?? 0;
    const k = pyIndex(idx, buffer.length);
    const list = mode === 'buffered' ? 'self.buffer' : 'self.data';
    if (k === null) {
      eofRole = 'bad';
      fail(new PyError('IndexError', 'list index out of range'), line, `${list}[${idx}] does not exist: the input has only ${plural(buffer.length, 'token')}.`);
      return null;
    }
    bufferIndex = idx + 1;
    markRead([k]);
    let v: number;
    if (mode === 'buffered') {
      const tok = (tokens as string[])[k];
      try {
        v = pyInt(tok);
      } catch (e) {
        buffer[k] = { ...buffer[k], role: 'bad' };
        fail(e, line, 'next() had already moved the index past the token when int() raised.');
        return null;
      }
    } else v = Number(buffer[k].text);
    // The values next_ints reads one by one are reported as one list, as the fixture records them.
    if (slot >= 0) {
      reads.push([mode === 'buffered' ? 'next_int' : 'next', v]);
      setValue(slot, `${what} = ${v}`);
    }
    const wrap = idx < 0 ? ` (index ${idx} counts from the end: a negative count moved idx backwards)` : '';
    snap(
      line,
      mode === 'buffered'
        ? `${what} = reader.next_int(): self.buffer[${idx}] is ${pyRepr((tokens as string[])[k])}, so int() gives ${v}; index becomes ${idx + 1}. No call into sys.stdin.`
        : `${what} = reader.next(): self.data[${idx}] = ${v}${wrap}; idx becomes ${idx + 1}. No call into sys.stdin.`,
      { vars: [[what, v]] },
    );
    return v;
  };

  const t = nextValue(0, 't', 2);
  if (t !== null) {
    for (let round = 0; round < t && error === null; round++) {
      setValue(2, 'a = ?');
      setValue(3, 'sum(a) = ?');
      const n = nextValue(1, 'n', 4);
      if (n === null) break;
      const a: number[] = [];
      if (mode === 'buffered') {
        for (let j = 0; j < n && error === null; j++) {
          const v = nextValue(-1, `a[${j}]`, 5);
          if (v !== null) a.push(v);
        }
        if (error !== null) break;
        reads.push(['next_ints', a]);
        setValue(2, `a = [${a.join(', ')}]`);
        if (n <= 0) snap(5, `reader.next_ints(${n}) reads nothing: range(${n}) is empty, so a = [].`);
      } else {
        const idx: number = bufferIndex ?? 0;
        const [lo, hi] = pySlice(idx, idx + n, buffer.length);
        for (let k = lo; k < hi; k++) a.push(Number(buffer[k].text));
        bufferIndex = idx + n;
        markRead(Array.from({ length: hi - lo }, (_, k) => lo + k));
        reads.push(['next_n', a]);
        setValue(2, `a = [${a.join(', ')}]`);
        const why =
          n < 0
            ? ` A negative n gives an empty slice and moves idx back by ${-n}, so later reads see old numbers again.`
            : a.length < n
              ? ` Only ${a.length} number${a.length === 1 ? ' is' : 's are'} left: a slice stops at the end of the list instead of raising, so the shortfall goes unnoticed.`
              : '';
        snap(5, `a = reader.next_n(${n}) = self.data[${idx}:${idx + n}] = [${a.join(', ')}]; idx becomes ${idx + n}.${why}`, { vars: [['a', `[${a.join(', ')}]`]] });
      }
      const ans = a.reduce((s, v) => s + v, 0);
      setValue(3, `sum(a) = ${ans}`);
      pending.push(mode === 'buffered' ? `${ans}\n` : String(ans));
      snap(
        6,
        mode === 'buffered'
          ? `writer.write(${ans}) appends ${pyRepr(`${ans}\n`)} to writer.buffer. Nothing reaches sys.stdout yet: ${plural(pending.length, 'answer')} waiting.`
          : `output.append(${ans}): ${plural(pending.length, 'answer')} waiting for the single write.`,
      );
    }
  }
  if (error === null) {
    windowSpan = null;
    const out = mode === 'buffered' ? pending.join('') : `${pending.join('\n')}\n`;
    const count = pending.length;
    pending.length = 0;
    write(
      out,
      7,
      mode === 'buffered'
        ? `writer.flush(): ONE sys.stdout.write call writes ${pyRepr(out)}, all ${plural(count, 'answer')} together, and empties the list.`
        : `ONE sys.stdout.write call writes ${pyRepr(out)}: the ${plural(count, 'answer')} joined by line breaks${count === 0 ? ' (no answers: just a line break)' : ''}.`,
    );
    snap(
      undefined,
      `Done: 1 call into sys.stdin and 1 into sys.stdout. Reading line by line would have made ${plural(lineCount, 'call')}, and one call per token ${tokenCount}. ` +
        'The price: the whole input sits in memory, and nothing is answered before the input ends.',
    );
  }
  return { frames, calls, reads, writes, error, ...(tokens ? { tokens } : {}) };
}

/** Every frame of a run keeps one picture size: the largest counts of the run. */
export function stabilizeIo(frames: Array<Frame<IoStreamState>>): Array<Frame<IoStreamState>> {
  const maxLines = Math.max(1, ...frames.map((f) => f.state.lines.length));
  const maxTokens = Math.max(1, ...frames.map((f) => f.state.buffer.length + f.state.pending.length));
  const maxWrites = Math.max(1, ...frames.map((f) => f.state.writes.length));
  const maxValues = Math.max(0, ...frames.map((f) => f.state.values.length));
  return frames.map((f) => ({ ...f, state: { ...f.state, maxLines, maxTokens, maxWrites, maxValues } }));
}
