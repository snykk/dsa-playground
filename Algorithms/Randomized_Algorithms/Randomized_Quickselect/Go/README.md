# Randomized Quickselect — Go Implementation

O(n) expected-time k-th smallest element, using Lomuto partition with a random pivot.

For the conceptual overview and probability proof, see the parent README: [../README.md](../README.md)

---

## Files

| File | Purpose |
|------|---------|
| `main.go` | `Quickselect(arr, k, rng)` + `TopKSmallest` helper |
| `main_test.go` | 12 tests: ranks, duplicates, adversarial inputs, random sorted cross-check |
| `go.mod` | Module definition |

---

## Go-Specific Notes

- **Injected `*rand.Rand`**: each call accepts its own RNG for reproducibility. Passing `nil` falls back to a time-seeded random source.
- **`rng.Intn(hi - lo + 1) + lo`** gives a uniform integer in `[lo, hi]`. Built-in `Intn` handles modulo bias for you — never `rng.Int() % n`.
- **Panic vs error**: out-of-range `k` panics rather than returning `(int, error)`. This matches Go stdlib conventions for programmer errors (like `slice[n]` on an n-length slice).
- **Multi-assignment swap**: `arr[i], arr[j] = arr[j], arr[i]` — one line, no tmp. A Go idiom worth internalizing.
- **No generics**: hardcoded to `int`. A 1.18+ version would read `func Quickselect[T cmp.Ordered](arr []T, ...)`.

---

## How to Run

```bash
go test -v ./...
```

---

## Key Takeaways for Learners

1. **`sort.Slice` + index access is O(n log n)** — Quickselect is O(n) expected. For a one-shot median on a million elements, the constant factor matters.
2. **Go's runtime has no stdlib `nth_element`.** C++ gives you `std::nth_element`; Python has `heapq.nsmallest`. Go programmers hand-roll or use a third-party package.
3. **Pivot randomness is the algorithm's antifragility.** Even on sorted / reverse-sorted input, the expected O(n) bound holds because the adversary can't predict your choices.
