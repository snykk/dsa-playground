/**
 * Two-dimensional DP tracers: Edit Distance (Levenshtein) and Matrix Chain Multiplication.
 * Both mirror the repository's Python implementations of the same topic.
 */
import { InputError, parseIntList, type Frame, type Role } from '../core/types';
import type { GridState } from '../renderers/Grid';
import type { StripItem } from '../ui/molecules/Strip';

type Vars = Array<[string, string | number]>;
const EMPTY = String.fromCodePoint(0x2205);

// ---------------------------------------------------------------- Edit distance

export interface EditInput {
  a: string[];
  b: string[];
}

export function parseEditDistance(text: string, maxLen = 10): EditInput {
  const parts = text.split('|');
  if (parts.length !== 2) throw new InputError('Write two words separated by "|", e.g. "kitten | sitting". Either side may be empty.');
  const [a, b] = parts.map((p) => Array.from(p.trim()));
  if (a.length > maxLen || b.length > maxLen) throw new InputError(`Keep both words to ${maxLen} characters or fewer.`);
  return { a, b };
}

export function editDistanceTrace({ a, b }: EditInput): Array<Frame<GridState>> {
  const m = a.length;
  const n = b.length;
  const dp: Array<Array<number | null>> = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : null)),
  );
  const frames: Array<Frame<GridState>> = [];
  let ops: StripItem[] = [];
  const push = (line: number | undefined, caption: string, roles: Record<string, Role> = {}, vars: Vars = []) => {
    frames.push({
      line,
      caption,
      vars,
      state: {
        corner: 'a \\ b',
        rowHeaders: [EMPTY, ...a],
        colHeaders: [EMPTY, ...b],
        cells: dp.map((row) => [...row]),
        roles,
        strips: ops.length ? [{ label: 'Edits (start to end)', items: ops }] : undefined,
      },
    });
  };

  push(
    0,
    `Row 0 and column 0 are the base cases: turning "${a.join('')}" into an empty word takes i deletions, and building "${b.join('')}" from an empty word takes j insertions. dp[i][j] = edits to turn the first i letters of a into the first j letters of b.`,
    {},
    [['m', m], ['n', n]],
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const diag = dp[i - 1][j - 1]!;
      const up = dp[i - 1][j]!;
      const left = dp[i][j - 1]!;
      const vars: Vars = [['i', i], ['j', j], ['a[i-1]', a[i - 1]], ['b[j-1]', b[j - 1]]];
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = diag;
        push(3, `'${a[i - 1]}' = '${b[j - 1]}': the letters already match, so no edit is needed and dp[${i}][${j}] copies the diagonal, ${diag}.`, {
          [`${i - 1},${j - 1}`]: 'good',
          [`${i},${j}`]: 'active',
        }, vars);
      } else {
        const best = Math.min(diag, up, left) + 1;
        dp[i][j] = best;
        const how = best === diag + 1 ? 'replace' : best === up + 1 ? 'delete' : 'insert';
        push(
          4,
          `'${a[i - 1]}' != '${b[j - 1]}': cheapest of replace (diagonal ${diag} + 1), delete (up ${up} + 1) and insert (left ${left} + 1) is ${best}, so ${how}.`,
          { [`${i - 1},${j - 1}`]: 'compare', [`${i - 1},${j}`]: 'compare', [`${i},${j - 1}`]: 'compare', [`${i},${j}`]: 'active' },
          vars,
        );
      }
    }
  }

  const total = dp[m][n]!;
  const path: Record<string, Role> = { [`${m},${n}`]: 'done' };
  push(5, `The table is full: the edit distance is dp[${m}][${n}] = ${total}. Walk back from the corner to read off one cheapest list of edits.`, { ...path }, [['answer', total]]);
  let i = m;
  let j = n;
  const rev: StripItem[] = [];
  while (i > 0 || j > 0) {
    const cur = dp[i][j]!;
    let text: string;
    let role: Role;
    let caption: string;
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1] && cur === dp[i - 1][j - 1]) {
      text = `keep ${a[i - 1]}`;
      role = 'good';
      caption = `dp[${i}][${j}] came from the diagonal and '${a[i - 1]}' matches: keep it (free).`;
      i--;
      j--;
    } else if (i > 0 && j > 0 && cur === dp[i - 1][j - 1]! + 1) {
      text = `${a[i - 1]}>${b[j - 1]}`;
      role = 'active';
      caption = `dp[${i}][${j}] = diagonal + 1: replace '${a[i - 1]}' with '${b[j - 1]}'.`;
      i--;
      j--;
    } else if (i > 0 && cur === dp[i - 1][j]! + 1) {
      text = `del ${a[i - 1]}`;
      role = 'active';
      caption = `dp[${i}][${j}] = up + 1: delete '${a[i - 1]}' from a.`;
      i--;
    } else {
      text = `ins ${b[j - 1]}`;
      role = 'active';
      caption = `dp[${i}][${j}] = left + 1: insert '${b[j - 1]}' into a.`;
      j--;
    }
    rev.push({ text, role });
    ops = [...rev].reverse();
    path[`${i},${j}`] = 'done';
    push(6, caption, { ...path }, [['i', i], ['j', j]]);
  }
  push(undefined, `Done: ${total} edit${total === 1 ? '' : 's'} turn "${a.join('')}" into "${b.join('')}". Matches ("keep") cost nothing.`, { ...path }, [['answer', total]]);
  return frames;
}

