# Convex Hull Trick — Go Implementation

Monotonic CHT + Li Chao Tree for min queries. Uses `math/big` for overflow-free cross-multiplication.

For the conceptual overview, see the parent README: [../README.md](../README.md)

---

## Files

| File | Purpose |
|------|---------|
| `main.go` | `MonotonicCHT` + `LiChaoTree` types with min-query semantics |
| `main_test.go` | Table-driven tests + random stress against brute-force |
| `go.mod` | Module definition |

---

## Go-Specific Notes

- **`math/big.Int` for cross-multiplication**: Go has no `int128`. For overflow-free `(b3-b1)*(m1-m2) <= (b2-b1)*(m1-m3)` with `int64` slopes/intercepts, we multiply as `big.Int`. Slower than the C++ `__int128` path but exactly correct at any magnitude.
- **Slice as deque**: `lines[1:]` for pop-front leaks capacity. For very long runs, periodically copy into a fresh slice. For one-shot CHT usage, it's fine.
- **Recursive Li Chao**: Go's goroutine stacks grow dynamically, so recursion depth ~60 (for V = 10¹⁸) is trivial.
- **Structs as values**: `Line{M, B}` lives in slices with zero indirection — cache-friendly. No pointer chasing in the monotonic CHT hot loop.
- **`panic` on out-of-range query**: matches Go's "panic on programming error" convention. Alternative would be `(int64, error)` returns; panic is more ergonomic for tight loops.

---

## How to Run

```bash
go test -v ./...
```

---

## Key Takeaways for Learners

1. **`math/big` is Go's answer to 128-bit arithmetic.** For algorithmic code that's not in a hot loop, it's perfectly fine. For hot loops, switch to careful overflow-aware integer math or accept the performance hit.
2. **Li Chao's recursion is bounded by `log(hi - lo)`.** On a typical range `[-10⁹, 10⁹]`, that's ~30 levels. Go goroutine stacks handle this easily without tuning.
3. **Testing against brute force** is the gold standard for CHT-like algorithms. They're subtle; random stress tests with a `min(m·x + b for each line)` reference catch the bugs that targeted tests miss.
