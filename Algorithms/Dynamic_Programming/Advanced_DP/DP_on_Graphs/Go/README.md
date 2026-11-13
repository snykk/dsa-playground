# DP on Graphs -- Go Implementation

A placeholder. This folder does not implement DP on graphs yet; the working code is the Python version.

## Files

| File | Description |
|------|-------------|
| `main.go` | `package main` with comments only, no functions |
| `main_test.go` | One test that only logs a message; it asserts nothing |

## API

None. There are no functions or types.

## Go-Specific Notes

- A real port would use `[][]int` for the adjacency list, a state slice (unvisited, in progress, done) and return an error for a cycle. Module `graphdp`, Go 1.21.
- Because the test cannot fail, passing it proves nothing about graph DP.

## How to Run

```bash
go test ./...
```

## Key Takeaways

- Treat this folder as a stub; see `../Python/graph_dp.py` for the algorithm.
- The expected cost for a port is O(V + E) time and O(V) space.
