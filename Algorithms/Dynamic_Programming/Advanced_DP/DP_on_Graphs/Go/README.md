# DP on Graphs -- Go Implementation

Longest path in a directed acyclic graph with a memoized DFS and cycle detection, ported from the Python version.

## Files

| File | Description |
|------|-------------|
| `main.go` | `ErrCycle` and `DAGLongestPath` (`package main`, no `main` function) |
| `main_test.go` | 3 tests: a table of the Python cases and of values printed by the Python code, a table of cyclic graphs, and 500 random graphs checked against a brute force over all simple paths |
| `go.mod` | Module `graphdp` (Go 1.21) |

## API

| Name | Description |
|------|-------------|
| `var ErrCycle` | the error returned when a cycle is reachable from `start` (Python raises `ValueError`) |
| `DAGLongestPath(graph map[int][]int, start int) (int, error)` | number of edges on the longest path starting at `start`, or `0, ErrCycle` if a cycle (including a self-loop) is reachable from `start`; a node without an entry has no successors, and a nil map is an empty graph |

```go
graph := map[int][]int{0: {1, 2}, 1: {3}, 2: {3}, 3: {}}
length, err := DAGLongestPath(graph, 0) // 2, nil
```

## Go-Specific Notes

- A cycle is an error value, not a panic: check it with `errors.Is(err, ErrCycle)`.
- Node ids are `int` and need not be contiguous or non-negative; the memo and the in-progress set are maps, like Python's dict and set.
- The DFS is a recursive closure. Go stacks grow on demand, so long paths do not hit a recursion limit as they do in Python.
- Only the part of the graph reachable from `start` is examined; an unreachable cycle is not reported. Edge weights are not supported.
- The package has no `func main`, so `go run .` does not work; use the tests.

## How to Run

```bash
cd "Algorithms/Dynamic_Programming/Advanced_DP/DP_on_Graphs/Go"
go test ./...
```

## Key Takeaways

- Memoization makes each node and edge cost O(1) work overall: O(V + E).
- An in-progress set distinguishes a cycle from a harmless shared descendant.
- The memo counts nodes; the function subtracts 1 to return edges.
