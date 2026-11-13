# Topological Sort -- Go Implementation

Kahn's algorithm and a DAG check. For the idea, the trace and the complexity, see the topic README: [../README.md](../README.md).

## Files

| File | Purpose |
|------|---------|
| `main.go` | `TopologicalSortKahn`, `IsDAG` and a demo `main` |
| `main_test.go` | 6 tests: basic order, cycle, `IsDAG`, empty graph and neighbour-only vertices, order validity, a 10^6-vertex chain |
| `go.mod` | Module definition (`go 1.21`) |

## API

- `TopologicalSortKahn(graph map[int][]int) []int`: an order including neighbour-only vertices, or an empty slice for a cycle (and for an empty graph).
- `IsDAG(graph map[int][]int) bool`: true for the empty graph and for any acyclic graph, false when there is a cycle.

There is no DFS version, all-orders enumeration or longest path in Go (Python has them).

## Go-Specific Notes

- **Empty slice is ambiguous.** It means a cycle or an empty graph; use `IsDAG`.
- **Queue.** The queue is `container/list`, a plain slice would also do.
- **Map iteration is random**, so the order of vertices with equal readiness varies between runs; test for validity.
- **In-degrees** are built from keys and neighbours, so neighbour-only vertices are counted.

## How to Run

```bash
go test ./...
go run main.go      # demo
```

## Key Takeaways

1. Build the vertex set from keys and neighbours.
2. Never compare a Go order with a fixed list: map order is random.
3. `IsDAG` handles the empty graph.
