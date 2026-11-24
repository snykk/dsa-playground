# Bipartite Matching -- Go Implementation

Maximum matching in an unweighted bipartite graph with Kuhn's algorithm and Hopcroft-Karp, and a minimum vertex cover by Konig's theorem. For the idea, the traces and the complexity, see the topic README: [../README.md](../README.md).

## Files

| File | Purpose |
|------|---------|
| `main.go` | `Kuhn`, `HopcroftKarp`, `MinVertexCover` and a demo `main` |
| `main_test.go` | 6 test functions: the worked example, edge cases, invalid input, an augmenting path through 200000 left vertices, 600 random graphs against brute force and max flow, and 40 graphs pinned to the Python outputs |
| `go.mod` | Module definition (`go 1.21`) |

## API

- `Kuhn(nLeft, nRight int, edges [][2]int) (int, []int, error)`: the size of a maximum matching and `matchLeft`, where `matchLeft[u]` is `u`'s partner or -1. Each edge is `{u, v}`, left vertex first.
- `HopcroftKarp(nLeft, nRight int, edges [][2]int) (int, []int, error)`: the same with Hopcroft-Karp.
- `MinVertexCover(nLeft, nRight int, edges [][2]int) (left, right []int, err error)`: Konig's cover from the Hopcroft-Karp matching, each slice increasing.

For a negative side size or an edge endpoint out of range, each returns an error that wraps `ErrInvalidGraph` (check it with `errors.Is`) and nil slices.

## Go-Specific Notes

- **No recursion.** The searches keep their path in slices, as the Python and C++ versions do, so all three run the same steps in the same order.
- **Errors, not panics.** Bad input is reported through the `error` result; a valid graph never fails.
- **Empty results are empty slices.** With no left vertices `matchLeft` is `[]int{}`, and a cover side with no vertex is `[]int{}`, never nil.
- **Same matching as Python.** `adj[u]` keeps the edges in input order; `TestAgreementWithPython` checks the matchings and the cover on 40 graphs computed by the Python code.

## How to Run

```bash
go test ./...
go run main.go      # demo: Kuhn size 3 [2 1 0 -1], Hopcroft-Karp size 3 [2 0 -1 1], cover [0] [0 1]
```

## Key Takeaways

1. A `[][2]int` edge list keeps the input order, and the order decides which maximum matching comes back.
2. Hopcroft-Karp's phases are a BFS and then DFSs over the same `dist` slice.
3. Konig's cover needs `matchRight` too, so `MinVertexCover` runs the matching itself.
