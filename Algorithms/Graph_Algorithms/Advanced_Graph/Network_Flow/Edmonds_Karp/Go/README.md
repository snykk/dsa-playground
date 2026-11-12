# Edmonds-Karp Algorithm -- Go Implementation

Maximum flow with BFS augmenting paths. For the idea, the trace and the complexity proof, see the topic README: [../README.md](../README.md).

## Files

| File | Purpose |
|------|---------|
| `main.go` | `edmondsKarp(graph, source, sink)` and a demo `main` |
| `main_test.go` | 8 tests: the classic network, unreachable sink, key-less sink, same source and sink, anti-parallel edges, zero capacity, the 1000/1 diamond, large capacities |
| `go.mod` | Module definition (`go 1.21`) |

## API

- `edmondsKarp(graph map[int]map[int]int, source, sink int) int`: the maximum flow value. Returns 0 when `source == sink` or the sink is unreachable.

## Go-Specific Notes

- **64-bit `int`.** Two paths of `2147483647` add up correctly on 64-bit platforms.
- **Map iteration order is random.** BFS may take a different shortest path from one run to the next; the flow value does not change.
- **Queue.** The BFS queue is `container/list`.
- **Residual graph.** It is a fresh `map[int]map[int]int`, so the input graph is never modified.

## How to Run

```bash
go test ./...
go run main.go      # demo: prints "Maximum flow: 23"
```

## Key Takeaways

1. Reverse edges with capacity 0 are part of the residual graph from the start.
2. The result does not depend on which shortest path BFS picks.
3. Only the value is returned.
