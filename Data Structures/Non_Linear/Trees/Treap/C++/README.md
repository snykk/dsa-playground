# Treap — C++ Implementation

Randomized self-balancing BST via split/merge. Expected O(log n) per operation. Uses `std::unique_ptr` for automatic memory management.

For the conceptual overview and comparison with AVL / Red-Black, see the parent README: [../README.md](../README.md)

---

## Files

| File | Purpose |
|------|---------|
| `treap.h` | Header-only `Treap` class with split/merge primitives |
| `treap_test.cpp` | Assertion-based tests including a 1000-op randomized stress test |

---

## C++-Specific Notes

- **`std::unique_ptr<Node>` for ownership.** Split/merge move ownership explicitly via `std::move` — no manual `new`/`delete`, no leaks, no double-frees. This is the canonical modern-C++ way to handle tree ownership.
- **`std::mt19937` for priorities.** Seeded from `std::random_device`. Gives 32-bit priorities with excellent distribution — collisions essentially impossible at normal tree sizes.
- **Structured bindings** (`auto [L, R] = split(...)`) return the two halves of split cleanly. C++17 feature that makes split/merge code readable.
- **Recursive `split` and `merge`**: each is ~8 lines. For adversarial inputs causing deep recursion, convert to iterative — but standard competitive-programming use cases are safe with recursion.
- **No copy constructor**: `std::unique_ptr` forces move-only semantics. If you need copying, implement a deep-clone method explicitly.

---

## How to Run

```bash
g++ -std=c++17 -O2 -Wall treap_test.cpp -o treap_test
./treap_test
```

---

## Key Takeaways for Learners

1. **`unique_ptr` + `std::move` is the ownership story.** Recurse with moves, return pairs of unique pointers, let the destructor clean up. No `delete` anywhere.
2. **Split/merge wins over rotate-based treap** in modern C++. The code is shorter, generalizes to more operations, and maps cleanly to unique pointer ownership.
3. **`mt19937` beats `rand()` everywhere.** `rand()` is legacy, low-quality, and platform-dependent. Every modern C++ project should use `<random>`.
