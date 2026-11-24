# Lowest Common Ancestor -- Python Implementation

Binary lifting and the Euler tour with a sparse table, on a tree given by its edges and a root. See the [topic README](../README.md) for the idea and a trace.

## Files

| File | Contents |
|------|----------|
| `lowest_common_ancestor.py` | `rooted_tree`, `BinaryLiftingLCA`, `EulerTourLCA` and a demo `main()` |
| `lowest_common_ancestor_test.py` | the tables of the 10-node tree; both classes against a naive LCA on every labelled tree with up to 6 nodes (every root, every pair, every k) and on 300 random trees; a star, one node, two nodes, a path of 100,000 nodes; invalid input |

## API

| Call | Result | Time |
|------|--------|------|
| `rooted_tree(n, edges, root)` | `(adj, parent, depth)`, breadth-first; `ValueError` unless the edges form one tree on `0..n-1` | O(n) |
| `BinaryLiftingLCA(n, edges, root=0)` | builds `up`; attributes `parent`, `depth`, `levels`, `up` (`up[k][v]`, the 2^k-th ancestor) | O(n log n) |
| `.lca(u, v)` | the lowest common ancestor | O(log n) |
| `.distance(u, v)` | edges on the path from u to v | O(log n) |
| `.kth_ancestor(v, k)` | the node k levels above v, v for k = 0, -1 when `k > depth[v]` | O(log n) |
| `EulerTourLCA(n, edges, root=0)` | builds the tour; attributes `parent`, `depth`, `euler`, `first`, `sparse` (`sparse[k][i]`, the shallowest node of `euler[i .. i + 2^k - 1]`) | O(n log n) |
| `.lca(u, v)` | the lowest common ancestor | O(1) |
| `.distance(u, v)` | edges on the path from u to v | O(1) |

A node outside `0..n-1` raises `IndexError` (negative ones too, so -1 does not wrap to the last node); `kth_ancestor` with `k < 0` raises `ValueError`. `EulerTourLCA` has no `kth_ancestor`.

## Python-Specific Notes

- Every walk is a loop: the breadth-first walk keeps a head index into a list, and the Euler tour keeps a stack and a next-neighbour pointer per node. A path of 100,000 nodes passes Python's default recursion limit of 1000 by far; the test builds both classes on one.
- `levels` and the window size come from `int.bit_length()`, not from `math.log2`.
- `sparse[k]` holds only the windows that fit, so each row is shorter than the one before; the [Sparse Table](../../../../../Data_Structures/Non_Linear/Trees/Sparse_Table/) topic stores `table[i][j]` with unused cells instead.
- The edges are read once and not kept.

## How to Run

```bash
cd "Algorithms/Advanced_Algorithms/Specialized_Techniques/Lowest_Common_Ancestor/Python"
python3 -m unittest lowest_common_ancestor_test
python3 lowest_common_ancestor.py
```

## Key Takeaways

- Binary lifting: lift the deeper node, then jump both while their ancestors differ.
- Euler tour: the LCA is the shallowest node between the first visits of u and v.
- `distance(u, v) = depth[u] + depth[v] - 2 * depth[lca(u, v)]`.
