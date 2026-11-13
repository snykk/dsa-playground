# Graph Traversal Problems -- Go Implementation

BFS shortest path, flood fill and Kahn's topological sort. See the [topic README](../README.md) for the ideas. There is no standalone DFS traversal in Go; flood fill uses a recursive closure.

## Files

| File | Contents |
|------|----------|
| `main.go` | The three functions and a demo `main` |
| `main_test.go` | One test per function |
| `go.mod` | Module definition |

## API

- `BFSShortestPath(graph map[int][]int, start, target int) int`: -1 if `start` is missing or the target is unreachable.
- `NumIslands(grid [][]byte) int`: modifies `grid`.
- `TopologicalSort(n int, edges [][]int) []int`: empty slice on a cycle.

## Go-Specific Notes

- The queue is a slice that is re-sliced from the front (`queue[1:]`).
- Goroutine stacks grow dynamically, so the recursive flood fill handles large grids better than C++.
- `NumIslands` writes `'0'` into the grid; pass a copy.

## How to Run

```bash
go test ./...
go run main.go
```

## Key Takeaways

- Maps make a convenient adjacency list.
- Mark visited on push, not on pop.
- Copy the grid before counting islands if you still need it.
