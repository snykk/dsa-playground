# C++ Arrays - Implementation & Insights

Contains implementations for:

1. **Static Array** → `static_array.cpp`
2. **Dynamic Array** → `dynamic_array.cpp`
3. **Multi-dimensional Array** → `multi_dimensional_array.cpp`

C++ notes:

- Use `std::array<T,N>` for **fixed-size arrays**.
- Use `std::vector<T>` for **dynamic arrays** — they handle resizing and memory efficiently.
- Multi-dimensional arrays can be:
  - **Contiguous** (`T data[rows*cols]`) for performance
  - **Vector of vectors** (`std::vector<std::vector<T>>`) for flexibility

---

## 📖 Insights

### Static Array

- Memory allocated on **stack or heap**.
- Very fast access (O(1)), no resizing.
- Insert/delete requires shifting elements (O(n)).

### Dynamic Array

- `std::vector` uses **amortized doubling strategy**.
- `push_back()` is O(1) amortized.
- Always use `reserve()` if size is known for efficiency.

### Multi-dimensional Array

- Row-major storage for cache-friendly access.
- Jagged arrays (vector-of-vectors) allow non-uniform row lengths.
- Flattened 1D array often better for numeric algorithms (matrix multiplication, DP).

---

## ⚡ Tips

- Avoid keeping **raw pointers to vector elements** if vector may resize.
- Use **iterators carefully**, as they may become invalid after resizing.
- Prefer contiguous storage for high-performance numerical algorithms.
