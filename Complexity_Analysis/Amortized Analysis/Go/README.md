# Amortized Analysis — Go Implementation

**Amortized analysis** measures the _average_ cost of operations across a sequence, rather than the worst case of a single operation. A dynamic array's `append` is the textbook example: occasionally O(n) when the backing array grows, but **O(1) amortized** across any sequence of appends.

For the conceptual overview (aggregate / accounting / potential methods), see the parent README: [../README.md](../README.md)

---

## Files

| File | Purpose |
|------|---------|
| `main.go` | Demonstrations of amortized-O(1) append and amortized-O(log n) DSU |
| `main_test.go` | Tests verifying per-operation cost bounds across long sequences |
| `go.mod` | Module definition |

---

## Go-Specific Notes

- **Go's built-in slice `append`** is the cleanest demo. Growth strategy is 2× up to 1024 elements, then ~1.25×. Total moves across `n` appends is O(n), giving O(1) amortized per append.
- **`sync.Map` uses an amortized-cost hybrid** (read-only map + mutable "dirty" map). Amortized-cost reasoning is how you get its lock-free read fast path without making writes slow.
- **Benchmarking amortized cost**: `go test -bench` reports per-op cost over millions of iterations — exactly what amortized analysis is measuring. A big disparity between benchmark cost and theoretical worst-case often points to amortization.
- **When amortization breaks**: real-time systems (games, audio, control loops) cannot tolerate the occasional O(n) hit, even if the average is O(1). For those cases, use fixed-capacity ring buffers, not growable slices.

---

## How to Run

```bash
go test -v ./...
go run main.go
```

---

## Key Takeaways for Learners

1. **Amortized ≠ average-case.** Average-case makes probabilistic assumptions about _input_. Amortized makes no such assumption — it's a deterministic bound on the total cost of any sequence of operations.
2. **Three proof methods**: aggregate (total work / n operations), accounting (prepaid credit), potential (invariant-based Φ). All three give the same bound for the same algorithm.
3. **Go's slice growth is production-grade amortization.** Reading `runtime/slice.go` (specifically `growslice`) shows exactly how the 2×/1.25× policy keeps `append` O(1) amortized in practice.
