/**
 * Which interactive visualizations exist and which repository folders show them.
 *
 * Entries live in one registry file per area (src/viz/registry/*.ts) so several
 * people can add visualizations in parallel without touching the same file.
 * Astro pages import this module at build time; the specs themselves are
 * code-split and only loaded by VizMount in the browser.
 */
import * as advancedGraph from './registry/advancedGraph';
import * as advancedMath from './registry/advancedMath';
import * as backtracking from './registry/backtracking';
import * as codingTheory from './registry/codingTheory';
import * as complexity from './registry/complexity';
import * as divideAndConquer from './registry/divideAndConquer';
import * as dynamicProgramming from './registry/dynamicProgramming';
import * as geometry from './registry/geometry';
import * as graphStructure from './registry/graphStructure';
import * as graphTraversal from './registry/graphTraversal';
import * as greedy from './registry/greedy';
import * as hashing from './registry/hashing';
import * as heaps from './registry/heaps';
import * as linear from './registry/linear';
import * as multiwayTrees from './registry/multiwayTrees';
import * as numberTheory from './registry/numberTheory';
import * as optimizationTechniques from './registry/optimizationTechniques';
import * as patterns from './registry/patterns';
import * as problemTypes from './registry/problemTypes';
import * as randomized from './registry/randomized';
import * as rangeQueries from './registry/rangeQueries';
import * as searching from './registry/searching';
import * as shortestPaths from './registry/shortestPaths';
import * as sorting from './registry/sorting';
import * as specializedTechniques from './registry/specializedTechniques';
import * as strings from './registry/strings';
import * as trees from './registry/trees';

export type VizGroup =
  | 'Complexity'
  | 'Sorting'
  | 'Searching'
  | 'Linear Structures'
  | 'Hashing'
  | 'Trees'
  | 'Heaps'
  | 'Range Queries'
  | 'Graphs'
  | 'Strings'
  | 'Dynamic Programming'
  | 'Greedy'
  | 'Backtracking'
  | 'Geometry'
  | 'Math'
  | 'Problem Patterns'
  | 'Coding Theory'
  | 'Competitive Programming';

export interface VizInfo {
  id: string;
  title: string;
  group: VizGroup;
  blurb: string;
  /** Repo-relative folders whose page embeds this visualization (first = home topic). */
  topics: string[];
}

export const VIZ_GROUP_ORDER: VizGroup[] = [
  'Complexity',
  'Sorting',
  'Searching',
  'Linear Structures',
  'Hashing',
  'Trees',
  'Heaps',
  'Range Queries',
  'Graphs',
  'Strings',
  'Dynamic Programming',
  'Greedy',
  'Backtracking',
  'Geometry',
  'Math',
  'Problem Patterns',
  'Coding Theory',
  'Competitive Programming',
];

export const REGISTRIES = [
  sorting,
  searching,
  linear,
  hashing,
  heaps,
  graphTraversal,
  shortestPaths,
  graphStructure,
  advancedGraph,
  trees,
  rangeQueries,
  multiwayTrees,
  strings,
  dynamicProgramming,
  greedy,
  patterns,
  codingTheory,
  backtracking,
  geometry,
  specializedTechniques,
  divideAndConquer,
  randomized,
  complexity,
  numberTheory,
  advancedMath,
  problemTypes,
  optimizationTechniques,
];

export const VIZ_CATALOG: VizInfo[] = REGISTRIES.flatMap((r) => r.entries);

export function vizForTopic(rel: string): VizInfo[] {
  return VIZ_CATALOG.filter((v) => v.topics.includes(rel));
}

export function hasViz(rel: string): boolean {
  return VIZ_CATALOG.some((v) => v.topics.includes(rel));
}
