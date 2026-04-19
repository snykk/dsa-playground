# Aho-Corasick — C++ Implementation

An O(n + m + z) multi-pattern string-matching automaton.

For the conceptual overview, visuals, and comparison with alternatives, see the parent README: [../README.md](../README.md)

---

## Files

| File | Purpose |
|------|---------|
| `aho_corasick.h` | Header-only `AhoCorasick` class |
| `aho_corasick_test.cpp` | Assertion-based tests (classic example + overlaps + edge cases) |

---

## C++-Specific Notes

- **Node storage via `std::vector<Node>`** with integer indices (not pointers). This gives cache locality (contiguous memory), avoids per-node heap allocation, and survives `push_back` reallocation because we never hold raw pointers into the vector.
- **`std::unordered_map<char, int>` for children**: byte-level alphabet support with linear space. For ASCII-fixed use cases, swap to `std::array<int, 256>` for a 2–3× speedup.
- **BFS via `std::queue<int>`**: same structural role as `collections.deque` in Python. O(1) push/pop.
- **`int` indices, not `Node*`**: the vector may reallocate during construction, invalidating pointers. Indices are always valid.
- **Structured bindings** (`auto& [c, v] : node.children`) for cleaner iteration — C++17 feature.

---

## How to Run

```bash
g++ -std=c++17 -O2 -Wall aho_corasick_test.cpp -o aho_corasick_test
./aho_corasick_test
```

---

## Key Takeaways for Learners

1. **Indices beat pointers when backing storage grows.** Every production trie / automaton in C++ uses integer node IDs for exactly this reason.
2. **Separate the structure from the search.** The class builds the automaton in the constructor; `search()` is `const` and stateless. This pattern makes the automaton safely shareable across threads for read-only matching.
3. **ASCII-fixed arrays vs. hash maps is a knob.** Hash maps keep space O(m); arrays keep constant-factor speed. For `σ ≤ 26` or `σ ≤ 256`, arrays are usually worth the trade.
