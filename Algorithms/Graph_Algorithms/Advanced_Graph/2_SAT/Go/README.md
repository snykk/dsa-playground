# 2-SAT -- Go Implementation

Linear-time 2-SAT solver using an iterative Tarjan SCC on the implication graph. For the idea, the trace and the complexity, see the topic README: [../README.md](../README.md).

## Files

| File | Purpose |
|------|---------|
| `main.go` | `TwoSAT` type with `AddClause`, `Implies`, `ForceTrue`, `Solve`, plus a small `main` demo |
| `main_test.go` | 9 test functions: SAT, UNSAT, helpers, chains, the empty formula |
| `go.mod` | Module definition (`go 1.21`) |

## API

- `NewTwoSAT(n int) *TwoSAT`: a solver for variables `0..n-1`.
- `(*TwoSAT).AddClause(a, b int)`: add `(a or b)`; literals are `2*x` and `2*x + 1`.
- `(*TwoSAT).Implies(a, b int)`: add `a -> b`.
- `(*TwoSAT).ForceTrue(a int)`: add `(a or a)`.
- `(*TwoSAT).Solve() (bool, []bool)`: satisfiable flag and assignment (`nil` when unsatisfiable).

## Go-Specific Notes

- **Iterative Tarjan** with a `[]frame` stack of `frame{node, nextIdx}`. The loop takes `top := &work[len(work)-1]` and only appends to `work` after it has finished with `top`; a pointer into a slice must not be kept across an `append`.
- **Two return values** `(bool, []bool)` instead of an error: UNSAT is a valid outcome.
- **Assignment rule.** `a[x] = comp[2x] < comp[2x + 1]`, correct for Tarjan numbering.
- **No literal validation.** A literal `>= 2n` panics with an index out of range.
- **Stacks.** Goroutine stacks start small (2 KB) and grow, but iterating avoids relying on that.

## How to Run

```bash
go test ./...
go run main.go        # demo: prints "Satisfiable: true, assignment: [false true]"
```

## Key Takeaways

1. The explicit stack keeps the algorithm linear and independent of recursion depth.
2. `Solve` has no side effects on the clauses; it only recomputes the SCCs.
3. The same comparison as in Python and C++ gives the same assignment.
