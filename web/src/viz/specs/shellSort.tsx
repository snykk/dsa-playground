import { SEQUENCE_NAMES, shellSort as traceShellSort, type GapSequenceName, type ShellSortInput, type ShellSortState } from '../algorithms/shellSort';
import { InputError, parseIntList, randomInts, type VizSpec } from '../core/types';
import { ShellSortBars } from '../renderers/ShellSortBars';

const SAMPLE = '98, 69, 74, 79, 60, 91, 41, 99, 18, 63, 93, 38';

/** "knuth: 5, 3, 8" picks a gap sequence; a plain list uses Ciura's gaps, the default. */
export function parseShellSortInput(text: string): ShellSortInput {
  const named = /^\s*([A-Za-z]+)\s*:([\s\S]*)$/.exec(text);
  let sequence: GapSequenceName = 'ciura';
  let list = text;
  if (named) {
    const name = named[1].toLowerCase();
    if (!(SEQUENCE_NAMES as string[]).includes(name)) {
      throw new InputError(`Unknown gap sequence "${named[1]}": start with shell:, knuth: or ciura:, or leave it out for Ciura's gaps.`);
    }
    sequence = name as GapSequenceName;
    list = named[2];
  }
  return { values: parseIntList(list, { min: 2, max: 24 }), sequence };
}

export const shellSort: VizSpec<ShellSortInput, ShellSortState> = {
  id: 'shell-sort',
  title: 'Shell Sort',
  inputKind: 'shell-sort',
  inputLabel: 'Values to sort, optionally after a gap sequence',
  inputHelp: "2 to 24 whole numbers between -999 and 999. Start with shell:, knuth: or ciura: to pick the gaps; a plain list uses Ciura's.",
  examples: [
    { label: "Ciura's gaps 10, 4, 1", value: SAMPLE },
    { label: "Knuth's gaps 4, 1", value: `knuth: ${SAMPLE}` },
    { label: "Shell's gaps 6, 3, 1", value: `shell: ${SAMPLE}` },
    { label: "Bad case for Shell's gaps", value: 'shell: 1, 9, 2, 10, 3, 11, 4, 12, 5, 13, 6, 14, 7, 15, 8, 16' },
    { label: 'Reversed', value: '16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1' },
    { label: 'Duplicates', value: '5, 3, 5, 1, 3, 5, 1, 3, 2, 4, 2, 4' },
  ],
  randomInput: () => randomInts(11 + Math.floor(Math.random() * 6), 1, 99).join(', '),
  parse: parseShellSortInput,
  trace: traceShellSort,
  render: (state) => <ShellSortBars state={state} />,
  pseudocode: [
    'gaps = the terms of the sequence below n, largest first',
    'for gap in gaps:',
    '  for i from gap to n - 1:        // a[i] is in group i mod gap',
    '    key = a[i]; j = i',
    '    while j >= gap and a[j - gap] > key:',
    '      a[j] = a[j - gap]           // shift right by gap',
    '      j = j - gap',
    '    a[j] = key',
  ],
  legend: [
    { role: 'active', label: 'the key being inserted' },
    { role: 'compare', label: 'a[j - gap], compared with the key' },
    { role: 'idle', label: 'waiting; the letter under a bar names its group' },
    { role: 'done', label: 'sorted, after the gap-1 pass' },
  ],
  complexity: {
    time: "O(n log n) best; worst \u0398(n\u00b2) with Shell's gaps, O(n^1.5) with Knuth's, unknown with Ciura's",
    space: 'O(1)',
  },
};
