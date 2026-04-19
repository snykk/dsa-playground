# Coordinate Compression — Go Implementation

**Coordinate Compression** takes a set of values from a sparse, huge range (e.g. `[0, 10⁹]`) and maps them to a dense small range (e.g. `[0, n)`) while preserving relative order. It's the enabling trick behind applying arrays / Fenwick trees / segment trees to problems with big coordinates.

For the conceptual overview, canonical problems (Count of Range Sum, 2D events), and step-by-step walkthrough, see the parent README: [../README.md](../README.md)

---

## Files

| File | Purpose |
|------|---------|
| `main.go` | `Compress(values []int) (compressed []int, mapping map[int]int)` and inverse |
| `main_test.go` | Table-driven tests for uniqueness, ordering, and duplicates |

---

## Go-Specific Notes

- **`sort.Slice` + dedup is the two-step idiom**:
  ```go
  sorted := append([]int{}, values...)
  sort.Ints(sorted)
  sorted = unique(sorted) // remove adjacent duplicates
  ```
  Then build a `map[int]int` from original value → compressed index.
- **`sort.SearchInts` for rank lookup**: once you have the sorted-unique slice, `sort.SearchInts(sorted, v)` gives you the compressed index in O(log n). Faster than a map when values are dense or when memory is tight.
- **Stable mapping on duplicates**: the map-based approach naturally collapses duplicates. If you instead want each occurrence to get a distinct rank (useful for some offline problems), use `sort.SliceStable` with a secondary key.
- **Int64 for large coordinates**: if inputs exceed `math.MaxInt32`, use `int64` throughout — but the compressed indices will still be `int` (safe for `n ≤ ~10⁹`, which is all that matters for segment-tree sizes).

---

## How to Run

```bash
go test -v ./...
```

---

## Key Takeaways for Learners

1. **The trick is: the algorithm doesn't care about actual values, only their order.** If your segment tree needs to index by position and positions can be huge, compress them — you only ever needed the ranks.
2. **`sort + dedup + map` is the mechanical recipe.** Master this three-step pattern once and you'll apply it dozens of times in competitive-programming problems.
3. **Don't compress when you don't need to.** If the value range is small (e.g. `[0, 10⁶]`), use a plain array directly — compression adds constant-factor overhead and obscures intent.
