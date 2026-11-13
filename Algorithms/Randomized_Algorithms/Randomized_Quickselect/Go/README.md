# Randomized Quickselect -- Go Implementation

The k-th smallest element in O(n) expected time, using a three-way partition and a random pivot. For the idea, the trace and the complexity argument see the [topic README](../README.md).

## Files

- `main.go` - `Quickselect`, `TopKSmallest`, the three-way partition and a small demo `main`.
- `main_test.go` - 13 tests: ranks, duplicates, sorted input, a random cross-check, error cases and large duplicate-heavy inputs.
- `go.mod` - the module definition.

## API

- `Quickselect(arr []int, k int, rng *rand.Rand) int` - the k-th smallest element, 0-indexed. Reorders `arr`. Panics if `arr` is empty or `k` is out of range. A `nil` `rng` is replaced by a generator seeded from the global `rand.Int63()`.
- `TopKSmallest(arr []int, k int, rng *rand.Rand) []int` - the k smallest elements, unordered, from a copy of the input.

## Go-Specific Notes

- `rng.Intn(hi-lo+1)` is uniform and free of modulo bias.
- Bad arguments panic instead of returning an error, like an out-of-range slice index.
- The code is not generic: it works on `[]int`.
- Go has no standard-library selection function, so a hand-written Quickselect or a sort is the usual choice.

## How to Run

From this folder:

```bash
go test -v ./...
go run .
```

## Key Takeaways

- Three bands (`<`, `==`, `>`) keep duplicate-heavy input linear.
- Inject your own `*rand.Rand` for reproducible tests.
- `TopKSmallest` never changes its input; `Quickselect` does.
