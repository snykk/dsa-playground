# Pattern Matching — C++ Implementation

Pattern matching: **"at which positions does pattern `P` appear inside text `T`?"** This folder contrasts the naive O(n·m) walk against KMP's O(n + m) linear-time algorithm.

For the conceptual overview, complexity proofs, and when-to-use decision table, see the parent README: [../README.md](../README.md)

---

## Files

| File | Purpose |
|------|---------|
| `pattern_matching.cpp` | `naiveSearch` and `kmpSearch` implementations |
| `pattern_matching_test.cpp` | Unit tests with empty / no-match / multi-match fixtures |

---

## Algorithms Covered

| Algorithm | Preprocessing | Match | Good when... |
|-----------|---------------|-------|--------------|
| **Naive** | O(1) | O(n·m) | Pattern is tiny or matches appear early |
| **KMP** | O(m) | O(n + m) | You want guaranteed linear worst-case |

---

## C++-Specific Notes

- **`std::string::find()` is the stdlib answer.** The G++ implementation uses a Boyer-Moore-Horspool-like algorithm. If you just need to find a substring, `T.find(P)` is correct and fast.
- **C++17 added `std::boyer_moore_searcher` and `std::boyer_moore_horspool_searcher`** in `<functional>`. Use them with `std::search(T.begin(), T.end(), searcher(P.begin(), P.end()))` for best-in-class pattern matching with zero hand-rolling.
- **KMP's failure function uses `std::vector<int>`**: avoid C arrays. The `prefix_function` computation is subtle — it's the algorithm every C++ interview uses to test whether you understand amortization.
- **`std::string_view` is great here.** Pass text and pattern as `string_view` to avoid allocations when callers pass literals or sub-strings.

---

## How to Run

```bash
g++ -std=c++17 -O2 -Wall pattern_matching_test.cpp -o pattern_matching_test
./pattern_matching_test
```

---

## Key Takeaways for Learners

1. **Naive is not always wrong.** For very short patterns (`m ≤ 3`) or patterns that match early, naive outperforms KMP due to cache friendliness and zero preprocessing.
2. **KMP's failure function is amortized.** Each comparison either extends the match or backs up via the failure array — the total work over the inner loop is O(n + m), not O(n·m). Tracing the pointer by hand on a small example is the clearest way to see it.
3. **Know the stdlib before writing your own.** C++17 `boyer_moore_searcher` is faster than most hand-rolled KMP implementations on long patterns — reach for it first.
