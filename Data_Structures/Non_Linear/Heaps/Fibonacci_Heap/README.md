# Fibonacci Heap

A Fibonacci heap is a priority queue made of a lazy forest of min-heap-ordered trees. Insert and merge are O(1), decrease-key is O(1) amortized, and extract-min and delete are O(log n) amortized. That cheap decrease-key is what brings Dijkstra's and Prim's algorithms down to O(E + V log V). The three implementations here have the full set of operations: `insert` (which returns a handle to the new node), `extract_min`, `peek`, `decrease_key`, `delete`, `merge`, `size`, `is_empty` and `clear`.

## Intuition

A binary heap repairs itself after every operation. A Fibonacci heap procrastinates: inserting just puts a new one-node tree into a circular list of roots, and merging two heaps just joins their two lists. All the tidying is deferred to `extract_min`, which merges trees of equal degree so that the root list shrinks back to O(log n) entries.

Decrease-key is just as lazy. When a node's new key is smaller than its parent's, the node is cut off with its whole subtree and becomes a new root: no sifting at all. To keep the trees from getting thin, a node may lose only one child. The first loss sets its `marked` flag; on the second loss it is cut as well, and the check moves up to its parent (a cascading cut).

The invariants:

- every tree is heap ordered (a parent is `<=` its children), and `min_node` points at the smallest root, which is therefore the global minimum;
- a root is never marked, and a non-root node has lost at most one child since it was linked under its parent;
- because of the second rule, a node of degree d roots at least `F(d+2)` nodes (Fibonacci numbers, hence the name), so no degree exceeds `log_phi(n)`, about `1.44 log2(n)`.

## Visual

Insert `0` to `8`, extract the minimum, then decrease 8 to 0 (real run of the Python code):

```text
root list (circular, doubly linked):   [0] <-> [1] <-> (back to 0)

   0            1                min_node = 0
              / | \
             2  5  3             * = marked: 7 lost its child 8,
               / \  \                which was cut to the root list
              6   7* 4

each node: key, degree, parent, child, left, right, marked, in_heap
```

## Operations

| Operation | What it does | Time |
| --- | --- | --- |
| `insert(key)` | splice a one-node tree into the root list, update `min_node`, return the node as a handle | O(1) |
| `peek()` | return the minimum key | O(1) |
| `extract_min()` | promote the minimum's children, unlink it, consolidate | O(log n) amortized |
| `decrease_key(handle, k)` | lower the key; cut the node if it now beats its parent, then cascading cuts | O(1) amortized |
| `delete(handle)` | cut the node like a decreased one, make it `min_node`, extract it | O(log n) amortized |
| `merge(other)` | splice the other heap's root list into this one and empty the other | O(1) |
| `size()`, `is_empty()` | counter / pointer check | O(1) |
| `clear()` | flag every node as removed, drop everything | O(n) |

### Handles

A handle is the caller's reference to one node: `insert` returns it, and `decrease_key` and `delete` take it, so the heap never has to search for a key. In Python and Go the handle is the node itself; in C++ it is a small `FibonacciHeapHandle` object that shares ownership of the node. In all three languages:

- a handle is **stale** once its node has left the heap, through `extract_min`, `delete` or `clear`. The node records this in its `in_heap` flag, and `decrease_key` and `delete` reject a stale handle with an error (`ValueError` in Python, `std::invalid_argument` in C++, a panic in Go) and change nothing. A missing handle (`None`, an empty C++ handle, a Go `nil`) is rejected the same way;
- a stale handle stays safe to hold and to read: its key is still there, and in C++ it keeps the node alive even after the heap is destroyed;
- after `a.merge(b)`, the handles of `b`'s nodes belong to `a`, and `b` is empty but usable;
- a handle passed to a heap that does not hold its node is not detected (that check would cost more than O(1)), and it leaves both heaps broken: only pass a handle to the heap it came from, or to the heap that heap was merged into.

### Extract-min and consolidation

Every child of the minimum becomes a root and loses its mark. Then consolidation walks the root list with a table indexed by degree. Whenever two trees of the same degree meet, the one with the larger root becomes a child of the other (it is linked), and the degree goes up by one. A linked node is unmarked too.

### Decrease-key and cascading cuts

