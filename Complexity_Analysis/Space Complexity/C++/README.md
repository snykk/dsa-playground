# Space Complexity — C++ Implementation

**Space Complexity** measures the extra memory an algorithm uses beyond its input — both heap and stack. The same algorithm can have dramatically different space footprints in different implementations (recursive vs iterative, owning vs non-owning views).

For the conceptual overview, see the parent README: [../README.md](../README.md)

---

## Files

| File | Purpose |
|------|---------|
| `space_complexity.cpp` | Concrete examples contrasting O(1), O(log n), and O(n) space |
| `space_complexity_test.cpp` | Tests validating space-bound invariants |

---

## C++-Specific Notes

- **Stack vs heap** is explicit in C++: `int arr[100]` is stack, `new int[100]` is heap. Large stack arrays blow the stack (typically 1-8 MB on Linux); prefer `std::vector<int>(100)` for anything runtime-sized.
- **`std::string_view` / `std::span<T>`** (C++17/20) are non-owning views — O(1) space, perfect for read-only parameters. Replace `const std::string&` / `const std::vector<T>&` when no ownership transfer is needed.
- **Recursion cost**: each recursive call adds a stack frame. Depth-O(n) recursion on large `n` crashes the stack long before it would allocate O(n) on the heap. Convert to iterative where stability matters.
- **SSO (Small String Optimization)** and **Small Vector Optimization** (in some libraries) make small containers free — zero heap allocation for `std::string` ≤ 15 chars on libstdc++.
- **Move semantics vs copy**: passing `std::vector<int>` by value is O(n); by const reference or by `std::move` is O(1).

---

## How to Run

```bash
g++ -std=c++17 -O2 -Wall space_complexity_test.cpp -o space_complexity_test
./space_complexity_test
```

---

## Key Takeaways for Learners

1. **Stack and heap are both space.** A recursive DFS with depth-n call stack uses O(n) space even if it never calls `new`. Convert to iterative for O(1) auxiliary heap (at the cost of an explicit stack).
2. **`string_view` and `span` are free space wins** — pass views instead of owning containers when possible. They're C++'s answer to Go's string slicing semantics.
3. **Tail recursion is not optimized by C++.** Unlike functional languages, a tail call doesn't become a loop. Convert manually if depth is a concern.
