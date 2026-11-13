# Ford-Fulkerson Method -- Go Implementation

Maximum flow with DFS augmenting paths. For the idea, the trace and the complexity, see the topic README: [../README.md](../README.md).

## Files

| File | Purpose |
|------|---------|
| `main.go` | `fordFulkerson`, the recursive `dfsFindPath`, and a demo `main` |
| `main_test.go` | 8 tests: classic network, unreachable sink, key-less sink, same source and sink, anti-parallel edges, small network (flow 11), large vertex ids, a 20000-vertex chain |
| `go.mod` | Module definition (`go 1.21`) |

## API

- `fordFulkerson(graph map[int]map[int]int, source, sink int) int`: maximum flow value. Returns 0 when `source == sink` or the sink is unreachable.

The helper `dfsFindPath` is unexported. There is no path list or min-cut function in Go (Python has them).

## Go-Specific Notes

- **Recursive DFS.** Goroutine stacks start at about 2 KB and grow on demand, so a 20000-vertex chain is fine.
- **Maps for everything.** Visited state and the residual graph are maps, so vertex ids can be any `int`.
- **Random iteration order.** The augmenting paths can differ between runs; the flow value does not.
- **64-bit `int`.** No overflow for capacities that fit in 32 bits.

## How to Run

```bash
go test ./...
go run main.go      # demo: prints "Maximum flow: 23"
```

## Key Takeaways

1. The same residual-graph logic as Python and C++, in a few lines.
2. Result values are deterministic even though the paths are not.
3. Only the value is returned.