`decrease_key(handle, k)` raises an error if `k` is larger than the current key (an equal key is allowed and changes nothing). Otherwise it sets the key, and if the node now beats its parent it is **cut**: removed from the parent's child list, added to the root list with its subtree, unmarked. Then comes the **cascading cut** on the parent: an unmarked non-root parent is marked and the walk stops; a marked parent has now lost two children, so it is cut too, and the walk continues with its own parent. A root is never marked, so the walk stops there.

### Delete without a sentinel

The textbook deletes a node by decreasing its key to minus infinity and extracting the minimum. That needs a key smaller than every real key: a Python tuple has none, and a C++ `int` key may itself be `INT_MIN`. So `delete` does the same steps without writing a key: it cuts the node and cascades exactly as `decrease_key` would, sets `min_node` to the node, and calls `extract_min`.

### Merge

The other heap's circular root list is spliced in right after `min_node` with four pointer writes, `min_node` moves if the other minimum is smaller, the counts add up, and the other heap is left empty. Merging a heap with itself is an error.

### Order of equal keys

Which of several equal keys comes out first decides which handle turns stale, so the order is fixed, and the C++ and Go tests pin the trees that Python builds on the same script:

- `insert`, a cut and a promoted child are spliced in right after `min_node`; `merge` splices the other list there, starting at its `min_node`;
- `min_node` moves only to a strictly smaller key, so the earlier of equal minimums stays;
- in consolidation, on equal keys the tree already in the degree table becomes the child, and the new `min_node` is the first smallest root in the order the table received its trees.

## Step-by-Step Trace

Insert `5, 3, 7, 1, 9, 2, 8`, then extract twice (real run of the Python code):

| Step | Roots after the step | Minimum |
| --- | --- | --- |
| after 7 inserts | seven single nodes | 1 |
| `extract_min()` returns 1 | `2(8, 7(9))`, `3(5)` | 2 |
| `extract_min()` returns 2 | `3(5, 7(9))`, `8` | 3 |

In the second extraction, 8 and `7(9)` are promoted, then `3(5)` and `7(9)` (both degree 1) are linked under 3.

A cascading cut: insert `0` to `8` and extract 0, which leaves one tree, then lower three keys (`*` = marked, roots listed from `min_node`):

| Step | Roots after the step | Cuts so far |
| --- | --- | --- |
| `extract_min()` returns 0 | `1(2, 5(6, 7(8)), 3(4))` | 0 |
| `decrease_key(h8, 0)` | `0`, `1(2, 5(6, 7*), 3(4))` | 1 |
| `decrease_key(h6, 3)` | `0`, `3`, `1(2, 5*(7*), 3(4))` | 2 |
| `decrease_key(h7, 1)` | `0`, `5`, `1`, `3`, `1(2, 3(4))` | 4 |

`h8` is the handle that `insert(8)` returned. Lowering 8 cuts it and marks its parent 7; lowering 6 cuts it and marks 5. Lowering 7 to 1 cuts 7 (clearing its mark), and its parent 5, already marked, has now lost two children: it is cut too. The walk stops at 1, a root.

## Complexity

| Operation | Time | Why |
| --- | --- | --- |
| insert, peek, merge | O(1) | a splice or a pointer read |
| extract min | O(log n) amortized | consolidation is paid by earlier inserts and cuts; at most `log_phi(n)` trees remain |
| decrease key | O(1) amortized | one cut, plus cascading cuts paid by earlier marks |
| delete | O(log n) amortized | a decrease-key plus an extract-min |
| clear | O(n) | each node is flagged once |

Space is O(n). The amortized proof uses the potential `Phi = trees + 2 * marked nodes`. A link lowers the number of trees by one, so consolidation is paid for by the trees that inserts, cuts and promotions created. A cut adds a tree but clears a mark, so each cascading cut is paid by the mark it removes, and `decrease_key` sets at most one new mark.

The tests count the work instead of timing it. After n inserts, a run of decreases (60%), deletes (10%) and extractions (30%) until the heap is empty makes 0.14 to 0.15 cuts per decrease or delete for every n from 1000 to 64000, while the links per extraction or delete grow slowly, from 6.1 to 10.5, as `log n` does. One `extract_min` can still cost O(n): the first one after 100000 inserts made 99989 links.

## When to Use

- Dijkstra and Prim on dense graphs: they call decrease-key up to E times but extract-min only V times, so a Fibonacci heap gives O(E + V log V) instead of O(E log V).
- When heaps must be merged often: merge is O(1), against O(n) for two binary heaps.
- To study amortized analysis: the potential function argument is the classic example.
- For real programs, a binary heap is almost always faster, because of its array layout.

