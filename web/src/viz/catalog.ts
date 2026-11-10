/**
 * Which interactive visualizations exist and which repository folders show them.
 * Pure data (no React) so Astro pages can import it at build time cheaply;
 * the specs themselves are code-split and loaded by VizMount on demand.
 */
export type VizGroup = 'Sorting' | 'Graphs' | 'Trees' | 'Strings' | 'Dynamic Programming' | 'Coding Theory';

export interface VizInfo {
  id: string;
  title: string;
  group: VizGroup;
  blurb: string;
  /** Repo-relative folders whose page embeds this visualization (first = home topic). */
  topics: string[];
}

export const VIZ_GROUP_ORDER: VizGroup[] = ['Sorting', 'Graphs', 'Trees', 'Strings', 'Dynamic Programming', 'Coding Theory'];

export const VIZ_CATALOG: VizInfo[] = [
  {
    id: 'bubble-sort',
    title: 'Bubble Sort',
    group: 'Sorting',
    blurb: 'Adjacent swaps carry the largest remaining value to the end of every pass.',
    topics: ['Algorithms/Sorting/Bubble Sort', 'Algorithms/Sorting'],
  },
  {
    id: 'insertion-sort',
    title: 'Insertion Sort',
    group: 'Sorting',
    blurb: 'Each new value slides left until it meets a smaller one, growing a sorted prefix.',
    topics: ['Algorithms/Sorting/Insertion Sort', 'Algorithms/Sorting'],
  },
  {
    id: 'selection-sort',
    title: 'Selection Sort',
    group: 'Sorting',
    blurb: 'Scan for the minimum of the unsorted part and swap it into place.',
    topics: ['Algorithms/Sorting/Selection Sort', 'Algorithms/Sorting'],
  },
  {
    id: 'merge-sort',
    title: 'Merge Sort',
    group: 'Sorting',
    blurb: 'Split in half, sort each half, then merge two sorted runs by repeatedly taking the smaller head.',
    topics: ['Algorithms/Sorting/Merge Sort', 'Algorithms/Divide_and_Conquer/Merge Sort', 'Algorithms/Sorting'],
  },
  {
    id: 'quick-sort',
    title: 'Quick Sort',
    group: 'Sorting',
    blurb: 'Lomuto partition puts the pivot in its final place, then recurses on both sides.',
    topics: ['Algorithms/Sorting/Quick Sort', 'Algorithms/Divide_and_Conquer/Quick Sort', 'Algorithms/Sorting'],
  },
  {
    id: 'heap-sort',
    title: 'Heap Sort',
    group: 'Sorting',
    blurb: 'Build a max-heap in place, then repeatedly move the root to the end and sift down.',
    topics: ['Algorithms/Sorting/Heap Sort', 'Algorithms/Sorting'],
  },
  {
    id: 'bfs',
    title: 'Breadth-First Search',
    group: 'Graphs',
    blurb: 'A FIFO queue explores the graph in rings of equal hop distance.',
    topics: ['Algorithms/Graph_Algorithms/Traversal/BFS', 'Algorithms/Graph_Algorithms/Traversal'],
  },
  {
    id: 'dfs',
    title: 'Depth-First Search',
    group: 'Graphs',
    blurb: 'Go as deep as possible, backtrack only when a vertex has no unvisited neighbors.',
    topics: ['Algorithms/Graph_Algorithms/Traversal/DFS', 'Algorithms/Graph_Algorithms/Traversal'],
  },
  {
    id: 'dijkstra',
    title: "Dijkstra's Shortest Paths",
    group: 'Graphs',
    blurb: 'Always settle the closest unsettled vertex, then relax its outgoing edges.',
    topics: ["Algorithms/Graph_Algorithms/Shortest_Path/Dijkstra's_Algorithm", 'Algorithms/Graph_Algorithms/Shortest_Path'],
  },
  {
    id: 'bst',
    title: 'Binary Search Tree',
    group: 'Trees',
    blurb: 'Insert, search and delete by walking left or right; deletion uses the in-order successor.',
    topics: ['Data Structures/Non_Linear/Trees/Binary Search Tree'],
  },
  {
    id: 'avl',
    title: 'AVL Tree',
    group: 'Trees',
    blurb: 'Watch balance factors and the four rotation cases keep the height logarithmic.',
    topics: ['Data Structures/Non_Linear/Trees/AVL Tree'],
  },
  {
    id: 'kmp',
    title: 'Knuth-Morris-Pratt',
    group: 'Strings',
    blurb: 'Build the failure (LPS) table, then reuse it so the text pointer never moves backwards.',
    topics: ['Algorithms/String_Algorithms/Pattern_Matching/KMP Algorithm', 'Data Structures/Linear/String/Pattern Matching'],
  },
  {
    id: 'lcs',
    title: 'Longest Common Subsequence',
    group: 'Dynamic Programming',
    blurb: 'Fill the table from its three neighbors, then trace the answer back from the corner.',
    topics: ['Algorithms/Dynamic_Programming/2D DP/Longest Common Subsequence'],
  },
  {
    id: 'knapsack',
    title: '0/1 Knapsack',
    group: 'Dynamic Programming',
    blurb: 'Every cell decides skip-or-take for one item at one capacity.',
    topics: ['Algorithms/Dynamic_Programming/2D DP/0-1 Knapsack'],
  },
  {
    id: 'reed-solomon',
    title: 'Reed-Solomon Decoding',
    group: 'Coding Theory',
    blurb: 'Encode, corrupt, then watch syndromes, Berlekamp-Massey, Chien search and Forney repair the bytes.',
    topics: ['Algorithms/Coding_Theory/Reed_Solomon'],
  },
];

export function vizForTopic(rel: string): VizInfo[] {
  return VIZ_CATALOG.filter((v) => v.topics.includes(rel));
}

export function hasViz(rel: string): boolean {
  return VIZ_CATALOG.some((v) => v.topics.includes(rel));
}
