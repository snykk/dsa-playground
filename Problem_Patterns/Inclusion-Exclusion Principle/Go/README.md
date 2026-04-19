# Inclusion-Exclusion Principle — Go Implementation

The **Inclusion-Exclusion Principle (IEP)** is a counting technique: to count the union of sets, add each set's size, subtract pairwise intersections, add triple intersections, and so on — alternating signs. It's the combinatorial engine behind "count numbers divisible by any of p₁…pₖ", coprime counting, Möbius inversion, and many CP problems.

For the conceptual overview, proof sketch, and canonical problems (divisor counting, derangements), see the parent README: [../README.md](../README.md)

---

## Files

| File | Purpose |
|------|---------|
| `main.go` | Reference implementations: union-size counting, divisor-by-primes, Möbius-style applications |
| `main_test.go` | Table-driven tests for each variant |

---

## Go-Specific Notes

- **Bitmask iteration**: for `k` sets, enumerate all `2^k` subsets with `for mask := 1; mask < (1 << k); mask++`. The popcount of `mask` (use `bits.OnesCount`) tells you whether to add or subtract for that term.
- **`math/bits` has popcount**: `bits.OnesCount(uint(mask))` is one instruction on modern CPUs. Don't hand-roll it.
- **Sign alternation**: `sign = 1 - 2 * (bits.OnesCount(uint(mask)) % 2)` gives `+1` for even, `-1` for odd. Clean and branchless.
- **Overflow care for products of primes**: when computing `n / (p1 * p2 * ... * pk)`, watch for overflow. Check `prod > n/curr_p` before multiplying, or use `big.Int` for worst-case safety.
- **Set representation**: small `k` (≤ 20) fits in a `uint32`; larger `k` usually doesn't come up in practice for IEP because `2^k` becomes infeasible anyway.

---

## How to Run

```bash
go test -v ./...
```

---

## Key Takeaways for Learners

1. **IEP is about alternating signs.** `|A ∪ B ∪ C| = |A| + |B| + |C| - |A∩B| - |A∩C| - |B∩C| + |A∩B∩C|`. The pattern generalizes mechanically — once you see it, you apply it everywhere.
2. **Enumerate subsets with bitmasks.** For `k` primes / constraints, loop over `[1, 2^k)`. Each bit set selects a constraint; the popcount's parity gives the sign.
3. **Check feasibility up front.** `2^k` grows fast — `k = 30` is already 10⁹. If `k` is large and the intersections aren't all efficient to compute, you need a different approach (e.g. Möbius function + precomputation).
