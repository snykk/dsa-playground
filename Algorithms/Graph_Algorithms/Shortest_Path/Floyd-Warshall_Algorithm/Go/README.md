# Floyd-Warshall Algorithm -- Go Implementation

All-pairs shortest paths over `map[int][]struct{Neighbor, Weight int}`, returning an `[][]int` matrix.

## Files

| File | Contents |
|------|----------|
| `main.go` | `FloydWarshall` (`package main`, no `main` function) |
| `main_test.go` | 7 tests (`go test`) |
| `go.mod` | module definition |

## API

| Function | Returns |
|----------|---------|
| `FloydWarshall(graph, numVertices)` | `[][]int` matrix, with `math.MaxInt` where j is unreachable from i; `nil` if there is a negative cycle |

Time O(V^3), space O(V^2). There is no path reconstruction in Go. Missing map keys have no edges.

## Go-Specific Notes

- Infinity is `math.MaxInt`; cells at infinity are skipped, so they are never added.
- The negative-cycle check runs after every round, so values cannot shrink without bound.
- Edge initialization keeps the cheapest of parallel edges; a positive self-loop leaves the diagonal at 0.
- An edge endpoint outside `0..numVertices-1` causes an index-out-of-range panic.
- The package has no `func main`, so `go run .` does not work; use the tests.

## How to Run

```bash
cd Algorithms/Graph_Algorithms/Shortest_Path/Floyd-Warshall_Algorithm/Go
go test ./...
```

## Key Takeaways

- Check `dist == nil` for a negative cycle.
- Infinity is `math.MaxInt`, not `math.MaxInt32`.
- `k` is the outermost loop.
