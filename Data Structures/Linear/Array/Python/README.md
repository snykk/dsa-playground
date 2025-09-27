# Python Arrays - Implementation & Insights

This folder contains Python implementations of arrays:

1. **Static Array** → `static_array.py`
2. **Dynamic Array** → `dynamic_array.py`
3. **Multi-dimensional Array** → `multi_dimensional_array.py`

Python notes:

- Python's `list` is already a dynamic array.
- `array` module provides **typed arrays** for memory efficiency.
- Use **nested lists** for multi-dimensional arrays, or **NumPy** for large-scale numeric operations.

---

## 📖 Insights

### Static Array

- Limited use in Python (mainly educational).
- Direct access is O(1), insertion/deletion is O(n).

### Dynamic Array

- Python `list` implements **dynamic resizing** internally.
- Doubling strategy ensures **amortized O(1) append**.
- Slicing creates **new copies**, watch for performance implications.

### Multi-dimensional Array

- Nested lists: intuitive but may be less memory-efficient.
- Flattened arrays: better for numeric computations.
- For performance-critical tasks, prefer **NumPy arrays**.

---

## ⚡ Tips

- Use `len()` to get size; `append()` to add elements.
- Avoid repeated concatenation in loops (`O(n^2)` time) — use `append` or list comprehension.
- Flatten 2D arrays for algorithms like BFS/DFS on grids for cache-friendly access.
