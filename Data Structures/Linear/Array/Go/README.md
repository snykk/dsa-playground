# Go Arrays & Slices - Implementation & Insights

This folder contains Go implementations:

1. **Static Array** → `static_array.go`
2. **Dynamic Array** → `dynamic_array.go`
3. **Multi-dimensional Array** → `multi_dimensional_array.go`

Go notes:

- **Array `[N]T`** → fixed size, stack allocated, rarely used directly.
- **Slice `[]T`** → dynamic, built-in growth management.
- Multi-dimensional slices → `[][]T`, can be jagged or uniform.

---

## 📖 Insights

### Static Array

- Fixed size: compile-time constant.
- Useful for **small buffers or constants**.

### Dynamic Array

- Slices wrap an underlying array, track length & capacity.
- `append()` automatically grows the slice.
- Avoid holding references to old slices after append — underlying array may change.

### Multi-dimensional Array

- `[][]T` is idiomatic for 2D grids.
- Memory may not be contiguous, affecting cache performance.
- Flatten slices manually for numeric-heavy computation.

---

## ⚡ Tips

- Preallocate slices using `make([]T, len, cap)` for better performance.
- For matrix/grid problems, consider a **flat slice** for inner loops.
- Always check bounds; Go panics on out-of-range access.