Dijkstra with handles, one node per vertex (keys are `(distance, vertex)` tuples):

```python
handle = {v: heap.insert((dist[v], v)) for v in graph}
while not heap.is_empty():
    d, u = heap.extract_min()
    for v, w in graph[u]:
        if d + w < dist[v]:
            dist[v] = d + w
            heap.decrease_key(handle[v], (dist[v], v))
```

On the graph A->B (4), A->C (1), C->B (2), B->D (1), C->D (5) from A it returns `{A: 0, B: 3, C: 1, D: 4}` after five `decrease_key` calls and four extractions. A settled vertex is never decreased again, because its distance cannot improve, so no stale handle is ever used.

## Fibonacci Heap vs. Binary Heap

| | Fibonacci heap | Binary heap |
| --- | --- | --- |
| Insert | O(1) | O(log n) worst case |
| Extract min | O(log n) amortized | O(log n) |
| Decrease key | O(1) amortized, through a handle | O(log n), with a map from items to array positions |
| Merge | O(1) | O(n) |
| Memory | pointer-based nodes | one array |
| Simplicity | complex | simple |

## Common Pitfalls

- Thinking the O(1) insert is the main advantage; decrease-key is.
- Treating amortized O(log n) as a worst-case bound.
- Skipping the cascading cut: the trees can then thin out, and the `F(d+2)` bound on sizes no longer holds (the invariant checks of the Python tests catch it).
- Keeping a mark when a node becomes a root or is linked under a new parent: it would then be cut on its first lost child there, not its second.
- Deleting with a sentinel key the key type may not have; cut the node and make it the minimum instead.
- Using a handle after its node was extracted or deleted: all three languages reject it.
- Walking a tree recursively: a crafted sequence makes one tree a path of n nodes (1000 rounds gave a path of 1001 nodes), so `clear` uses an explicit stack.
- Copying a C++ heap: its nodes are linked through raw pointers, so copy is deleted.
- Calling `peek` or `extract_min` on an empty heap (error in all three languages).

## Implementations

| Language | Folder | Main file | Notes |
| --- | --- | --- | --- |
| Python | [Python](Python/) | `fibonacci_heap.py` | any comparable keys; the handle is the node; `IndexError` on empty, `ValueError` for a stale handle, a larger key or a self-merge |
| C++ | [C++](C++/) | `fibonacci_heap.cpp` | `int` keys; `FibonacciHeapHandle`; `erase` instead of `delete` (a keyword); `std::runtime_error` on empty, `std::invalid_argument` otherwise; copy deleted |
| Go | [Go](Go/) | `main.go` | `int` keys; the handle is `*FibonacciHeapNode`; panics with the same messages |

## Practice Problems

- [Network Delay Time (LeetCode 743)](https://leetcode.com/problems/network-delay-time/) - Dijkstra with one handle per node and `decrease_key` when a distance improves.
- [Min Cost to Connect All Points (LeetCode 1584)](https://leetcode.com/problems/min-cost-to-connect-all-points/) - Prim on a complete graph of up to 1000 points, the dense case decrease-key was made for.
- [Shortest Routes I (CSES 1671)](https://cses.fi/problemset/task/1671) - Dijkstra on 10^5 cities; distances reach about 10^14, so the keys must be 64-bit.
- [Sliding Window Maximum (LeetCode 239)](https://leetcode.com/problems/sliding-window-maximum/) - insert each number with a negated key, `delete` the handle of the one leaving the window, `peek`.
- [Sliding Window Median (LeetCode 480)](https://leetcode.com/problems/sliding-window-median/) - two heaps; `delete` by handle when a number leaves, rebalance with `extract_min` and `insert`.

No judge needs a Fibonacci heap; a binary heap passes all of these.

## Related

- [Min Heap](../Min_Heap/)
- [Max Heap](../Max_Heap/)
- [Priority Queue](../../../Linear/Queue/Priority_Queue/)
- [Dijkstra's Algorithm](../../../../Algorithms/Graph_Algorithms/Shortest_Path/Dijkstras_Algorithm/)
- [Prim's Algorithm](../../../../Algorithms/Graph_Algorithms/Minimum_Spanning_Tree/Prims_Algorithm/)
