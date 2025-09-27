# 📦 Array - Comprehensive Guide

An **array** is one of the most fundamental linear data structures. It stores elements of the same type in **contiguous memory**, which allows **constant-time access** via an index.

Arrays are foundational for implementing other data structures like stacks, queues, matrices, hash tables, and even some advanced structures like segment trees.

---

## 🔹 Subtopics

- **Static Array**: Fixed size, best when the size is known in advance.
- **Dynamic Array**: Resizable, handles unknown sizes efficiently, amortized append O(1).
- **Multi-dimensional Array**: 2D, 3D, or N-D arrays for matrices, grids, and complex data representations.

---

## 📖 Why Arrays Matter

1. **Fast access:** Direct access to elements using an index.
2. **Memory efficiency:** Contiguous storage allows cache-friendly operations.
3. **Foundation:** Many algorithms and structures rely on arrays internally.

**Trade-offs:**

- Insertion/deletion in the middle is O(n).
- Fixed-size arrays can waste memory or require manual resizing.

---

## 📂 Implementations

You can explore implementations in:

- Python → [`Python/`](./Python)
- C++ → [`C++/`](./C++)
- Go → [`Go/`](./Go)

Each language folder contains:

- Static array
- Dynamic array
- Multi-dimensional array

---

## 💡 Tips

- Always choose **dynamic arrays** if the size is unknown.
- For **numerical computations**, use flattened multi-dimensional arrays for cache efficiency.
- Remember **row-major vs column-major** layout when working with multi-dimensional arrays in C++/Go.
- Understand **amortized complexity** for dynamic arrays — it’s different from worst-case per-operation.
