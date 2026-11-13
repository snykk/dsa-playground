# A* Search Algorithm -- Go Implementation

A* over `map[int][]struct{Neighbor, Weight int}` using `container/heap`.

## Files

| File | Contents |
|------|----------|
| `main.go` | `Node`, `PriorityQueue` (a `heap.Interface`) and `AStar` (`package main`, no `main` function) |
| `main_test.go` | 8 tests (`go test`) |
| `go.mod` | module definition |

## API

| Function | Returns |
|----------|---------|
| `AStar(graph, start, goal, heuristic)` | `(cost int, path []int)`, or `(-1, nil)` if the goal is unreachable; `(0, []int{start})` when `start == goal` |

`heuristic` is a `func(int) int`. The graph type is an anonymous struct slice, so a test builds it like this:

```go
graph := map[int][]struct {
    Neighbor int
    Weight   int
}{
    0: {{Neighbor: 1, Weight: 4}, {Neighbor: 2, Weight: 2}},
    1: {{Neighbor: 3, Weight: 5}},
    2: {{Neighbor: 3, Weight: 1}},
    3: {},
}
cost, path := AStar(graph, 0, 3, func(v int) int {
    if v == 3 {
        return 0
    }
    return 1
}) // 3, [0 2 3]
```

## Go-Specific Notes

- The priority queue orders by `fScore` only; equal-f ties can pop in any order.
- No closed set: a vertex is pushed again when a cheaper `gScore` is found, and stale entries are skipped. The result is optimal for any admissible heuristic.
- Each node holds a copy of its path (`append([]int{}, current.path...)`).
- Costs are `int`. The package has no `func main`, so `go run .` does not work; use the tests.

## How to Run

```bash
cd Algorithms/Graph_Algorithms/Shortest_Path/A_Star_Search_Algorithm/Go
go test ./...
```

## Key Takeaways

- `container/heap` needs `Len`, `Less`, `Swap`, `Push` and `Pop`.
- Re-opening vertices makes an admissible heuristic enough for optimality.
- A zero heuristic gives Dijkstra's algorithm.
