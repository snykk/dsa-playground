# 0-1 BFS -- Go Implementation

Single-source shortest paths with weights 0 and 1, with a small deque of two slices, plus the grid example of breaking walls. For the idea, the trace and the complexity, see the topic README: [../README.md](../README.md).

## Files

| File | Purpose |
|------|---------|
| `main.go` | `ZeroOneBFS`, `PathTo`, `ZeroOneBFSWithPath`, `GridEdges`, `MinWallBreaks` and a demo `main` |
| `main_test.go` | 8 test functions: the worked example and its counts, edge cases, invalid input, a chain of 200000 vertices, the grid, 2000 random graphs against Dijkstra, the push and pop counts, and 40 graphs pinned to the Python outputs |
| `go.mod` | Module definition (`go 1.21`) |

## API

- `type Edge struct{ U, V, Weight int }`: a directed edge of weight 0 or 1.
- `ZeroOneBFS(edges []Edge, numVertices, start int) (dist, parent []int, err error)`: `dist[v]` is the shortest distance from `start`, or -1 when `v` is unreachable; `parent[v]` is the vertex before `v` on that path, or -1 for `start` and unreachable vertices.
- `PathTo(parent []int, start, target int) ([]int, error)`: `[]int{start}` when they are equal, an empty slice when `target` is unreachable.
- `ZeroOneBFSWithPath(edges []Edge, numVertices, start, target int) (int, []int, error)`: the distance and one shortest path, `(-1, []int{})` when there is none.
- `GridEdges(grid []string) ([]Edge, error)`: the edges of a grid of `.` (road) and `#` (wall); entering a wall costs 1, a road 0.
- `MinWallBreaks(grid []string, start, goal [2]int) (int, error)`: the fewest walls to break, cells as `{row, col}`.

Bad graph input (a negative vertex count, an endpoint out of range, a weight other than 0 or 1, a start or target that is not a vertex) returns an error wrapping `ErrInvalidGraph`; a bad grid or a cell outside it, one wrapping `ErrInvalidGrid`. Check them with `errors.Is`.

```go
edges := []Edge{{0, 1, 1}, {0, 2, 0}, {2, 1, 0}, {1, 3, 1}, {2, 4, 1}, {4, 3, 0}, {4, 5, 1}, {3, 5, 1}, {6, 0, 1}}
dist, parent, _ := ZeroOneBFS(edges, 7, 0)    // [0 0 0 1 1 2 -1] [-1 2 0 1 2 4 -1]
d, path, _ := ZeroOneBFSWithPath(edges, 7, 0, 5) // 2 [0 2 4 5]
```

## Go-Specific Notes

- **A deque of two slices.** The standard library has no deque. `pushFront` appends to `front`, a stack whose top is the front of the deque; `pushBack` appends to `back`, which is read from index `head`. `popFront` takes the top of `front` while it has one, then `back[head]`. Every operation is O(1), amortized for the appends.
- **Errors, not panics.** Bad input comes back through the `error` result with nil slices; a valid graph never fails.
- **Empty paths are empty slices.** An unreachable target gives `[]int{}`, never nil, and distance -1, as in Python and C++.
- **Same output as Python.** `adj[u]` keeps the edges in input order; `TestAgreementWithPython` checks `dist` and `parent` on 40 graphs computed by the Python code. The unexported `search` takes a `*counters` that the tests use to count pops and edge reads.

## How to Run

```bash
cd "Algorithms/Graph_Algorithms/Shortest_Path/0_1_BFS/Go"
go test ./...
go run main.go   # demo: the worked example, a path and the grid
```

## Key Takeaways

1. Two slices make a deque good enough for 0-1 BFS: pushes at both ends, pops at the front.
2. The stale check `d > dist[u]` keeps a vertex pushed twice from being processed twice.
3. Distance -1 means unreachable in all three languages.
