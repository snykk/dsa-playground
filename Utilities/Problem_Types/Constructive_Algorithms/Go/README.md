# Constructive Algorithms — Go Implementation

**Constructive algorithms** directly build a valid output satisfying the constraints — no search, no backtracking, no trial-and-error. The skill is in spotting the pattern.

For the conceptual overview and worked examples, see the parent README: [../README.md](../README.md)

---

## Functions Included

| Function | What it constructs | Technique |
|----------|-------------------|-----------|
| `ConstructPermutation(n, k)` | Permutation of `[1..n]` with `k` adjacent differences | Alternate small/large |
| `ConstructArrayWithSum(n, total, lo, hi)` | Array summing to `total`, values in `[lo, hi]` | Fill with `lo`, distribute remainder |
| `ConstructGraph(degrees)` | Graph matching degree sequence | Havel-Hakimi |

---

## Go-Specific Notes

- **Pre-size slices**: `result := make([]int, n)` (or `make([]int, 0, n)` + `append`) avoids growth reallocation. Growth in Go uses `2x` until 1024 then `1.25x` — unpredictable.
- **Error handling idiom**: for infeasible inputs, return `(nil, error)` instead of a bogus slice. Callers can't accidentally use a nil slice as if it were valid, but they _can_ accidentally use an empty valid slice — making errors explicit matters.
- **No `iota` for runtime initialization** — Go's `iota` is a compile-time constant. Use a `for i := range result { result[i] = i + 1 }` or helper `fillRange(lo, hi)`.
- **Swap via parallel assignment**: `a[i], a[j] = a[j], a[i]` — one of Go's cleanest idioms. No `tmp` needed.
- **Slice the output when reporting**: returning `result[:k]` gives the caller only what they need, without copying the full backing array.

---

## How to Run

```bash
go test -v ./...
```

---

## Key Takeaways for Learners

1. **Small-case enumeration is the research tool.** Hand-construct the answer for `n = 3, 4, 5`. The pattern that emerges is the algorithm.
2. **Return `(result, error)` for infeasible inputs.** It's the Go way — explicit, unambiguous, and callers can't accidentally use a bad result.
3. **Benchmark after correctness.** Constructive algorithms are usually O(n); if yours is slower, something in your construction is doing hidden work (e.g. `append` without pre-sizing, allocating in a loop).
