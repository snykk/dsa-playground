# Bellman-Ford Algorithm -- Go Implementation

Bellman-Ford on a `[]Edge`, returning `map[int]int` distances.

## Files

| File | Contents |
|------|----------|
| `main.go` | `Edge` and `BellmanFord` (`package main`, no `main` function) |
| `main_test.go` | 8 tests (`go test`) |
| `go.mod` | module definition |

## API

| Function | Returns |
|----------|---------|
| `BellmanFord(edges, numVertices, start)` | map from vertex to distance, with `math.MaxInt` for unreachable vertices; `nil` if a negative cycle is reachable; an empty map if `numVertices` is 0; panics if an edge endpoint is outside `0..numVertices-1` |

`Edge` is `struct{ U, V, Weight int }`. Time O(V * E), space O(V). There is no path-reconstruction function in Go.

```go
edges := []Edge{{3, 4, 1}, {2, 3, 3}, {1, 2, -2}, {0, 2, 4}, {0, 1, 5}}
dist := BellmanFord(edges, 5, 0) // map[0:0 1:5 2:3 3:6 4:7]
```

## Go-Specific Notes

- Infinity is `math.MaxInt`. Edges whose tail is at infinity are skipped; sums are not checked for overflow, so keep weights small.
- A nil map means a negative cycle; reading a nil map is safe, so check `dist == nil` explicitly.
- Edges are validated first and a bad endpoint panics.
- The package has no `func main`, so `go run .` does not work; use the tests.

## How to Run

```bash
cd Algorithms/Graph_Algorithms/Shortest_Path/Bellman-Ford_Algorithm/Go
go test ./...
```

## Key Takeaways

- Check `dist == nil` for a negative cycle.
- Infinity is `math.MaxInt`, not `math.MaxInt32`.
- Bad edges panic instead of being read as distance 0.
