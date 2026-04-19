# Constructive Algorithms — C++ Implementation

**Constructive algorithms** directly build a valid answer satisfying the constraints, without search. The core skill is pattern recognition — "what structure automatically satisfies all the rules?"

For the conceptual overview and worked examples, see the parent README: [../README.md](../README.md)

---

## Functions Included

| Function | What it constructs | Technique |
|----------|-------------------|-----------|
| `constructPermutation(n, k)` | Permutation of `[1..n]` with `k` adjacent differences | Alternate small/large |
| `constructArrayWithSum(n, total, lo, hi)` | Array summing to `total`, values in `[lo, hi]` | Fill with `lo`, distribute remainder |
| `constructGraph(degrees)` | Graph matching degree sequence | Havel-Hakimi |
| `constructString(n, a, b)` | String of length `n` with `a` As and `b` Bs | Interleave to avoid runs |

---

## C++-Specific Notes

- **Prefer `std::vector<int>` return** over output parameters. Named Return Value Optimization (NRVO) makes this zero-cost in modern compilers.
- **`std::iota` for initial permutation**: `std::vector<int> v(n); std::iota(v.begin(), v.end(), 1);` gives `[1, 2, ..., n]` — then rearrange in place.
- **Reserve capacity**: `result.reserve(n)` before a loop of `push_back` avoids reallocation — classic O(n²) → O(n) fix that the compiler can't do for you.
- **Feasibility returns**: either throw `std::invalid_argument` for impossible inputs, or return `std::optional<std::vector<int>>` (C++17+). Silent empty return conflates "no solution" with "solution is empty".
- **`std::swap` over temporaries**: in-place rearrangements use `std::swap(v[i], v[j])`. The `<utility>` header is automatically included via `<vector>`.

---

## How to Run

```bash
g++ -std=c++17 -O2 -Wall constructive_algorithms_test.cpp -o constructive_algorithms_test
./constructive_algorithms_test
```

---

## Key Takeaways for Learners

1. **Work examples by hand first.** For `n = 3, 4, 5` manually produce a valid construction. The pattern almost always reveals itself before you write code.
2. **Greedy-plus-rule is the default approach.** Construct greedily, and when a constraint tightens, fix it locally. The "rule" is the creative part.
3. **Infeasibility is a first-class case.** `constructArrayWithSum(3, 100, 1, 5)` is impossible (`3 * 5 = 15 < 100`). Bail early and explicitly — don't return garbage.
