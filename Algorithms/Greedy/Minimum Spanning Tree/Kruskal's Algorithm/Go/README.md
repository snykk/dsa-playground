# Kruskal's Algorithm -- Go Implementation

Kruskal's algorithm on a `[][]int` of `{u, v, weight}` edges.

## Files

| File | Contents |
|------|----------|
| `main.go` | `UnionFind`, `NewUnionFind`, `Find`, `Union` and `KruskalMST` (`package main`, no `main` function) |
| `main_test.go` | 4 tests (`go test`) |
| `go.mod` | module definition |

## API

| Name | Returns |
|------|---------|
| `NewUnionFind(n)` | a `*UnionFind`; `Find(x)` compresses paths, `Union(x, y)` unions by rank and reports whether it joined two sets |
| `KruskalMST(edges, numVertices)` | `([][]int, int)`: the chosen edges and the total weight; empty for 0 vertices |

Time O(E log E), space O(V).

```go
edges := [][]int{{0, 1, 10}, {0, 2, 6}, {0, 3, 5}, {1, 3, 15}, {2, 3, 4}}
mst, total := KruskalMST(edges, 4) // three edges, total 19
```

## Go-Specific Notes

- `KruskalMST` sorts the `edges` slice you pass in, in place (`sort.Slice`, not stable). Copy it first if you need the original order.
- The chosen edges share their `[]int` with the input, so changing one changes the other.
- A disconnected graph returns a spanning forest (fewer than V - 1 edges).
- The package has no `func main`, so `go run .` does not work; use the tests.

## How to Run

```bash
cd "Algorithms/Greedy/Minimum Spanning Tree/Kruskal's Algorithm/Go"
go test ./...
```

## Key Takeaways

- The input slice is sorted in place.
- `Union` returning false is the cycle test.
- Compare the number of edges with V - 1 to detect a disconnected graph.
