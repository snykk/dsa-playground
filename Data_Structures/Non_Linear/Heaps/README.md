# Heaps

A heap gives fast access to the smallest or largest element and nothing more. The min and max heap are the same array-backed binary heap with opposite orders; the Fibonacci heap trades that array for a lazy forest so that insert and merge cost O(1) and decrease-key O(1) amortized.

## Topics

Read them in this order.

| # | Topic | What it adds | Level |
|---|-------|--------------|-------|
| 1 | [Min Heap](Min_Heap/) | The reference binary heap. A complete tree in an array with the smallest element at the root. | Intermediate |
| 2 | [Max Heap](Max_Heap/) | The mirror image. The largest element sits at the root, which is what in-place heap sort needs. | Intermediate |
| 3 | [Fibonacci Heap](Fibonacci_Heap/) | A lazy forest. Insert and merge are splices, extract-min links trees of equal degree, and decrease-key cuts a node loose in O(1) amortized. | Advanced |

The children of index `i` in the binary heaps sit at `2i + 1` and `2i + 2`, so no pointers are needed. The Fibonacci heap stores heap-ordered trees as linked nodes and postpones all tidying to extract-min. It has the full set of operations: `insert` returns a handle to the new node, `decrease_key` and `delete` take that handle, and `merge` takes a second heap. It has no build-from-array.

## How They Compare

| Operation | Min / max heap | Fibonacci heap |
|-----------|----------------|----------------|
| peek | O(1) | O(1) |
| insert | O(log n) | O(1) worst case |
| extract min / max | O(log n) | O(log n) amortized |
| build from an array | O(n) | not provided |
| decrease-key | not provided | O(1) amortized, through a handle |
| delete a given element | not provided | O(log n) amortized, through a handle |
| merge two heaps | not provided | O(1) |
| search for a value | O(n) | O(n) |
| extra space | the array, O(n) | O(n), four pointers per node |

Amortized means the bound holds over a whole sequence of operations. One Fibonacci `extract_min` right after n inserts can take O(n), because that is when the postponed linking happens.

## Choosing One

| Situation | Use | Why |
|-----------|-----|-----|
| A priority queue where the smallest comes first | Min Heap | O(1) peek, O(log n) insert and extract, no pointers |
| The largest comes first, or in-place heap sort | Max Heap | the root is the maximum, so a sorted tail grows at the end of the array |
| Many inserts and few extractions | Fibonacci Heap | insert is O(1), and the cost is paid only when you extract |
| Dijkstra or Prim with decrease-key | Fibonacci Heap | O(1) amortized decrease-key gives the textbook O(E + V log V); on real inputs a binary heap is usually faster |
| Heaps that are merged often | Fibonacci Heap | merge splices two root lists in O(1) |
| Everyday code | the standard library heap | `heapq`, `std::priority_queue` and `container/heap` are tested and fast in practice |

## Common Pitfalls

- Reading a heap's array in order does not give sorted output; only repeated extraction does.
- A heap does not order siblings, so searching for a value is O(n), not O(log n).
- Building by n inserts costs O(n log n). Bottom-up heapify from an array is O(n).
- The Fibonacci O(log n) extract is amortized; a single call can cost O(n).
- A Fibonacci handle is stale once its node was extracted, deleted or cleared; `decrease_key` and `delete` reject it.

## Related

- [Binary Tree](../Trees/Binary_Tree/): read first.
- [Big O Notation](../../../Complexity_Analysis/Time_Complexity/Big_O_Notation/): read first.
- [Priority Queue](../../Linear/Queue/Priority_Queue/): the interface that a heap implements.
- [Heap Sort](../../../Algorithms/Sorting/Heap_Sort/): repeated extraction from a max heap.
- [Dijkstra's Algorithm](../../../Algorithms/Graph_Algorithms/Shortest_Path/Dijkstras_Algorithm/): takes the closest unvisited vertex from a heap.
- [Prim's Algorithm](../../../Algorithms/Graph_Algorithms/Minimum_Spanning_Tree/Prims_Algorithm/): takes the cheapest crossing edge from a heap.
