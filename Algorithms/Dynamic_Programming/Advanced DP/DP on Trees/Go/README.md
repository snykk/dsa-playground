# DP on Trees -- Go Implementation

A placeholder. This folder does not implement tree DP yet; the working code is the Python version.

## Files

| File | Description |
|------|-------------|
| `main.go` | `package main` with comments only, no functions |
| `main_test.go` | One test that only logs a message; it asserts nothing |

## API

None. There are no functions or types.

## Go-Specific Notes

- A real port would use child slices, `int64` sums and plain recursion (Go stacks grow dynamically, so deep trees are less of a problem than in Python). Module `treedp`, Go 1.21.
- Because the test cannot fail, passing it proves nothing about tree DP.

## How to Run

```bash
go test ./...
```

## Key Takeaways

- Treat this folder as a stub; see `../Python/tree_dp.py` for the algorithms.
- The expected cost for a port is O(n) time.