// ---------------------------------------------------------------- Matrix chain multiplication

export function parseMatrixChain(text: string): number[] {
  const dims = parseIntList(text, { min: 2, max: 9, lo: 1, hi: 99, what: 'dimensions' });
  return dims;
}

/** Parenthesization such as "((A1 A2) A3)" from a split table (1-based). */
export function parenthesize(split: number[][], i: number, j: number): string {
  if (i === j) return `A${i}`;
  return `(${parenthesize(split, i, split[i][j])} ${parenthesize(split, split[i][j] + 1, j)})`;
}

export function matrixChainTrace(dims: number[]): Array<Frame<GridState>> {
  const n = dims.length - 1; // number of matrices
  const dp: Array<Array<number | null>> = Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => (r === c ? 0 : null)));
  const split: number[][] = Array.from({ length: n + 1 }, () => Array.from({ length: n + 1 }, () => 0));
  const frames: Array<Frame<GridState>> = [];
  let order = '';
  const sizes = Array.from({ length: n }, (_, k) => `A${k + 1} = ${dims[k]}x${dims[k + 1]}`);
  const push = (line: number | undefined, caption: string, roles: Record<string, Role> = {}, vars: Vars = []) => {
    frames.push({
      line,
      caption,
      vars,
      state: {
        corner: 'i \\ j',
        rowHeaders: Array.from({ length: n }, (_, k) => `A${k + 1}`),
        colHeaders: Array.from({ length: n }, (_, k) => `A${k + 1}`),
        cells: dp.map((row) => [...row]),
        roles,
        strips: [
          { label: 'Matrices', items: sizes.map((s) => ({ text: s })) },
          ...(order ? [{ label: 'Best order', items: [{ text: order, role: 'done' as Role }] }] : []),
        ],
      },
    });
  };
  const key = (i: number, j: number) => `${i - 1},${j - 1}`;

  if (n === 1) {
    push(0, 'A single matrix needs no multiplication: the cost is 0.', { [key(1, 1)]: 'done' }, [['answer', 0]]);
    return frames;
  }
  push(0, `dp[i][j] = fewest scalar multiplications to compute the product Ai..Aj. A chain of one matrix costs 0, so the diagonal is 0. Only the upper triangle (i <= j) is used.`, {}, [['matrices', n]]);
  for (let len = 2; len <= n; len++) {
    for (let i = 1; i + len - 1 <= n; i++) {
      const j = i + len - 1;
      let best: number | null = null;
      for (let k = i; k < j; k++) {
        const left = dp[i - 1][k - 1]!;
        const right = dp[k][j - 1]!;
        const mult = dims[i - 1] * dims[k] * dims[j];
        const cost = left + right + mult;
        const better = best === null || cost < best;
        if (better) {
          best = cost;
          split[i][j] = k;
        }
        dp[i - 1][j - 1] = best;
        push(
          5,
          `A${i}..A${j}, split after A${k}: ${left} + ${right} + ${dims[i - 1]}*${dims[k]}*${dims[j]} = ${cost}. ${better ? `Best so far for this interval.` : `Not better than ${best}.`}`,
          { [key(i, k)]: 'compare', [key(k + 1, j)]: 'compare', [key(i, j)]: 'active' },
          [['i', i], ['j', j], ['k', k], ['cost', cost], ['best', best!]],
        );
      }
      push(2, `dp[${i}][${j}] = ${best}: the best split for A${i}..A${j} is after A${split[i][j]}.`, { [key(i, j)]: 'done' }, [['i', i], ['j', j], ['best k', split[i][j]]]);
    }
  }
  const total = dp[0][n - 1]!;
  order = parenthesize(split, 1, n);
  const used: Record<string, Role> = {};
  const mark = (i: number, j: number) => {
    used[key(i, j)] = 'done';
    if (i < j) {
      mark(i, split[i][j]);
      mark(split[i][j] + 1, j);
    }
  };
  mark(1, n);
  push(6, `Done: the cheapest order costs dp[1][${n}] = ${total} scalar multiplications. Following the remembered splits from the top gives ${order}.`, used, [['answer', total]]);
  return frames;
}
