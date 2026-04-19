# Insertion Sort — Go Implementation

**Insertion Sort** builds the sorted portion one element at a time, shifting larger values right. O(n²) in general but O(n) on sorted input — making it the sort-of-choice for small or nearly-sorted slices.

For the conceptual overview and comparison with other quadratic sorts, see the parent README: [../README.md](../README.md)

---

## Files

| File | Purpose |
|------|---------|
| `main.go` | `InsertionSort(arr []int)` implementation |
| `main_test.go` | Table-driven tests |
| `go.mod` | Module definition |

---

## Complexity

| Case | Time | Space |
|------|------|-------|
| Best | **O(n)** — already sorted | O(1) |
| Average | O(n²) | O(1) |
| Worst | O(n²) — reverse sorted | O(1) |

---

## Go-Specific Notes

- **`sort.Slice` from the stdlib** is the production answer. Go's stdlib uses a pattern-defeating quicksort (pdqsort since Go 1.19) — much faster than hand-rolled Insertion Sort on large inputs.
- **In-place via slice mutation**: `func InsertionSort(arr []int)` mutates the caller's slice. Go slices are references to a backing array, so no copy needed.
- **Generic version for Go 1.18+**: `func InsertionSort[T cmp.Ordered](arr []T)`. Works for `int`, `string`, `float64`, etc.
- **Adaptive on real data**: Go's `sort.Slice` and many hybrid sorts fall back to Insertion Sort on small subranges (typically < 12 elements) for this exact reason.

---

## How to Run

```bash
go test -v ./...
```

---

## Key Takeaways for Learners

1. **Adaptive sorts win on nearly-sorted input.** Insertion Sort is O(n + inversions). If your slice is "usually close to sorted," it's hard to beat.
2. **In place, stable, simple.** The combination of these three properties is rare; most O(n log n) sorts give up one.
3. **Go's hybrid sort uses Insertion Sort below a threshold.** Reading `sort/zsortfunc.go` in the stdlib source shows exactly how hybrid sorts compose primitives — highly recommended.
