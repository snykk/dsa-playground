# Specialized Techniques

Four ways to split a big structure into pieces that are cheap to combine. Square root decomposition and Mo's algorithm answer range queries on an array, heavy-light and centroid decomposition work on trees. They differ in what they answer, whether updates are allowed, and whether queries must be known in advance.

## Topics

Read them in this order.

| # | Topic | What it adds | Level |
|---|-------|--------------|-------|
| 1 | [Square Root Decomposition](Square_Root_Decomposition/) | Blocks of about sqrt(n) elements with one sum each. Range sums with point updates, answered online. | Intermediate |
| 2 | [Mo's Algorithm](Mos_Algorithm/) | Sort offline queries so a sliding window moves little. Counts distinct values per range, with no updates. | Advanced |
| 3 | [Heavy-Light Decomposition](Heavy_Light_Decomposition/) | Cut a tree into chains so any path crosses O(log n) of them. Gives the LCA and the segments of a path. | Advanced |
| 4 | [Centroid Decomposition](Centroid_Decomposition/) | Remove the centroid, recurse on the pieces and record who was removed inside whom. A second tree of height O(log n). | Advanced |

The first two work on an array and the last two on a tree. The two tree techniques are independent of the array ones.

## How They Compare

| Technique | Build | Query | Update | Extra space | Queries |
|-----------|-------|-------|--------|-------------|---------|
| Square root decomposition | O(n) | O(sqrt n) | O(1) for a point | O(sqrt n) plus a copy of the array | online |
| Mo's algorithm | O(Q log Q) to sort the queries | O((N + Q) sqrt N) for all of them | not supported | O(N + Q) | offline |
| Heavy-light decomposition | O(n) | O(log n) for LCA or the path segments | not in the code | O(n) | online |
| Centroid decomposition | O(n log n) | O(log n) per centroid ancestor in a typical use | not supported | O(n) | online, once built |

A heavy-light path query that also asks for a sum, with a segment tree over the positions, costs O(log^2 n). That segment tree is not part of this repository. Mo's algorithm needs an add or remove step of O(1); a slower step multiplies the total.

## Choosing One

| Situation | Use | Why |
|-----------|-----|-----|
| Range sums with point updates, and you want simple code | Square root decomposition | one array and one block-sum array; a segment tree or Fenwick tree is faster at O(log n) |
| Many range queries on a fixed array, statistic hard to merge | Mo's algorithm | only needs add and remove of one element; all queries must be known first |
| Path queries or the LCA on a fixed tree | Heavy-light decomposition | any path becomes O(log n) contiguous ranges of one array |
| Count paths of a given length, or nearest marked vertex | Centroid decomposition | every path passes through a centroid at some level, and the levels are O(log n) |
| Range sums with no updates | [Prefix Sum and Difference Array](../../../Problem_Patterns/Prefix_Sum_Difference_Array/) | O(n) build and O(1) per query, no decomposition needed |

## Common Pitfalls

- A block size of 0: `sqrt(0)` is 0 and `i // 0` fails. Both array topics use a minimum block size of 1.
- Mo's algorithm is offline and assumes the array never changes. Expand the window before shrinking it, or a count can go negative.
- Segment tree indexes in heavy-light decomposition are `pos[u]`, not the vertex id `u`.
- In centroid decomposition, recompute sizes for each piece and never walk back into a removed centroid.

## Related

- [Prefix Sum and Difference Array](../../../Problem_Patterns/Prefix_Sum_Difference_Array/): read first, for the array topics.
- [DFS](../../Graph_Algorithms/Traversal/DFS/): read first, for the tree topics.
- [Advanced Algorithms](../): the parent overview of both sub-areas.
- [Backtracking Algorithms](../Backtracking/): the other sub-area.
- [Divide and Conquer](../../Divide_and_Conquer/): the principle behind centroid decomposition.
- [Segment Tree](../../../Data_Structures/Non_Linear/Trees/Segment_Tree/): the O(log n) alternative for range queries, and the usual partner of heavy-light decomposition.
- [Fenwick Tree](../../../Data_Structures/Non_Linear/Trees/Fenwick_Tree/): the O(log n) alternative for range sums.
- [Two Pointers](../../../Problem_Patterns/Two_Pointers/): the window idea behind Mo's algorithm.
