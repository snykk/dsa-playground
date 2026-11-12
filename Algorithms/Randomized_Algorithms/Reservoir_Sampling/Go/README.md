# Reservoir Sampling -- Go Implementation

One-pass uniform sampling from a stream of unknown length. O(n) time, O(k) space. For the idea, proof and trace see the [topic README](../README.md).

## Files

- `main.go` - the `Sampler` type, `ReservoirSample` and a small demo `main`.
- `main_test.go` - 8 tests: edge cases, copies and statistical uniformity over 20,000 trials.
- `go.mod` - the module definition.

## API

- `NewSampler(k int, seed int64) *Sampler` - panics if `k < 0`. A `seed` of 0 draws a random seed from the global source; any other value is deterministic.
- `(*Sampler).Offer(item int)` - present the next item.
- `(*Sampler).Sample() []int` - a copy of the reservoir.
- `(*Sampler).Len() int` - the current reservoir size.
- `ReservoirSample(stream []int, k int, seed int64) []int` - sample a whole slice. It takes a `[]int`, not a channel or reader.

## Go-Specific Notes

- Each `Sampler` owns a `*rand.Rand`, so there is no contention on the global source and tests can be deterministic.
- `rng.Intn(seen)` is uniform; do not use `Int63() % n`.
- The item counter is an `int` (64-bit on common platforms), so it does not overflow in practice.
- Only `int` items are supported; a generic `Sampler[T any]` would be the reusable version.

## How to Run

From this folder:

```bash
go test -v ./...
go run .
```

## Key Takeaways

- `Sample()` returns a copy, so callers cannot corrupt the sampler.
- A per-instance generator makes tests reproducible.
- The sampler needs one `Offer` per item and never stores the stream.
