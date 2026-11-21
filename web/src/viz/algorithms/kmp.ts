/**
 * Knuth-Morris-Pratt tracer: phase 1 builds the LPS ("failure") table, phase 2
 * scans the text without ever moving the text pointer backwards.
 *
 * Input: "text | pattern"
 */
import { InputError, type Frame } from '../core/types';
import type { StringMatchState } from '../renderers/StringMatch';

export interface KmpInput {
  text: string[];
  pattern: string[];
}

export function parseKmp(input: string, { maxText = 40, maxPattern = 15 } = {}): KmpInput {
  const bar = input.indexOf('|');
  if (bar === -1) throw new InputError('Separate the text and the pattern with "|", e.g. "ABABDABACDABABCABAB | ABABCABAB".');
  const text = Array.from(input.slice(0, bar).trim());
  const pattern = Array.from(input.slice(bar + 1).trim());
  if (text.length === 0) throw new InputError('The text is empty.');
  if (pattern.length === 0) throw new InputError('The pattern is empty.');
  if (text.length > maxText) throw new InputError(`Keep the text to ${maxText} characters (got ${text.length}).`);
  if (pattern.length > maxPattern) throw new InputError(`Keep the pattern to ${maxPattern} characters (got ${pattern.length}).`);
  return { text, pattern };
}

export function kmpTrace({ text, pattern }: KmpInput): Array<Frame<StringMatchState>> {
  const n = text.length;
  const m = pattern.length;
  const lps: Array<number | null> = Array.from({ length: m }, () => null);
  const frames: Array<Frame<StringMatchState>> = [];
  const matches: number[] = [];
  let comparisons = 0;

  const push = (line: number | undefined, caption: string, s: Partial<StringMatchState>, vars: Array<[string, string | number]> = []) => {
    frames.push({
      line,
      caption,
      state: { text, pattern, lps: [...lps], matches: [...matches], phase: 'lps', shift: 0, ...s },
      vars: [...vars, ['comparisons', comparisons]],
    });
  };

  // ---- Phase 1: longest proper prefix that is also a suffix, for every prefix of the pattern.
  lps[0] = 0;
  let len = 0;
  let i = 1;
  push(0, `Phase 1: build the LPS table. lps[i] = length of the longest proper prefix of pattern[0..i] that is also its suffix. lps[0] is always 0.`, {
    phase: 'lps',
    lpsI: 1,
    lpsLen: 0,
  }, [['i', 1], ['len', 0]]);
  while (i < m) {
    comparisons++;
    const equal = pattern[i] === pattern[len];
    push(equal ? 2 : len > 0 ? 3 : 4, `Compare pattern[${i}] = '${pattern[i]}' with pattern[${len}] = '${pattern[len]}': ${equal ? 'match' : 'mismatch'}.`, {
      phase: 'lps',
      lpsI: i,
      lpsLen: len,
      lpsEqual: equal,
    }, [['i', i], ['len', len]]);
    if (equal) {
      len++;
      lps[i] = len;
      push(2, `The prefix of length ${len} reappears ending at ${i}: lps[${i}] = ${len}.`, { phase: 'lps', lpsI: i, lpsLen: len - 1, lpsSet: i }, [['i', i], ['len', len]]);
      i++;
    } else if (len > 0) {
      const old = len;
      len = lps[len - 1]!;
      push(3, `Fall back: the next shorter candidate border has length lps[${old - 1}] = ${len}. i stays at ${i}.`, { phase: 'lps', lpsI: i, lpsLen: len }, [['i', i], ['len', len]]);
    } else {
      lps[i] = 0;
      push(4, `No border ends at ${i}: lps[${i}] = 0.`, { phase: 'lps', lpsI: i, lpsLen: 0, lpsSet: i }, [['i', i], ['len', 0]]);
      i++;
    }
  }
  push(undefined, `LPS table complete: [${lps.join(', ')}]. Now scan the text.`, { phase: 'lps' }, [['len', len]]);

  // ---- Phase 2: scan the text.
  comparisons = 0;
  i = 0;
  let j = 0;
  push(5, 'Phase 2: align the pattern under text[0]. i walks the text and never moves back.', { phase: 'search', shift: 0, i: 0, j: 0 }, [['i', 0], ['j', 0]]);
  while (i < n) {
    comparisons++;
    const equal = text[i] === pattern[j];
    push(equal ? 7 : j > 0 ? 9 : 10, `Compare text[${i}] = '${text[i]}' with pattern[${j}] = '${pattern[j]}': ${equal ? 'match' : 'mismatch'}.`, {
      phase: 'search',
      shift: i - j,
      i,
      j,
      cmpEqual: equal,
    }, [['i', i], ['j', j]]);
    if (equal) {
      i++;
      j++;
      if (j === m) {
        matches.push(i - m);
        push(8, `Full match at index ${i - m}! Continue from j = lps[${m - 1}] = ${lps[m - 1]} so overlapping matches are found too.`, {
          phase: 'search',
          shift: i - m,
          i: i - 1,
          j: m - 1,
          matchAt: i - m,
        }, [['i', i], ['j', j]]);
        j = lps[m - 1]!;
      }
    } else if (j > 0) {
      const old = j;
      j = lps[j - 1]!;
      push(9, `Mismatch after ${old} matched character${old === 1 ? '' : 's'}: the first lps[${old - 1}] = ${j} of them are already known to match, so shift the pattern to j = ${j} without moving i.`, {
        phase: 'search',
        shift: i - j,
        i,
        j,
      }, [['i', i], ['j', j]]);
    } else {
      i++;
      if (i < n) push(10, 'Mismatch at the first pattern character: advance i.', { phase: 'search', shift: i, i, j: 0 }, [['i', i], ['j', 0]]);
    }
  }
  push(
    undefined,
    matches.length
      ? `Done: ${matches.length} match${matches.length > 1 ? 'es' : ''} at ${matches.join(', ')} using ${comparisons} comparisons (at most 2n = ${2 * n}).`
      : `Done: no match, using ${comparisons} comparisons (at most 2n = ${2 * n}).`,
    { phase: 'search', shift: Math.max(0, n - m), done: true },
    [['matches', matches.join(', ') || 'none']],
  );
  return frames;
}
