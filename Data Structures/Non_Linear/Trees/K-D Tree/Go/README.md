# K-D Tree — Go Implementation

Runtime-variable dimensionality K-D Tree supporting build, insert, nearest-neighbor, and range queries.

For the conceptual overview, see the parent README: [../README.md](../README.md)

---

## Files

| File | Purpose |
|------|---------|
| `main.go` | `KDTree` type with `Insert`, `Nearest`, `RangeSearch` methods |
| `main_test.go` | 9 tests: textbook example, random cross-check, 3D support |
| `go.mod` | Module definition |

---

## Go-Specific Notes

- **`Point = []float64`** for runtime-variable dimensionality. Unlike C++'s compile-time `K`, Go users specify dimensionality by the length of the first inserted point.
- **`sort.Slice` with axis closure**: clean way to pivot-sort by different axes at different levels without duplicating code.
- **`*node` pointers** with automatic GC: no manual lifetime management. Dropping the tree reference lets GC reclaim the whole structure.
- **Panic on dimensionality mismatch**: `Insert(p)` panics if `len(p) != k`. Matches Go stdlib conventions for programmer errors (like slice indexing).
- **No generics**: uses concrete `float64`. A 1.18+ version could be `type Point[T constraints.Float] []T`.

---

## How to Run

```bash
go test -v ./...
```

---

## Key Takeaways for Learners

1. **Runtime-variable k** is Go's typical approach; C++ templates give compile-time K. Pick based on whether you know the dimensionality at compile time.
2. **`sort.Slice` per recursive call** — the axis parameter changes at each level, so the comparator must capture it. A closure handles this cleanly.
3. **Squared distance — not Euclidean.** `math.Sqrt` is expensive in the inner loop. For comparison (`a < b`), squared distance gives the same answer without the square root.
