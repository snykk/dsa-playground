# Fibonacci Heap

A Fibonacci heap is a priority queue made of a lazy forest of min-heap-ordered trees. Insert is O(1), extract-min is O(log n) amortized, and the full textbook structure adds O(1) amortized decrease-key. This folder implements the lazy core only: insert, extract-min, peek, size, is-empty and clear. There is no `decrease_key`, `delete` or `merge`.

## Intuition

A binary heap repairs itself after every operation. A Fibonacci heap procrastinates: inserting just puts a new one-node tree into a circular list of roots. All the tidying is deferred to `extract_min`, which merges trees of equal degree so that the root list shrinks back to O(log n) entries.

The invariant: every tree is heap ordered (a parent is `<=` its children), and `min_node` points at the smallest root, which is therefore the global minimum.

## Visual

```text
root list (circular, doubly linked):   [2*] <-> [3] <-> (back to 2)

   2*                 3          * = min_node
  / \                 |
 8   7                5
     |
     9

each node: key, degree, parent, child, left, right, marked
```

## Operations

| Operation | What it does | Time |
| --- | --- | --- |
| `insert(key)` | splice a one-node tree into the root list, update `min_node` | O(1) |
| `peek()` | return the minimum key | O(1) |
| `extract_min()` | promote the minimum's children, unlink it, consolidate | O(log n) amortized |
| `size()`, `is_empty()` | counter / pointer check | O(1) |
| `clear()` | drop everything | O(1) in Python and Go, O(n log n) in C++ (repeated `extract_min`) |

Consolidation walks the root list with a table indexed by degree. Whenever two trees of the same degree meet, the one with the larger root becomes a child of the other, and the degree goes up by one.

## Step-by-Step Trace

Insert `5, 3, 7, 1, 9, 2, 8`, then extract twice (real run of the Python code):

| Step | Roots after the step | Minimum |
| --- | --- | --- |
| after 7 inserts | seven single nodes | 1 |
| `extract_min()` returns 1 | `2(8, 7(9))`, `3(5)` | 2 |
| `extract_min()` returns 2 | `3(5, 7(9))`, `8` | 3 |

In the second extraction, 8 and `7(9)` are promoted, then `3(5)` and `7(9)` (both degree 1) are linked under 3.

## Complexity

| Operation | This implementation | Textbook Fibonacci heap |
| --- | --- | --- |
| insert | O(1) | O(1) |
| extract min | O(log n) amortized | O(log n) amortized |
| decrease key | not implemented | O(1) amortized |
| merge | not implemented | O(1) |

Space is O(n). The amortized proof uses the potential `Phi = trees + 2 * marked nodes`: linking trees lowers the potential, which pays for consolidation. The degree of any node is O(log n); in the full structure a node of degree d roots at least `F(d+2)` nodes (Fibonacci numbers, hence the name). One `extract_min` can cost O(n) right after many inserts; only the average over a sequence is logarithmic.

## When to Use

- Use it to study amortized analysis or lazy data structures.
- The real benefit, O(1) amortized decrease-key (Dijkstra and Prim in O(E + V log V)), needs the full structure, which this repository does not contain.
- For real programs, a binary heap is almost always faster because of its array layout.

## Fibonacci Heap vs. Binary Heap

| | Fibonacci heap | Binary heap |
| --- | --- | --- |
| Insert | O(1) | O(log n) worst case |
| Extract min | O(log n) amortized | O(log n) |
| Decrease key | O(1) amortized (textbook) | O(log n) |
| Memory | pointer-based nodes | one array |
| Simplicity | complex | simple |

## Common Pitfalls

- Thinking the O(1) insert is the main advantage; decrease-key is.
- Treating amortized O(log n) as a worst-case bound.
- Forgetting to clear `parent` when promoting children to the root list.
- Copying a C++ heap: its nodes are raw pointers, so copy is deleted.
- Calling `peek` or `extract_min` on an empty heap (error in all three languages).

## Implementations

| Language | Folder | Main file | Notes |
| --- | --- | --- | --- |
| Python | [Python](Python/) | `fibonacci_heap.py` | raises `IndexError` on empty |
| C++ | [C++](C++/) | `fibonacci_heap.cpp` | throws `std::runtime_error`; copy deleted |
| Go | [Go](Go/) | `main.go` | panics on empty |

## Practice Problems

- [Merge k Sorted Lists (LeetCode 23)](https://leetcode.com/problems/merge-k-sorted-lists/) - insert and extract-min only.
- [Network Delay Time (LeetCode 743)](https://leetcode.com/problems/network-delay-time/) - Dijkstra, where a heap supplies the closest vertex.
- [Shortest Routes I (CSES 1671)](https://cses.fi/problemset/task/1671) - the standard priority-queue shortest-path exercise.
- [Min Cost to Connect All Points (LeetCode 1584)](https://leetcode.com/problems/min-cost-to-connect-all-points/) - Prim on a dense graph, the case decrease-key was made for.

No judge needs a Fibonacci heap; a binary heap passes all of these.

## Related

- [Min Heap](../Min_Heap/)
- [Max Heap](../Max_Heap/)
- [Priority Queue](../../../Linear/Queue/Priority_Queue/)
