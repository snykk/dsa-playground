# DFS -- Go Implementation

Depth-First Search over `map[int][]int`, with slices as stacks.

## Files

| File | Contents |
|------|----------|
| `main.go` | the four DFS functions (`package main`, no `main` function) |
| `main_test.go` | 15 tests (`go test`) |
| `go.mod` | module definition |

## API

| Function | Returns |
|----------|---------|
| `DFSAdjacencyList(graph, start)` | `[]int` in DFS order (stack, marks on pop); empty if `start` is not a key |
| `DFSRecursive(graph, start)` | the textbook recursive order, using real recursion |
| `DFSWithPath(graph, start, target)` | the first path found in DFS order; empty if none; `[]int{start}` when `start == target` |
| `DFSDetectCycle(graph, directed)` | `true` if the graph has a cycle |

Time is O(V + E). Space is O(V + E) for the stack versions and O(V) for the recursive ones. Components and topological sort exist only in Python.

## Go-Specific Notes

- `DFSRecursive` and `DFSDetectCycle` recurse. This is safe because Go grows goroutine stacks on demand.
- `DFSDetectCycle` passes a `hasParent` flag, so a vertex numbered -1 works.
- A missing map key reads as an empty slice, so neighbor-only vertices need no special case.
- `DFSWithPath` records one parent per vertex and reverses the path once with `slices.Reverse`.
- The package has no `func main`, so `go run .` does not work; use the tests.

## How to Run

```bash
cd Algorithms/Graph_Algorithms/Traversal/DFS/Go
go test ./...
```

## Key Takeaways

- Recursion is fine in Go, but the stack version gives the same order.
- Missing map keys read as empty, which makes neighbor-only vertices safe.
- DFS returns a path, not the shortest path.
