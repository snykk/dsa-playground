# Dinic's Algorithm -- Go Implementation

Maximum flow with level graphs and blocking flows, plus the flow on every edge and the minimum cut. For the idea, the trace and the complexity, see the topic README: [../README.md](../README.md).

## Files

| File | Purpose |
|------|---------|
| `main.go` | `dinic`, `dinicFlow`, the `DinicResult` type, the helpers `buildResidual`, `neighbours`, `bfsLevels`, `findPath`, `push` and `run`, and a demo `main` |
| `main_test.go` | 10 test functions: the classic network, edge cases, parallel edges, large capacities, a 200000-vertex chain, 700 random networks against an Edmonds-Karp reference with the cut and the flow conservation, unit networks from bipartite matching, the comb, and 40 networks pinned to the Python outputs |
| `go.mod` | Module definition (`go 1.21`) |

## API

- `dinic(graph map[int]map[int]int, source, sink int) int`: the maximum flow value. Returns 0 when `source == sink` or the sink is unreachable.
- `dinicFlow(graph map[int]map[int]int, source, sink int) DinicResult`: `MaxFlow`, `Flows` (`Flows[u][v]` for every edge of `graph`), `SourceSide` (the increasing vertices the last BFS reached), `Phases` (BFS runs, the last one included) and `EdgeVisits` (residual entries the depth-first searches looked at). When `source == sink` every flow is 0, `SourceSide` is `[source]` and both counts are 0.

There is no error result: like `edmondsKarp`, both return a flow of 0 for the cases above.

## Go-Specific Notes

- **Map order is random.** Ranging over a map would give a different order on every run, so `neighbours` copies each vertex's residual entries into a slice and sorts it. Every search uses that slice, and `TestAgreementWithPython` checks the flows, the cut and both counts on 40 networks computed by the Python code.
- **64-bit `int`.** Two paths of `2147483647` add up correctly.
- **No recursion.** `findPath` keeps the path in a slice, so the 200000-vertex chain in the tests needs no deep call stack.
- **Residual graph.** It is a fresh `map[int]map[int]int`, so the input graph is never modified.

## How to Run

```bash
go test ./...
go run main.go      # demo: maximum flow 23, source side [0 1 2 4], 3 phases, 40 edge visits
```

## Key Takeaways

1. Sort the entries of each vertex once; the pointer `current[u]` then indexes that slice.
2. The flows come from the residual graph: `max(0, capacity - residual[u][v])` for every edge.
3. `SourceSide` is the set the last BFS reached, already computed by the algorithm.
