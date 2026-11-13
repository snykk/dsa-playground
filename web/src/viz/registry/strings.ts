/** Visualization registry: String matching. */
import type { AnyVizSpec } from '../core/types';
import type { VizInfo } from '../catalog';

export const entries: VizInfo[] = [
  {
    id: 'kmp',
    title: 'Knuth-Morris-Pratt',
    group: 'Strings',
    blurb: 'Build the failure (LPS) table, then reuse it so the text pointer never moves backwards.',
    topics: ['Algorithms/String_Algorithms/Pattern_Matching/KMP Algorithm', 'Data Structures/Linear/String/Pattern Matching'],
  },
];

export const loaders: Record<string, () => Promise<AnyVizSpec>> = {
  kmp: () => import('../specs/strings').then((m) => m.kmp),
};
