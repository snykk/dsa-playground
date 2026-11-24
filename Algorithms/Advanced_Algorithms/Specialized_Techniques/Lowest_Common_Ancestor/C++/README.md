# Lowest Common Ancestor -- C++ Implementation

Binary lifting and the Euler tour with a sparse table, on a tree given by its edges and a root. See the [topic README](../README.md) for the idea and a trace.

## Files

| File | Contents |
|------|----------|
| `lowest_common_ancestor.cpp` | `RootedTree`, `rootedTree`, `BinaryLiftingLCA`, `EulerTourLCA` and a demo `main()` (compiled out with `-DIS_TEST_BUILD`) |
| `lowest_common_ancestor_test.cpp` | assert-based tests: the tables of the 10-node tree as the Python code computes them; both classes against a naive LCA on every labelled tree with up to 6 nodes and on 300 random trees; a star, one node, two nodes, a path of 100,000 nodes; invalid input |

## API

| Member | Description |
|--------|-------------|
| `RootedTree rootedTree(int n, const std::vector<std::pair<int, int>>& edges, int root)` | `adj`, `parent`, `depth`, breadth-first; throws `std::invalid_argument` unless the edges form one tree on `0..n-1` |
| `BinaryLiftingLCA(int n, const std::vector<std::pair<int, int>>& edges, int root = 0)` | builds `up`, O(n log n) |
| `int lca(int u, int v) const` | O(log n) |
| `int distance(int u, int v) const` | edges on the path, O(log n) |
| `int kthAncestor(int v, int k) const` | the node k levels above v, -1 when `k > depth(v)`, O(log n) |
| `levels()`, `depth()`, `parent()`, `up()` | the table and its inputs, by const reference |
| `EulerTourLCA(int n, const std::vector<std::pair<int, int>>& edges, int root = 0)` | builds the tour and the sparse table, O(n log n) |
| `int lca(int u, int v) const`, `int distance(int u, int v) const` | O(1) |
| `depth()`, `parent()`, `euler()`, `first()`, `sparse()` | the tour and the table, by const reference |

A node outside `0..n-1` throws `std::out_of_range`; `kthAncestor` with `k < 0` throws `std::invalid_argument`.

## C++-Specific Notes

- The walks use a `std::vector` as the queue or the stack, so a path of 100,000 nodes needs no deep call stack; the test builds both classes on one, and CI runs it again under AddressSanitizer and UndefinedBehaviorSanitizer.
- `bitLength` counts bits with an integer loop instead of `std::log2`.
- Node numbers and depths are `int`; the tables hold about `n log n` of them.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD lowest_common_ancestor_test.cpp -o test && ./test
g++ -std=c++17 -O2 lowest_common_ancestor.cpp -o demo && ./demo
```

## Key Takeaways

- The root is its own parent in `up`, so no entry is -1 and no jump needs a check.
- `EulerTourLCA::lca` is two table reads after one bit count.
