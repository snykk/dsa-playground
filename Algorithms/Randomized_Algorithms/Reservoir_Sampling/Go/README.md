# Reservoir Sampling — Go Implementation

One-pass uniform sampling from a stream of unknown length. O(n) time, O(k) space.

For the conceptual overview and probability proof, see the parent README: [../README.md](../README.md)

---

## Files

| File | Purpose |
|------|---------|
| `main.go` | `Sampler` type + `ReservoirSample` convenience function |
| `main_test.go` | 8 tests including statistical uniformity over 20k trials |
| `go.mod` | Module definition |

---

## Go-Specific Notes

- **Per-instance `*rand.Rand`**: each `Sampler` owns its own random source. Avoids locking on the global `rand` and enables deterministic tests via a fixed seed.
- **`rng.Intn(seen)`** gives `[0, seen)` uniformly. Never `rng.Int63() % n` — that has modulo bias on non-power-of-two `n`.
- **`Sample()` returns a copy** so callers can't accidentally mutate internal state. A subtle but important API guarantee.
- **Seed = 0 as "random seed"**: convenient convention for tests (`seed: 42`) vs production (`seed: 0` → uses a time-based random seed).
- **No generics in this implementation**: hardcoded to `int` for teaching clarity. For reusable code, parameterize: `type Sampler[T any] struct { ... }`.

---

## How to Run

```bash
go test -v ./...
```

---

## Key Takeaways for Learners

1. **Per-instance RNG, not the global.** Go's `rand.Intn` without an explicit `Rand` uses a locked global — fine for occasional use, wasteful in hot loops.
2. **Uniformity is a statistical property.** The test suite runs ~20k trials and checks each item's frequency is within 15% of expected. Fewer trials → more flaky.
3. **`rng.Intn(n)` over `rng.Int63() % n`**. Built-in methods handle modulo bias for you; manual modulo doesn't.
