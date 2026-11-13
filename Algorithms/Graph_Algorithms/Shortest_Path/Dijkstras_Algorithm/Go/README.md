# Dijkstra's Algorithm -- Go Implementation

Dijkstra's algorithm over `map[int][]struct{Neighbor, Weight int}` using `container/heap`.

## Files

| File | Contents |
|------|----------|
| `main.go` | `Item`, `PriorityQueue` (a `heap.Interface`), `Dijkstra`, `DijkstraWithPath` (`package main`, no `main` function) |
| `main_test.go` | 10 tests (`go test`) |
| `go.mod` | module definition |

## API

| Function | Returns |
|----------|---------|
| `Dijkstra(graph, start)` | `map[int]int`; unreachable vertices are `math.MaxInt`; an empty map for an empty graph |
| `DijkstraWithPath(graph, start, target)` | `(distance int, path []int)`, or `(-1, nil)` if unreachable; `(0, []int{start})` when `start == target` |

Both run in O((V + E) log V) time and O(V + E) space. There is no all-pairs function in Go.

## Go-Specific Notes

- Infinity is `math.MaxInt`. `int` is 64-bit on common platforms, so overflow is unlikely but not checked.
- Every vertex (map keys and neighbor-only vertices) is initialized before relaxing.
- `container/heap` needs `Len`, `Less`, `Swap`, `Push` and `Pop`; stale entries are skipped when popped.
- Negative weights are not detected.
- The package has no `func main`, so `go run .` does not work; use the tests.

## How to Run

```bash
cd "Algorithms/Graph_Algorithms/Shortest_Path/Dijkstras_Algorithm/Go"
go test ./...
```

## Key Takeaways

- Initialize all vertices, including neighbor-only ones.
- Infinity is `math.MaxInt`, not `math.MaxInt32`.
- Lazy deletion replaces decrease-key.
