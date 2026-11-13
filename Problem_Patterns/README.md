# Problem Solving Patterns

A pattern is a reusable shape of solution that a problem statement gives away. The thirteen patterns here differ in the signal that suggests them, such as a sorted array, a window, a range query, a yes/no check or a small n, and in the cost they remove.

## Topics

Read them in this order.

| # | Topic | What it adds | Level |
|---|-------|--------------|-------|
| 1 | [Two Pointers](Two_Pointers/) | Two indices replace a nested loop. Each step proves one end useless, so it moves and never comes back. | Beginner |
| 2 | [Sliding Window](Sliding_Window/) | Keep a contiguous range and move both ends forward, updating the answer instead of recomputing it. | Beginner |
| 3 | [Prefix Sum and Difference Array](Prefix_Sum_Difference_Array/) | Running totals answer range sums in O(1). Their inverse applies range updates in O(1). | Beginner |
| 4 | [Binary Search on Answer](Binary_Search_on_Answer/) | Binary search the range of answers when a yes/no check flips once, then verify each guess greedily. | Intermediate |
| 5 | [Monotonic Stack](Monotonic_Stack/) | Pop everything that breaks the order before each push. Each pop gives the popped element its nearest greater or smaller neighbour. | Intermediate |
| 6 | [Monotonic Queue](Monotonic_Queue/) | A deque kept in sorted order puts the maximum or minimum of a sliding window at its front. | Intermediate |
| 7 | [Union-Find Applications](Union_Find_Applications/) | Track groups that only merge. Union reports whether two items were already joined, which finds cycles and components. | Intermediate |
| 8 | [Graph Traversal Problems](Graph_Traversal_Problems/) | Grids, prerequisites and mazes as graphs. BFS, DFS and Kahn's algorithm visit each vertex and edge once. | Intermediate |
| 9 | [Bit Manipulation](Bit_Manipulation/) | Work on the binary digits of an integer. A few identities replace loops, and one mask can stand for a subset. | Intermediate |
| 10 | [Coordinate Compression](Coordinate_Compression/) | Replace values up to 10^9 by their ranks so that an array or a Fenwick tree can index them. | Intermediate |
| 11 | [DP Problem Patterns](DP_Problem_Patterns/) | The recipe for any DP (state, transition, order, base case), with knapsack, LCS and LIS as examples. | Intermediate |
| 12 | [Inclusion-Exclusion Principle](Inclusion_Exclusion_Principle/) | Count elements that satisfy at least one condition by adding, subtracting and adding back overlaps over 2^k subsets. | Intermediate |
| 13 | [Meet in the Middle](Meet_in_the_Middle/) | Split a 2^n search into two halves of 2^(n/2) and join them by sorting or hashing. The advanced pattern. | Advanced |

Each pattern has Python, C++ and Go code with tests.

## How They Compare

| Pattern | Time | Extra space | Cost driver |
|---------|------|-------------|-------------|
| Two pointers | O(n) | O(1) | each pointer moves at most n steps; three sum is O(n^2) |
| Sliding window | O(n) | O(1) to O(k) | a running sum, or a frequency map for variable windows |
| Prefix sum, difference array | O(n) build, O(1) per operation | O(n) | one pass; an updated array costs one more pass |
| Binary search on answer | O(C log R) | O(1) | C is the cost of one check, R the size of the answer range |
| Monotonic stack | O(n) | O(n) | each index is pushed once and popped once |
| Monotonic queue | O(n) | O(k) | each index enters and leaves the deque once |
| Union-find | O(alpha(n)) amortized | O(n) | with union by rank and path compression |
| Graph traversal | O(V + E) | O(V) | each vertex and edge once; a grid is O(R * C) |
| Bit manipulation | O(1) per operation | O(1) | all subsets is O(n * 2^n) |
| Coordinate compression | O(n log n) build | O(k) | sorting the k distinct values |
| DP patterns | knapsack O(N * W), LCS O(N * M), LIS O(N log N) | O(W), O(min(N, M)), O(N) | states times work per state |
| Inclusion-exclusion | O(2^k) terms | O(1) to O(s) | one term per non-empty subset of the k conditions |
| Meet in the middle | O(2^(n/2) * n) | O(2^(n/2)) | the stored sums of one half |

These are not best, average and worst cases. Most patterns have one bound that holds on every input.

## Choosing One

Several patterns can fit one problem, and they often combine. Binary search on the answer uses a greedy check, and sometimes a two-pointer check inside it.

| If the statement says | Try | Why |
|-----------------------|-----|-----|
| a sorted array and a target sum | Two pointers | the sum tells you which end to move |
| longest or shortest substring with at most k of something | Sliding window | shrinking a valid window keeps it valid |
| a fixed window size k and its maximum | Monotonic queue | the front of the deque is the maximum |
| the next greater element, or the largest rectangle | Monotonic stack | a pop hands the popped element its answer |
| many sum queries on an array that does not change | Prefix sum | each query is one subtraction |
| many range additions, then one read of the array | Difference array | two writes per update and one final sweep |
| updates and queries mixed together | Fenwick or segment tree | prefix sums and difference arrays need static or offline data |
| the smallest capacity so that a plan fits | Binary search on answer | feasibility flips once as the capacity grows |
| groups that only merge, or the first edge that closes a cycle | Union-find | union tells you whether two items were already joined |
| fewest steps in a grid or a graph without weights | Graph traversal | BFS counts edges layer by layer |
| values up to 10^9 and a Fenwick tree | Coordinate compression | only the order of the values matters |
| count the numbers divisible by a, b or c | Inclusion-exclusion | add the sets and subtract the overlaps |
| n is about 40 and the values are large | Meet in the middle | two halves of 2^20 sums are small, 2^40 is not |

## Common Pitfalls

- Forcing a pattern without its precondition. Opposite-end two pointers need a sorted or monotone array, a sliding window needs monotone validity, and binary search on the answer needs a check that flips once.
- Using prefix sums when updates and queries mix. They are static or offline tools; use a Fenwick tree or a segment tree for online updates.
- Treating union-find as reversible. It only merges; it cannot split a group or delete an edge.
- Using BFS on a weighted graph. BFS counts edges, not weights, so its distances are wrong when edges differ in cost.
- Guessing the cost of 2^n. Bitmask enumeration is practical for about 20 to 25 items, and meet in the middle stretches that to about 30 to 45.

## Related

- [Array](../Data_Structures/Linear/Array/): read first.
- [Big-O Notation](../Complexity_Analysis/Time_Complexity/Big_O_Notation/): read first.
- [Dynamic Programming Algorithms](../Algorithms/Dynamic_Programming/): the full DP topics behind the DP patterns.
- [Greedy Algorithms](../Algorithms/Greedy/): binary search on the answer pairs with a greedy check.
- [Graph Algorithms](../Algorithms/Graph_Algorithms/): the full traversal, shortest path and spanning tree topics.
- [Optimization Techniques](../Utilities/Optimization_Techniques/): Bitmasking builds on Bit Manipulation, and Precomputation on prefix sums.
