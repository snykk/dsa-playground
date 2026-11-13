# Bitmask DP -- Go Implementation

A placeholder. This folder does not implement bitmask DP yet; the working solver is the Python version.

## Files

| File | Description |
|------|-------------|
| `main.go` | `package main` with comments only, no functions |
| `main_test.go` | One test that only logs a message; it asserts nothing |
| `go.mod` | Module `bitmaskdp` (Go 1.21) |

## API

None. There are no functions or types.

## Go-Specific Notes

- A real port would use `[][]int64` (or a flat slice), a large sentinel for infinity chosen so that adding a distance cannot overflow, and `int` masks with `1 << uint(j)`.
- Because the test cannot fail, passing it proves nothing about bitmask DP.

## How to Run

```bash
go test ./...
```

## Key Takeaways

- Treat this folder as a stub; see `../Python/bitmask_dp.py` for the algorithm.
- The expected cost for a port is O(n^2 * 2^n) time and O(n * 2^n) space.
