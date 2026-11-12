# Prim's Algorithm -- Go Implementation

Prim's algorithm on a `map[int][]Edge` adjacency list, using `container/heap`.

## Files

| File | Contents |
|------|----------|
| `main.go` | `Edge`, `PriorityQueue` (a `heap.Interface`), `PrimMST`, `PrimMSTAdjacencyList` (`package main`, no `main` function) |
| `main_test.go` | 5 tests (`go test`) |
| `go.mod` | module definition |

## API

| Function | Returns |
|----------|---------|
| `PrimMST(graph, start)` | `([][]int, int)`: edges as `{from, to, weight}` and the total weight; empty for an empty graph |
| `PrimMSTAdjacencyList(graph, start)` | the same; a thin alias of `PrimMST` |

`Edge` is `struct{ To, Weight int }`. Time O(E log V), space O(V + E).

```go
graph := map[int][]Edge{
    0: {{1, 10}, {2, 6}, {3, 5}},
    1: {{0, 10}, {3, 15}},
    2: {{0, 6}, {3, 4}},
    3: {{0, 5}, {1, 15}, {2, 4}},
}
mst, total := PrimMST(graph, 0) // three edges, total 19
```

## Go-Specific Notes

- The heap orders by weight only, so equal-weight ties can come out in any order; the total weight does not change.
- The loop runs until the heap is empty, so a vertex that appears only as a neighbor is still added.
- A disconnected graph returns only the tree of the start vertex.
- The package has no `func main`, so `go run .` does not work; use the tests.

## How to Run

```bash
cd "Algorithms/Greedy/Minimum Spanning Tree/Prim's Algorithm/Go"
go test ./...
```

## Key Takeaways

- Stale heap entries are skipped when popped.
- Check the edge count against V - 1 for connectivity.
- Only the start vertex's component is covered.
