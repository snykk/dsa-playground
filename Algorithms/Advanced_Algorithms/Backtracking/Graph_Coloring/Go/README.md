# Graph Coloring -- Go Implementation

## Files

- `main.go`: the solver (`isSafe`, `graphColoringUtil`, `graphColoring`, `chromaticNumber` and a demo `main`).
- `main_test.go`: tests (valid coloring, too few colors, chromatic number, `is_safe`, empty graph, edgeless graph, even and odd cycles, complete graph; the returned colorings are checked for validity).

## API

- `isSafe(graph, v, color, c)`: true if color `c` can be given to vertex `v` (no neighbor has it).
- `graphColoring(graph, m)`: tries to color the graph with colors `1..m`; returns a slice, or `nil` if impossible (an empty graph gives an empty non-nil slice)
- `chromaticNumber(graph)`: smallest m for which a coloring exists (0 for an empty graph).

```go
graph := [][]int{{0, 1, 1, 1}, {1, 0, 1, 0}, {1, 1, 0, 1}, {1, 0, 1, 0}}
color := graphColoring(graph, 3) // [1 2 3 2]
k := chromaticNumber(graph)      // 3
```

## Go-Specific Notes

- Everything is in `package main`; the functions are unexported, so the code is meant to be read and tested in place.
- Check `color == nil` for failure, not `len(color) == 0`.

## How to Run

```bash
go test ./...
```

## Key Takeaways

- Choose a color, check the neighbors, recurse, and undo on failure.
- The worst case is O(V * m^V); use it for small graphs only.
- The chromatic number comes from trying m = 1, 2, 3, ... until one succeeds.
