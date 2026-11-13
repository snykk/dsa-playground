# Algorithms

Twelve areas that group the repository's algorithms by the problem they solve or the technique they use. Some answer one question each, such as sorting and searching, and others are paradigms, such as greedy, dynamic programming and divide and conquer, that you apply to many problems. In all, 81 topics, each with Python, C++ and Go code.

## Topics

| # | Section | What it adds | Level |
|---|---------|--------------|-------|
| 1 | [Sorting Algorithms](Sorting/) | Nine sorts from O(n^2) bubble sort to O(n log n) merge, quick and heap sort, and counting, radix and bucket sort for bounded keys. | 9 topics |
| 2 | [Searching Algorithms](Searching/) | Linear, binary, ternary and interpolation search. Binary search is the one to master. | 4 topics |
| 3 | [Divide and Conquer Algorithms](Divide_and_Conquer/) | Split, solve, combine. Holds Strassen's matrix multiplication. Merge sort, quick sort and binary search live in Sorting and Searching. | 1 topic |
| 4 | [Greedy Algorithms](Greedy/) | Make the best local choice and never revisit it. Activity selection, Huffman coding, fractional knapsack and job scheduling. | 4 topics |
| 5 | [Dynamic Programming Algorithms](Dynamic_Programming/) | Solve each subproblem once. Basic, linear, 2D and advanced DP, and the Convex Hull Trick for DP optimization. | 14 topics |
| 6 | [Graph Algorithms](Graph_Algorithms/) | Traversal with BFS and DFS, shortest paths, minimum spanning trees, and advanced topics such as flow and strongly connected components. | 15 topics |
| 7 | [String Algorithms](String_Algorithms/) | Pattern matching with naive, Rabin-Karp, KMP and Boyer-Moore, then Z, Aho-Corasick, suffix arrays and palindromes. | 9 topics |
| 8 | [Mathematical Algorithms](Mathematical_Algorithms/) | Number theory, such as gcd, sieves and modular power, and advanced math, namely FFT and matrix exponentiation. | 8 topics |
| 9 | [Advanced Algorithms](Advanced_Algorithms/) | Backtracking (N-Queens, Sudoku, graph coloring, rat in a maze) and specialized techniques such as HLD, Mo's algorithm and decompositions. | 8 topics |
| 10 | [Computational Geometry](Computational_Geometry/) | Points, lines and circles first, then convex hull, closest pair of points and rotating calipers. | 5 topics |
| 11 | [Randomized Algorithms](Randomized_Algorithms/) | Randomness for speed or for streams. Randomized quickselect and reservoir sampling. | 2 topics |
| 12 | [Coding Theory](Coding_Theory/) | Error-correcting codes. Arithmetic in the Galois field GF(2^8), then Reed-Solomon codes built on it. | 2 topics |

Every folder answers one of two questions. Some answer what problem you are solving (sorting, searching, shortest paths, pattern matching). Others answer how you solve it (greedy, dynamic programming, divide and conquer, randomization, backtracking). The first kind is a toolbox for a known problem, the second a method for a new one.

## How They Compare

| Area | Question or method | Examples | A cost to remember |
|------|--------------------|----------|--------------------|
| Sorting | put items in order | merge, quick, heap, counting, radix, bucket sort | O(n log n) for the efficient comparison sorts |
| Searching | find an item | linear and binary search | O(log n) for binary search on sorted data |
| Divide and Conquer | split, solve, combine | Strassen, and the sorts and searches above | depends on the recurrence |
| Greedy | best local choice, never revisited | activity selection, Huffman, job scheduling | O(n log n) for activity selection and Huffman |
| Dynamic Programming | each subproblem once | Fibonacci, knapsack, LCS, edit distance, bitmask DP | states times work per state |
| Graph Algorithms | paths, trees, order, flow | BFS, DFS, Dijkstra, Kruskal, topological sort | O(V + E) for BFS and DFS |
| String Algorithms | find and compare text | KMP, Z, Aho-Corasick, suffix array | O(n + m) for KMP |
| Mathematical | numbers and matrices | Euclid, sieve, modular power, FFT | O(log min(a, b)) for Euclid |
| Advanced | search with pruning, or decomposition | backtracking, Mo, HLD, centroid | exponential in the worst case for backtracking |
| Computational Geometry | points, lines, shapes | convex hull, closest pair | varies by problem |
| Randomized | randomness for speed or streams | quickselect, reservoir sampling | O(n) expected for quickselect |
| Coding Theory | error-correcting codes | GF(2^8), Reed-Solomon | varies by code |

No comparison sort beats Omega(n log n). Most areas hold many costs; this table gives one per area.

## Where to Start

The [study guide](../STUDY_GUIDE.md) orders these areas by difficulty:

1. **Foundations.** [Sorting](Sorting/) and [Searching](Searching/): the O(n^2) sorts, merge sort, quick sort, linear search and binary search.
2. **Core.** Graph traversal with BFS, DFS and topological sort in [Graph Algorithms](Graph_Algorithms/), once you know the graph structures.
3. **Problem solving.** [Greedy](Greedy/), then the basics of [Dynamic Programming](Dynamic_Programming/): Fibonacci, Kadane, LIS, coin change, LCS, edit distance and knapsack.
4. **Advanced.** Shortest paths, minimum spanning trees, advanced graphs, the [String Algorithms](String_Algorithms/) beyond pattern matching, and advanced DP.
5. **Competitive extras.** Decompositions in [Advanced Algorithms](Advanced_Algorithms/), FFT and matrix exponentiation, [geometry](Computational_Geometry/), [randomized algorithms](Randomized_Algorithms/), and the DP optimizations.

You can skip an area you already know. The order inside an area matters more than the order of the areas.

## Common Pitfalls

- Looking for Merge Sort under Divide and Conquer. It lives in Sorting, and Quick Sort and Binary Search live in Sorting and Searching.
- Treating greedy as always correct. A greedy choice needs proof; when it fails, dynamic programming is the usual fallback.
- Skipping the data structures. Dijkstra needs a heap, Kruskal needs union-find and Aho-Corasick needs a trie.
- Reading an area by name only. Advanced Algorithms holds backtracking and specialized techniques, which are not the same thing.

## Related

- [Complexity Analysis](../Complexity_Analysis/): read first.
- [Array](../Data_Structures/Linear/Array/): read first.
- [Data Structures](../Data_Structures/): the heaps, union-find and tries that many algorithms here use.
- [Problem Solving Patterns](../Problem_Patterns/): reusable solution shapes such as two pointers and sliding window.
- [Competitive Programming Utilities](../Utilities/): templates, optimization techniques and problem types.
