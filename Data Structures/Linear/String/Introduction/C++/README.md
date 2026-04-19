# String Introduction — C++ Implementation

This folder covers the **fundamental operations** on strings in C++: indexed access, length, traversal, concatenation, and substring. The twist: C++ gives you three common string types (`std::string`, `std::string_view`, C-style `const char*`) and choosing between them is the real lesson.

For the conceptual overview and cross-language comparison, see the parent README: [../README.md](../README.md)

---

## Files

| File | Purpose |
|------|---------|
| `main.cpp` | Reference implementations of the five core operations |
| `main_test.cpp` | Unit tests covering empty strings and bounds |

---

## Operations Covered

| Operation | Complexity | What it teaches |
|-----------|------------|-----------------|
| `access_char(s, i)` | O(1) | `s[i]` and `s.at(i)` — the latter bounds-checks |
| `string_length(s)` | O(1) | `.size()` / `.length()` read a cached field |
| `traverse_string(s)` | O(n) | Range-for vs iterator vs index — all work |
| `concatenate(s1, s2)` | O(n + m) | `operator+` allocates; `operator+=` may reuse capacity |
| `substring(s, l, r)` | O(r - l) | `.substr()` copies; `string_view` does not |

---

## C++-Specific Notes

- **Three string types, three trade-offs:**
  - `std::string` — owns its buffer, heap-allocated (unless Small String Optimization applies — typically ≤15 chars stored inline).
  - `std::string_view` (C++17) — non-owning view; O(1) slicing. Never outlive the underlying buffer!
  - `const char*` — legacy C strings. Null-terminated. `strlen` is O(n) — avoid in hot loops.
- **`.substr()` copies.** If you only need to _read_ the slice, use `std::string_view` and avoid the allocation.
- **`.at(i)` throws `std::out_of_range`; `s[i]` is undefined behavior past the end.** Use `.at()` when input is user-controlled.
- **`std::string` stores bytes, not code points.** For UTF-8, `s.size()` gives byte length — reach for a library (ICU, utf8cpp) for grapheme-aware logic.

---

## How to Run

```bash
g++ -std=c++17 -O2 -Wall main_test.cpp -o main_test
./main_test
```

---

## Key Takeaways for Learners

1. **Prefer `std::string_view` for read-only parameters.** `void print(std::string_view s)` avoids forcing callers to allocate if they pass a literal or `char*`.
2. **Understand SSO.** Short strings are stored inline in the `std::string` object itself — no heap allocation. That's why `std::string` often outperforms naive expectations.
3. **C-string interop needs care.** `.c_str()` returns a null-terminated pointer valid only while the `std::string` is alive and unmodified. Do not cache the pointer across mutations.
