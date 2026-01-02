# Graph Traversal in Go

Implementation of BFS, DFS, Flood Fill, and Topological Sort in Go.

## Usage

```go
// BFS
graph := map[int][]int{0: {1}, 1: {2}, 2: {}}
dist := BFSShortestPath(graph, 0, 2)

// Number of Islands
grid := [][]byte{{'1', '0'}, {'0', '1'}}
count := NumIslands(grid)

// Topological Sort
edges := [][]int{{1, 0}}
// Returns [1, 0]
topo := TopologicalSort(2, edges)
```

## Testing

Run the tests:

```bash
go test -v
```
