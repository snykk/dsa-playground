# 2-SAT -- C++ Implementation

Linear-time 2-SAT solver using an iterative Tarjan SCC over the implication graph. For the idea, the trace and the complexity, see the topic README: [../README.md](../README.md).

## Files

| File | Purpose |
|------|---------|
| `two_sat.h` | Header-only `TwoSAT` class with `addClause`, `implies`, `forceTrue`, `solve` |
| `two_sat_test.cpp` | 9 assert-based tests: SAT, UNSAT, forced literals, chains, the empty formula |

## API

- `TwoSAT(int n_vars)`: a solver for variables `0..n_vars-1`.
- `void addClause(int a, int b)`: add `(a or b)`; literals are `2*x` and `2*x + 1`.
- `void implies(int a, int b)`: add `a -> b`.
- `void forceTrue(int a)`: add `(a or a)`.
- `std::optional<std::vector<bool>> solve()`: the assignment, or `std::nullopt` when unsatisfiable.

## C++-Specific Notes

- **`std::optional`** (C++17) signals UNSAT without an output parameter, so compile with `-std=c++17`.
- **Iterative Tarjan** with `std::stack<std::pair<int, int>>` holding `(node, next neighbour index)`; it does not recurse, so large instances cannot overflow the call stack.
- **`std::vector<bool>`** stores the assignment as packed bits.
- **Assignment rule.** `assignment[x] = comp_[2x] < comp_[2x + 1]`, correct for Tarjan numbering (sinks first).
- **No literal validation.** A literal `>= 2 * n_vars` is undefined behaviour.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD two_sat_test.cpp -o two_sat_test
./two_sat_test
```

## Key Takeaways

1. The header is the whole solver; include it and call `solve()`.
2. UNSAT is a value (`std::nullopt`), not an exception.
3. The comparison `comp_[2x] < comp_[2x + 1]` only holds for an SCC algorithm that numbers sinks first.
