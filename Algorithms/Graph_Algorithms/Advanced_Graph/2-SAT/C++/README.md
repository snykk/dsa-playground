# 2-SAT — C++ Implementation

Linear-time 2-SAT solver using an iterative Tarjan's SCC over the implication graph.

For the conceptual overview, see the parent README: [../README.md](../README.md)

---

## Files

| File | Purpose |
|------|---------|
| `two_sat.h` | Header-only `TwoSAT` class with `addClause`, `implies`, `forceTrue`, `solve` |
| `two_sat_test.cpp` | Assertion-based tests for SAT / UNSAT variants |

---

## C++-Specific Notes

- **`std::optional<std::vector<bool>>`** as the return type: `nullopt` signals UNSAT, otherwise holds the assignment. C++17 feature, cleaner than output parameters or sentinel vectors.
- **Iterative Tarjan via `std::stack<std::pair<int, int>>`**: the pair is `(node, next-neighbor-index)`. Avoids recursion depth blowouts on large instances.
- **`std::vector<bool>` for the assignment**: packed bits, 1/8 the memory of `std::vector<int>`. For 10M-variable 2-SAT, that matters.
- **Literal XOR trick**: `lit ^ 1` negates. Fundamental — memorize it.
- **Return-by-value into `std::optional`**: NRVO/move elision makes this free. No output-parameter ceremony needed.

---

## How to Run

```bash
g++ -std=c++17 -O2 -Wall two_sat_test.cpp -o two_sat_test
./two_sat_test
```

---

## Key Takeaways for Learners

1. **Iterative Tarjan is worth learning.** The recursive version is clearer, but contest inputs with 10⁶ literals can blow the default stack. Converting is mechanical but worth practicing.
2. **`std::optional<T>` is the modern failure-signalling type.** Prefer it over `std::pair<bool, T>` or throwing exceptions for recoverable failures like UNSAT.
3. **The assignment rule `comp[2x] < comp[2x+1]`** is specific to Tarjan's finish-order convention. Different SCC algorithms flip the direction — always verify against a known-good test case.
