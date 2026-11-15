/** Visualization registry: Greedy algorithms. */
import type { AnyVizSpec } from '../core/types';
import type { VizInfo } from '../catalog';

const MST = 'Algorithms/Graph_Algorithms/Minimum_Spanning_Tree';

export const entries: VizInfo[] = [
  {
    id: 'kruskal',
    title: "Kruskal's Algorithm",
    group: 'Greedy',
    blurb: 'Try edges from lightest to heaviest and keep each one that joins two different trees; union-find spots cycles.',
    topics: [`${MST}/Kruskals_Algorithm`, MST],
  },
  {
    id: 'prim',
    title: "Prim's Algorithm",
    group: 'Greedy',
    blurb: 'Grow one tree from a start vertex, always adding the cheapest edge that crosses from the tree to the rest.',
    topics: [`${MST}/Prims_Algorithm`, MST],
  },
  {
    id: 'activity-selection',
    title: 'Activity Selection',
    group: 'Greedy',
    blurb: 'Sort by finish time, then keep every activity that starts after the last chosen one ends.',
    topics: ['Algorithms/Greedy/Activity_Selection', 'Algorithms/Greedy'],
  },
  {
    id: 'fractional-knapsack',
    title: 'Fractional Knapsack',
    group: 'Greedy',
    blurb: 'Pack the most value per unit of weight first and cut the last item to fit, unlike 0/1 knapsack.',
    topics: ['Algorithms/Greedy/Fractional_Knapsack', 'Algorithms/Greedy'],
  },
  {
    id: 'huffman-coding',
    title: 'Huffman Coding',
    group: 'Greedy',
    blurb: "Merge the two lightest trees of Python's heap until one is left, read each code off its path, then encode the text.",
    topics: ['Algorithms/Greedy/Huffman_Coding', 'Algorithms/Greedy'],
  },
  {
    id: 'job-scheduling',
    title: 'Job Scheduling (deadlines)',
    group: 'Greedy',
    blurb: 'Take jobs by profit and drop each into the latest free slot before its deadline; a job that finds none is skipped.',
    topics: ['Algorithms/Greedy/Job_Scheduling', 'Algorithms/Greedy'],
  },
  {
    id: 'job-scheduling-edf',
    title: 'Job Scheduling (EDF)',
    group: 'Greedy',
    blurb: 'Earliest deadline first: one stable sort by deadline, and the order that keeps the worst lateness smallest.',
    topics: ['Algorithms/Greedy/Job_Scheduling'],
  },
  {
    id: 'job-scheduling-smith',
    title: "Job Scheduling (Smith's rule)",
    group: 'Greedy',
    blurb: 'Sort by weight / processing time and add up weight x completion time; a processing time of 0 raises.',
    topics: ['Algorithms/Greedy/Job_Scheduling'],
  },
];

export const loaders: Record<string, () => Promise<AnyVizSpec>> = {
  kruskal: () => import('../specs/mst').then((m) => m.kruskal),
  prim: () => import('../specs/mst').then((m) => m.prim),
  'activity-selection': () => import('../specs/greedy').then((m) => m.activitySelection),
  'fractional-knapsack': () => import('../specs/greedy').then((m) => m.fractionalKnapsack),
  'huffman-coding': () => import('../specs/greedyCoding').then((m) => m.huffmanCoding),
  'job-scheduling': () => import('../specs/greedyCoding').then((m) => m.jobSchedulingDeadline),
  'job-scheduling-edf': () => import('../specs/greedyCoding').then((m) => m.jobSchedulingEdf),
  'job-scheduling-smith': () => import('../specs/greedyCoding').then((m) => m.jobSchedulingSmith),
};
