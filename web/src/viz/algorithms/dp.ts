/**
 * Dynamic-programming table tracers: Longest Common Subsequence and 0/1 Knapsack.
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { GridState } from '../renderers/Grid';

// ---------------------------------------------------------------- LCS

export interface LcsInput {
  a: string[];
  b: string[];
}

export function parseLcs(text: string, maxLen = 12): LcsInput {
  const parts = text.split('|');
  if (parts.length !== 2) throw new InputError('Write two strings separated by "|", e.g. "ABCBDAB | BDCABA".');
  const [a, b] = parts.map((p) => Array.from(p.trim()));
  if (!a.length || !b.length) throw new InputError('Both strings need at least one character.');
  if (a.length > maxLen || b.length > maxLen) throw new InputError(`Keep both strings to ${maxLen} characters or fewer.`);
  return { a, b };
}

export function lcsTrace({ a, b }: LcsInput): Array<Frame<GridState>> {
  const m = a.length;
  const n = b.length;
  const dp: Array<Array<number | null>> = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 || j === 0 ? 0 : null)),
  );
  const frames: Array<Frame<GridState>> = [];
  const result: string[] = [];
  const push = (line: number | undefined, caption: string, roles: Record<string, Role> = {}, vars: Array<[string, string | number]> = []) => {
    frames.push({
      line,
      caption,
      vars,
      state: {
        corner: 'a \\ b',
        rowHeaders: ['\u2205', ...a],
        colHeaders: ['\u2205', ...b],
        cells: dp.map((row) => [...row]),
        roles,
        strips: [{ label: 'LCS', items: result.length ? [...result].reverse().map((c) => ({ text: c, role: 'done' as Role })) : [{ text: '(not traced yet)' }] }],
      },
    });
  };

  push(0, `Row and column 0 are 0: the LCS with an empty string is empty. dp[i][j] will hold the LCS length of a[0..i) and b[0..j).`);
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const equal = a[i - 1] === b[j - 1];
      if (equal) {
        dp[i][j] = dp[i - 1][j - 1]! + 1;
        push(3, `a[${i - 1}] = '${a[i - 1]}' equals b[${j - 1}] = '${b[j - 1]}': extend the diagonal, ${dp[i - 1][j - 1]} + 1 = ${dp[i][j]}.`, {
          [`${i - 1},${j - 1}`]: 'compare',
          [`${i},${j}`]: 'active',
        }, [['i', i], ['j', j], ['a[i-1]', a[i - 1]], ['b[j-1]', b[j - 1]]]);
      } else {
        const up = dp[i - 1][j]!;
        const left = dp[i][j - 1]!;
        dp[i][j] = Math.max(up, left);
        push(4, `'${a[i - 1]}' != '${b[j - 1]}': drop one character, take the better of up (${up}) and left (${left}) = ${dp[i][j]}.`, {
          [`${i - 1},${j}`]: 'compare',
          [`${i},${j - 1}`]: 'compare',
          [`${i},${j}`]: 'active',
        }, [['i', i], ['j', j], ['a[i-1]', a[i - 1]], ['b[j-1]', b[j - 1]]]);
      }
    }
  }

  // Traceback from the bottom-right corner.
  const path: Record<string, Role> = {};
  let i = m;
  let j = n;
  push(5, `The table is full: the LCS has length dp[${m}][${n}] = ${dp[m][n]}. Trace back from the corner to recover one LCS.`, { [`${m},${n}`]: 'done' });
  while (i > 0 && j > 0) {
    path[`${i},${j}`] = 'done';
    if (a[i - 1] === b[j - 1]) {
      result.push(a[i - 1]);
      push(5, `'${a[i - 1]}' matches at (${i}, ${j}): it is part of the LCS; move diagonally.`, { ...path }, [['i', i], ['j', j]]);
      i--;
      j--;
    } else if (dp[i - 1][j]! >= dp[i][j - 1]!) {
      push(6, `No match at (${i}, ${j}); up (${dp[i - 1][j]}) >= left (${dp[i][j - 1]}): move up.`, { ...path }, [['i', i], ['j', j]]);
      i--;
    } else {
      push(6, `No match at (${i}, ${j}); left (${dp[i][j - 1]}) > up (${dp[i - 1][j]}): move left.`, { ...path }, [['i', i], ['j', j]]);
      j--;
    }
  }
  push(undefined, `Done: "${[...result].reverse().join('')}" is a longest common subsequence (length ${dp[m][n]}). Other LCSs of the same length may exist.`, { ...path });
  return frames;
}

// ---------------------------------------------------------------- 0/1 knapsack

export interface KnapsackInput {
  capacity: number;
  items: Array<{ weight: number; value: number }>;
}

export function parseKnapsack(text: string, { maxCapacity = 15, maxItems = 6 } = {}): KnapsackInput {
  const m = text.match(/^\s*W\s*=\s*(\d+)\s*;(.*)$/i);
  if (!m) throw new InputError('Start with the capacity, then weight:value pairs, e.g. "W=7; 1:1, 3:4, 4:5, 5:7".');
  const capacity = Number(m[1]);
  if (capacity < 1 || capacity > maxCapacity) throw new InputError(`Capacity must be between 1 and ${maxCapacity}.`);
  const items = m[2]
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      const p = s.match(/^(\d+)\s*:\s*(\d+)$/);
      if (!p) throw new InputError(`"${s}" should look like weight:value, e.g. 3:4.`);
      const weight = Number(p[1]);
      const value = Number(p[2]);
      if (weight < 1 || weight > 99 || value > 999) throw new InputError(`Item ${s}: weight 1..99, value 0..999.`);
      return { weight, value };
    });
  if (items.length === 0 || items.length > maxItems) throw new InputError(`Give between 1 and ${maxItems} items.`);
  return { capacity, items };
}

export function knapsackTrace({ capacity: W, items }: KnapsackInput): Array<Frame<GridState>> {
  const k = items.length;
  const dp: Array<Array<number | null>> = Array.from({ length: k + 1 }, (_, i) => Array.from({ length: W + 1 }, () => (i === 0 ? 0 : null)));
  const frames: Array<Frame<GridState>> = [];
  const chosen: number[] = [];
  const label = (i: number) => `#${i} (w${items[i - 1].weight}, v${items[i - 1].value})`;
  const push = (line: number | undefined, caption: string, roles: Record<string, Role> = {}, vars: Array<[string, string | number]> = []) => {
    frames.push({
      line,
      caption,
      vars,
      state: {
        corner: 'item \\ w',
        rowHeaders: ['none', ...items.map((_, i) => label(i + 1))],
        colHeaders: Array.from({ length: W + 1 }, (_, w) => String(w)),
        cells: dp.map((row) => [...row]),
        roles,
        strips: [{ label: 'Packed', items: chosen.length ? chosen.map((i) => ({ text: `#${i}`, role: 'done' as Role })) : [{ text: '(not traced yet)' }] }],
      },
    });
  };

  push(0, 'Row 0: with no items the best value is 0 at every capacity. dp[i][w] = best value using items 1..i with capacity w.');
  for (let i = 1; i <= k; i++) {
    const { weight: wi, value: vi } = items[i - 1];
    for (let w = 0; w <= W; w++) {
      const skip = dp[i - 1][w]!;
      if (wi > w) {
        dp[i][w] = skip;
        push(3, `Item #${i} weighs ${wi} > capacity ${w}: it cannot fit, so copy the value above (${skip}).`, {
          [`${i - 1},${w}`]: 'compare',
          [`${i},${w}`]: 'active',
        }, [['item', i], ['w', w]]);
        continue;
      }
      const take = vi + dp[i - 1][w - wi]!;
      dp[i][w] = Math.max(skip, take);
      push(4, `Capacity ${w}: skip #${i} = ${skip}, or take it = ${vi} + dp[${i - 1}][${w - wi}] = ${take}. Best: ${dp[i][w]}${take > skip ? ' (take)' : ' (skip)'}.`, {
        [`${i - 1},${w}`]: 'compare',
        [`${i - 1},${w - wi}`]: 'compare',
        [`${i},${w}`]: 'active',
      }, [['item', i], ['w', w], ['skip', skip], ['take', take]]);
    }
  }

  const path: Record<string, Role> = {};
  let w = W;
  push(5, `The best total value is dp[${k}][${W}] = ${dp[k][W]}. Trace back to see which items were packed.`, { [`${k},${W}`]: 'done' });
  for (let i = k; i >= 1; i--) {
    path[`${i},${w}`] = 'done';
    if (dp[i][w] !== dp[i - 1][w]) {
      chosen.unshift(i);
      push(5, `dp[${i}][${w}] = ${dp[i][w]} differs from the row above (${dp[i - 1][w]}): item #${i} was taken. Remaining capacity ${w} - ${items[i - 1].weight} = ${w - items[i - 1].weight}.`, { ...path }, [['item', i], ['w', w]]);
      w -= items[i - 1].weight;
    } else {
      push(5, `dp[${i}][${w}] equals the row above: item #${i} was skipped.`, { ...path }, [['item', i], ['w', w]]);
    }
  }
  const weight = chosen.reduce((s, i) => s + items[i - 1].weight, 0);
  push(undefined, `Done: pack items ${chosen.map((i) => `#${i}`).join(', ') || '(none)'} for value ${dp[k][W]} and weight ${weight} of ${W}.`, { ...path });
  return frames;
}
