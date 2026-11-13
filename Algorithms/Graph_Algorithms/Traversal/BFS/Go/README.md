# BFS -- Go Implementation

Breadth-First Search over `map[int][]int`, with a slice as the queue and a map as the visited set.

## Files

| File | Contents |
|------|----------|
| `main.go` | the four BFS functions (`package main`, no `main` function) |
| `main_test.go` | 12 tests (`go test`) |
| `go.mod` | module definition |

## API

| Function | Returns |
|----------|---------|
| `BFSAdjacencyList(graph, start)` | `[]int` in BFS order; empty if `start` is not a key |
| `BFSWithPath(graph, start, target)` | a shortest path as `[]int`; empty if none; `[]int{start}` when `start == target` |
| `BFSLevelOrder(graph, start)` | `[][]int`, one slice per level |
| `BFSShortestDistance(graph, start)` | `map[int]int` of hops to every reachable vertex |

All run in O(V + E) time and O(V) space.

## Go-Specific Notes

- The queue is a slice: `queue = queue[1:]` dequeues in O(1), but the dequeued prefix stays in the backing array until `append` reallocates it. That is fine for these sizes.
- Reading a missing key from a map returns a nil slice, so a vertex that appears only in neighbor lists needs no special case.
- `BFSWithPath` keeps a `parent` map and reverses the path once with `slices.Reverse` (Go 1.21 or newer).
- The package has no `func main`, so `go run .` does not work; use the tests.
- Connected components exist only in the Python version.

## How to Run

```bash
cd Algorithms/Graph_Algorithms/Traversal/BFS/Go
go test ./...
```

Add `-v` to see each test.

## Key Takeaways

- A slice is enough for a BFS queue at this scale.
- Missing map keys read as empty, which makes neighbor-only vertices safe.
- BFS gives fewest edges, not least weight.
