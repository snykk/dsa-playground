# Advanced Algorithms

Two groups of techniques for problems that a plain loop cannot solve fast enough. Backtracking searches a space of candidates and drops dead ends early. Specialized techniques cut an array or a tree into pieces so that many queries stay cheap.

## Topics

Read them in this order.

| # | Section | What it covers | Level |
|---|---------|----------------|-------|
| 1 | [Backtracking Algorithms](Backtracking/) | Choose, check, recurse, undo. Maze, N-Queens, Graph Coloring and Sudoku, with pruning that removes dead branches. | 4 topics |
| 2 | [Specialized Techniques](Specialized_Techniques/) | Square root blocks, Mo's offline queries, heavy-light chains and centroid levels, for range and tree queries. | 4 topics |

The two sub-areas are independent and have almost nothing in common in code. The only shared background is a depth-first search and some recursion.

## How They Compare

| Sub-area | Typical question | Core idea | Cost shape |
|----------|------------------|-----------|------------|
| Backtracking | is there a valid arrangement, and what is one? | extend a partial solution and undo it when a rule breaks | exponential in the worst case, far less with pruning |
| Specialized Techniques | what is the answer for this range or this tree path? | precompute pieces and combine a few per query | polynomial: O(sqrt n), O((N + Q) sqrt N), O(log n) |

## Where to Start

1. Read Backtracking first if the recursion pattern is new. Start with Rat in a Maze, then N-Queens, Graph Coloring and Sudoku.
2. Read Specialized Techniques from the array side. Square root decomposition comes first, Mo's algorithm second.
3. Then take the tree side: heavy-light decomposition, then centroid decomposition.

| If the problem says | Look at | Why |
|---------------------|---------|-----|
| find any arrangement that satisfies the rules | Backtracking | a search with undo, no formula needed |
| count or find all solutions of a small puzzle | Backtracking | it visits every branch when asked to |
| many range queries on one array | Specialized Techniques | blocks or an offline order beat a scan per query |
| many path queries on one tree | Specialized Techniques | chains or centroids cut a path into a few pieces |
| overlapping subproblems with a clear recurrence | [Dynamic Programming](../Dynamic_Programming/) | stored answers beat repeated search |

## Related

- [DFS](../Graph_Algorithms/Traversal/DFS/): read first.
- [Divide and Conquer](../Divide_and_Conquer/): both sub-areas cut a problem into parts.
- [Dynamic Programming](../Dynamic_Programming/): the better tool when subproblems overlap.
- [Segment Tree](../../Data_Structures/Non_Linear/Trees/Segment_Tree/): the O(log n) alternative to the range techniques here.
