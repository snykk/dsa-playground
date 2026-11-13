/**
 * Which interactive visualizations exist and which repository folders show them.
 *
 * Entries live in one registry file per area (src/viz/registry/*.ts) so several
 * people can add visualizations in parallel without touching the same file.
 * Astro pages import this module at build time; the specs themselves are
 * code-split and only loaded by VizMount in the browser.
 */
import * as codingTheory from './registry/codingTheory';
import * as dynamicProgramming from './registry/dynamicProgramming';
import * as graphStructure from './registry/graphStructure';
import * as graphTraversal from './registry/graphTraversal';
import * as greedy from './registry/greedy';
import * as patterns from './registry/patterns';
import * as searching from './registry/searching';
import * as shortestPaths from './registry/shortestPaths';
import * as sorting from './registry/sorting';
import * as strings from './registry/strings';
import * as trees from './registry/trees';

export type VizGroup =
  | 'Sorting'
  | 'Searching'
  | 'Graphs'
  | 'Trees'
  | 'Strings'
  | 'Dynamic Programming'
  | 'Greedy'
  | 'Problem Patterns'
  | 'Coding Theory';

export interface VizInfo {
  id: string;
  title: string;
  group: VizGroup;
  blurb: string;
  /** Repo-relative folders whose page embeds this visualization (first = home topic). */
  topics: string[];
}

export const VIZ_GROUP_ORDER: VizGroup[] = [
  'Sorting',
  'Searching',
  'Graphs',
  'Trees',
  'Strings',
  'Dynamic Programming',
  'Greedy',
  'Problem Patterns',
  'Coding Theory',
];

export const REGISTRIES = [
  sorting,
  searching,
  graphTraversal,
  shortestPaths,
  graphStructure,
  trees,
  strings,
  dynamicProgramming,
  greedy,
  patterns,
  codingTheory,
];

export const VIZ_CATALOG: VizInfo[] = REGISTRIES.flatMap((r) => r.entries);

export function vizForTopic(rel: string): VizInfo[] {
  return VIZ_CATALOG.filter((v) => v.topics.includes(rel));
}

export function hasViz(rel: string): boolean {
  return VIZ_CATALOG.some((v) => v.topics.includes(rel));
}
