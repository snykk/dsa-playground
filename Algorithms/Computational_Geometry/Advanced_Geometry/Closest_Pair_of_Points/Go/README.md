# Closest Pair of Points -- Go Implementation

## Files

- `main.go`: `Point`, `Result`, `distance`, `bruteForceClosestPair`, `closestPairRecursive`, `ClosestPair`. It has no `main` function.
- `main_test.go`: tests (two points, square, lines, closest pair across the divide, duplicates, negative and shared x, too few points, the y-list invariant, and random sets against brute force).

## API

- `ClosestPair(points []Point) Result`: `Dist`, `P1`, `P2`. Panics for fewer than two points. The input slice is copied, not reordered.
- `bruteForceClosestPair(points []Point) Result`: O(n^2).

## Go-Specific Notes

- Every point is tagged with its rank in the x order, and the y-list is split by rank, so equal x values and duplicates are handled exactly.
- The module name is `closestpair`; the code is in `package main` without a `main` function, so it is built and tested with `go test`.
- The file is `gofmt`-clean.

## How to Run

```bash
go test ./...
```

## Key Takeaways

- Sort by x and y once; split the y-list consistently with the x-list.
- Only the strip around the dividing line needs checking, with a constant number of neighbors per point.
- O(n log n) time, O(n) space, and exact for duplicates and equal x values.
