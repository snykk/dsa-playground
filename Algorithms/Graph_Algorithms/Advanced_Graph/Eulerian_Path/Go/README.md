# Eulerian Path and Circuit -- Go Implementation

The existence test for a walk that uses every edge once, and Hierholzer's algorithm, for undirected and directed graphs. For the idea, the trace and the complexity, see the topic README: [../README.md](../README.md).

## Files

| File | Purpose |
|------|---------|
| `main.go` | `EulerianKind`, `EulerianPath`, the `Kind` and `Walk` types and a demo `main` |
| `main_test.go` | 7 test functions: the worked examples and Konigsberg, the tie rule, edge cases, invalid input, walks of 10^6 edges, 1500 random graphs against brute force, and 40 graphs pinned to the Python outputs |
| `go.mod` | Module definition (`go 1.21`) |

## API

- `type Kind int` with `None`, `Path` and `Circuit`; `String()` gives `"none"`, `"path"` and `"circuit"`.
- `type Walk struct { Vertices, EdgeIDs []int }`: E + 1 vertices, and `EdgeIDs[i]` is the input index of the edge between `Vertices[i]` and `Vertices[i+1]`.
- `EulerianKind(n int, edges [][2]int, directed bool) (Kind, error)`: `Circuit` also when there is no edge.
- `EulerianPath(n int, edges [][2]int, directed bool) (Walk, bool, error)`: a walk that uses every edge exactly once and `true`, a circuit whenever one exists; two empty slices and `true` when there is no edge; a zero `Walk` and `false` when no walk exists.

For `n < 0` or an edge end out of range, both return an error that wraps `ErrInvalidGraph` (check it with `errors.Is`).

## Go-Specific Notes

- **No recursion.** The walk keeps its vertices in a slice, the same loop as the Python and C++ versions. Go grows a goroutine's stack up to 1 GB, so a recursive version got through a cycle of 10^6 edges but stopped at 10^7 with "goroutine stack exceeds 1000000000-byte limit"; the loop has no such limit.
- **No walk is `ok == false`.** The empty walk of a graph with no edges has `ok == true` and empty, non-nil slices; no walk has nil slices.
- **Errors, not panics.** Bad input is reported through the `error` result; a valid graph never fails.
- **Same walk as Python.** `adj[v]` keeps the edges in input order; `TestAgreementWithPython` checks the kind and the walk on 40 graphs computed by the Python code.

## How to Run

```bash
go test ./...
go run main.go      # demo: the undirected example, the directed one, Konigsberg
```

## Key Takeaways

1. `(Walk, bool, error)` keeps three answers apart: a walk, no walk, and bad input.
2. `ptr[v]` only moves forward, so the walk reads each adjacency entry once.
3. Reverse the popped vertices and edges at the end: they come out from the end of the walk.
