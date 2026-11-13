# K-D Tree -- Go Implementation

A K-D tree with runtime dimensionality, supporting build, insert, nearest-neighbour and range queries. See the [topic README](../README.md) for the idea and a trace.

## Files

| File | Contents |
| ---- | -------- |
| `main.go` | `KDTree`, `Point` and a small demo `main` |
| `main_test.go` | tests: textbook example, random cross-checks against brute force, 3D, dimension-mismatch panics |
| `go.mod` | module `kd_tree` (Go 1.24.2) |

## API

| Call | Result |
| ---- | ------ |
| `NewKDTree(points []Point) *KDTree` | balanced build; panics if the points differ in length |
| `Dimensionality() int` | the number k |
| `Insert(p Point)` | adds a point as a leaf (iterative); no rebalancing; panics on a wrong size |
| `Nearest(query Point) Point` | the closest stored point, or `nil` on an empty tree; panics on a wrong size |
| `RangeSearch(lo, hi Point) []Point` | points inside the box; panics on wrong-sized bounds |

## Go-Specific Notes

- `Point` is `[]float64`; the dimensionality is the length of the first point.
- The build uses `sort.Slice` at every level, O(n log^2 n) overall; C++ is O(n log n) with `nth_element`.
- Errors are panics with a message, like a bad slice index, not returned errors.
- Queries are recursive. Go stacks grow dynamically, so a deep chain is not a crash risk the way it is in C++, but it is still slow.
- The garbage collector frees dropped trees.

## How to Run

```bash
cd "Data_Structures/Non_Linear/Trees/K_D_Tree/Go"
go test ./...
go run .
```

## Key Takeaways

- Runtime k is simple; check the length of every query.
- Compare squared distances.
- Build from the full list for a balanced tree.
