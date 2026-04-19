# Selection Sort — Go Implementation

**Selection Sort** repeatedly finds the minimum of the unsorted portion and swaps it to the front. O(n²) regardless of input — but uses the minimum possible number of writes (exactly n − 1), making it useful when writes are expensive (EEPROM, flash memory).

For the conceptual overview and comparison with Insertion / Bubble sort, see the parent README: [../README.md](../README.md)

---

## Files

| File | Purpose |
|------|---------|
| `main.go` | `SelectionSort(arr []int)` implementation |
| `main_test.go` | Table-driven tests |
| `go.mod` | Module definition |

---

## Complexity

| Case | Time | Space | Swaps |
|------|------|-------|-------|
| Best | O(n²) | O(1) | n − 1 |
| Average | O(n²) | O(1) | n − 1 |
| Worst | O(n²) | O(1) | n − 1 |

All three cases are the same — no early-exit optimization applies.

---

## Go-Specific Notes

- **Multi-assignment swap**: `arr[i], arr[j] = arr[j], arr[i]` — one of Go's cleanest idioms. No `tmp` variable needed.
- **Not stable**: the swap breaks relative order of equal elements. For stable sorting, use `sort.SliceStable` from the stdlib.
- **Generic for Go 1.18+**: `func SelectionSort[T cmp.Ordered](arr []T)`. Works for any ordered type.
- **Rarely the right production choice**: `sort.Slice` is almost always faster. Selection Sort's niche is "minimum writes" — specialized for wear-sensitive storage.

---

## How to Run

```bash
go test -v ./...
```

---

## Key Takeaways for Learners

1. **No early termination possible.** Unlike Bubble Sort (which can stop on a clean pass) or Insertion Sort (which is O(n) on sorted input), Selection Sort always does the full n² comparisons.
2. **Minimum-swap property** is the one thing it does best. If each write costs you (flash memory, EEPROM, blockchain storage), n − 1 writes is optimal.
3. **Teaching value > practical value.** Understanding Selection Sort builds intuition for "find min / find max" loops that appear throughout algorithms. In production code, reach for `sort.Slice`.
