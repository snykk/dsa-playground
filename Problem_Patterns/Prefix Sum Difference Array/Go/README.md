# Prefix Sum / Difference Array — Go Implementation

**Prefix Sum** answers "what is the sum of `arr[l..r]`?" in O(1) after O(n) preprocessing. **Difference Array** is its dual: it makes "add `x` to every element in `arr[l..r]`" O(1) per update, rebuilding the final array in O(n) at the end. Together they are the go-to pattern for range-query / range-update problems.

For the conceptual overview, 1D and 2D variants, and canonical problems (Subarray Sum Equals K, Range Update Queries, Skyline), see the parent README: [../README.md](../README.md)

---

## Files

| File | Purpose |
|------|---------|
| `main.go` | `BuildPrefixSum`, `RangeSum`, `DifferenceArray`, and 2D variants |
| `main_test.go` | Table-driven tests covering boundaries and 2D cases |

---

## Go-Specific Notes

- **1-indexed prefix sums avoid a conditional**: build `prefix` of length `n+1` with `prefix[0] = 0` and `prefix[i] = prefix[i-1] + arr[i-1]`. Then `rangeSum(l, r) = prefix[r+1] - prefix[l]` — no "is l zero?" special case.
- **`[]int64` for large sums**: individual elements might fit in `int32`, but cumulative sums can overflow. Use `int64` defensively.
- **2D prefix sum with inclusion-exclusion**: `p[i][j] = p[i-1][j] + p[i][j-1] - p[i-1][j-1] + arr[i-1][j-1]`. Forgetting the minus term (double-subtracting the top-left corner) is the single most common bug.
- **Difference array for range updates**: `diff[l] += x; diff[r+1] -= x`. After all updates, prefix-sum the diff array to recover the final values. Turns Q queries of `O(n)` each into O(Q + n) total.
- **Avoid `append` in hot loops**: pre-size the prefix array with `make([]int64, n+1)` — `append` growth doubles and may copy.

---

## How to Run

```bash
go test -v ./...
```

---

## Key Takeaways for Learners

1. **Prefix sum turns range queries into O(1).** The moment you see "sum over a range" in a query problem, reach for prefix sums. It's the single highest-yield pattern in this list.
2. **Difference array is prefix sum's dual.** Range _updates_ get O(1) each at the cost of losing random-read during the update phase. For offline problems (all updates, then all queries), this is a killer combination.
3. **2D version needs four terms.** Inclusion-exclusion on a 2D grid: add two cumulative terms, subtract the shared overlap. Draw a 4×4 example by hand once — it'll stick for good.
