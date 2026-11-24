# Lowest Common Ancestor -- Go Implementation

Binary lifting and the Euler tour with a sparse table, on a tree given by its edges and a root. See the [topic README](../README.md) for the idea and a trace.

## Files

| File | Contents |
|------|----------|
| `main.go` | `RootedTree`, `BinaryLifting`, `EulerTour`, `ErrNotATree` and a demo `main()` |
| `main_test.go` | the tables of the 10-node tree as the Python code computes them; both types against a naive LCA on every labelled tree with up to 6 nodes and on 300 random trees; a star, one node, two nodes, a path of 100,000 nodes; invalid input and panics |
| `go.mod` | module `lowest_common_ancestor` |

## API

| Function | Description |
|----------|-------------|
| `NewRootedTree(n int, edges [][2]int, root int) (*RootedTree, error)` | `Adj`, `Parent`, `Depth`, breadth-first; an error wrapping `ErrNotATree` unless the edges form one tree on `0..n-1` |
| `NewBinaryLifting(n int, edges [][2]int, root int) (*BinaryLifting, error)` | builds `up`, O(n log n) |
| `(*BinaryLifting) LCA(u, v int) int` | O(log n) |
| `(*BinaryLifting) Distance(u, v int) int` | edges on the path, O(log n) |
| `(*BinaryLifting) KthAncestor(v, k int) int` | the node k levels above v, -1 when `k > depth(v)`, O(log n) |
| `Levels()`, `Depth()`, `Parent()`, `Up()` | the table and its inputs, as copies |
| `NewEulerTour(n int, edges [][2]int, root int) (*EulerTour, error)` | builds the tour and the sparse table, O(n log n) |
| `(*EulerTour) LCA(u, v int) int`, `Distance(u, v int) int` | O(1) |
| `Depth()`, `Euler()`, `First()`, `Sparse()` | the tour and the table, as copies |

A query node outside `0..n-1`, or a negative k, panics, as an index out of range does. Check `errors.Is(err, ErrNotATree)` for a bad tree.

## Go-Specific Notes

- Go grows goroutine stacks on demand, so even a recursive walk would survive a path of 100,000 nodes; the walks are loops anyway, as in the other languages.
- `math/bits.Len` gives `levels` and the window size.
- The accessors return copies, so a caller cannot change the tables.

## How to Run

```bash
go test ./...
go run .
```

## Key Takeaways

- Constructors return an error for input that is not a tree; queries panic on a missing node.
- The three languages build the same tour and tables, checked against the Python values.
