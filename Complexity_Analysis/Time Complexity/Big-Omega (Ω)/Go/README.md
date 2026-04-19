# Big-Omega (Ω) Notation — Go Implementation

**Big-Omega (Ω)** is the asymptotic **lower bound** on an algorithm's running time. Where Big-O asks "at worst how slow?", Big-Omega asks "at best how slow?" — crucial for proving impossibility results like "no comparison sort can beat Ω(n log n)."

For the conceptual overview and comparison with O / Θ, see the parent README: [../README.md](../README.md)

---

## Files

| File | Purpose |
|------|---------|
| `main.go` | Concrete Ω-analysis examples |
| `main_test.go` | Tests validating minimum-cost claims |
| `go.mod` | Module definition |

---

## Go-Specific Notes

- **Benchmarks expose Ω empirically**: `go test -bench` runs each benchmark many times and reports per-op cost. A flat line as input grows suggests O(1); linear growth suggests Θ(n) (and hence Ω(n)).
- **`sort.Slice` achieves Ω(n log n)** — matching the comparison-sort lower bound. Any comparison-based sort in Go is stuck at this bound.
- **Sub-linear is possible with structure**: if your input is sorted (precondition), binary search gets O(log n) — better than the Ω(n) of a linear scan on unsorted data. The lower bound _depends on what you know_.
- **Ω vs expected-case**: randomized algorithms (Quick Sort, hash tables) are Ω(n) worst-case and O(log n) or O(1) expected. Both statements are true; choose your framing based on the audience.

---

## How to Run

```bash
go test -v ./...
go test -bench=.
```

---

## Key Takeaways for Learners

1. **Ω bounds what's achievable.** "This problem is Ω(f(n))" means no algorithm can be asymptotically faster. Useful for framing what optimization is even possible.
2. **Use the duality**: `f = Ω(g)` iff `g = O(f)`. Pick the direction with the cleaner proof.
3. **Structure unlocks better lower bounds**: sorting with integers in [0, n] is Ω(n), not Ω(n log n), because Counting Sort doesn't need comparisons. Every lower bound comes with assumptions — know them.
