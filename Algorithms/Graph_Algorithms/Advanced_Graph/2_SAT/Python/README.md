# 2-SAT -- Python Implementation

Linear-time 2-SAT solver: implication graph plus an iterative Tarjan SCC. For the idea, the trace and the complexity, see the topic README: [../README.md](../README.md).

## Files

| File | Purpose |
|------|---------|
| `two_sat.py` | `TwoSAT` class with `add_clause`, `implies`, `force_true`, `solve` |
| `two_sat_test.py` | 10 unit tests: SAT, UNSAT, forced literals, implication chains, the empty formula |

## API

- `TwoSAT(n_vars)`: a solver for variables `0..n_vars-1`.
- `add_clause(a, b)`: add the clause `(a or b)`. Literals are `2*x` (positive) and `2*x + 1` (negated).
- `implies(a, b)`: add `a -> b`, that is the clause `(~a or b)`.
- `force_true(a)`: add `(a or a)`, which pins literal `a` to true.
- `solve()`: returns `(True, assignment)` where `assignment[i]` is the value of variable `i`, or `(False, None)` when unsatisfiable.

## Python-Specific Notes

- **Literal encoding.** `lit ^ 1` negates a literal without a branch.
- **Iterative Tarjan.** The DFS keeps an explicit `work` list of `(node, next neighbour index)` pairs, so a long implication chain does not hit Python's recursion limit.
- **Assignment rule.** `x = comp[2x] < comp[2x + 1]`. Tarjan gives the smallest id to the first SCC it completes, a sink of the condensation, so the smaller id is the later literal in topological order.
- **No literal validation.** A literal `>= 2 * n_vars` raises `IndexError`.
- **Return type.** `solve` returns a tuple, not an exception: UNSAT is a normal result.

## How to Run

```bash
python3 -m unittest two_sat_test
python3 two_sat.py        # demo: prints "Satisfiable: True" and "Assignment: [False, True]"
```

## Key Takeaways

1. A clause `(a or b)` becomes the edges `~a -> b` and `~b -> a`; SCCs do the rest.
2. The satisfiability test is `comp[2x] != comp[2x + 1]` for every variable.
3. The direction of the assignment comparison depends on the SCC numbering, so check it on a small formula.
