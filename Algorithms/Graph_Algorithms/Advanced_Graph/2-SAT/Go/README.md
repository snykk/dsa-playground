# 2-SAT — Go Implementation

Linear-time 2-SAT solver via iterative Tarjan's SCC on an implication graph.

For the conceptual overview, see the parent README: [../README.md](../README.md)

---

## Files

| File | Purpose |
|------|---------|
| `main.go` | `TwoSAT` type with `AddClause`, `Implies`, `ForceTrue`, `Solve` |
| `main_test.go` | Tests for SAT / UNSAT, helper methods, and textbook examples |
| `go.mod` | Module definition |

---

## Go-Specific Notes

- **Iterative Tarjan with a `[]frame` stack**: `frame{node, nextIdx}` holds the DFS state. We mutate via `top := &work[len(work)-1]` to avoid copying the frame. A classic Go iterative-DFS pattern.
- **Returning `(bool, []bool)`** rather than using `error`: UNSAT is a valid outcome, not an error condition. Two-value returns are idiomatic Go for optional results.
- **Taking a pointer to the last element of a slice** (`&work[len(work)-1]`) is safe _unless_ the slice is then `append`-ed, which may reallocate. Since we `append` to `work` only after finishing with the current `top`, this is safe — but be aware of the pattern.
- **`lit` helper with variadic `positive ...bool`**: lets callers write `lit(0)` or `lit(0, false)` for positive/negative literal. Go's variadic-with-default trick.
- **No generics needed**: everything is `int`. If you need other variable types, they'd need to be indexed externally and mapped to 0..n-1.

---

## How to Run

```bash
go test -v ./...
```

---

## Key Takeaways for Learners

1. **Iterative Tarjan preserves the O(V+E) bound** without risking stack overflow. Go goroutine stacks start small (8KB) but can grow — still, for 10M-literal instances, iterate.
2. **`&slice[len(slice)-1]`** gives you a mutable handle to the last element without copying. Powerful pattern for stack-based algorithms, but invalidated by `append` growth — never take the pointer across an `append`.
3. **SAT solvers are a gateway.** 2-SAT is the first step on the ladder — once you understand the implication graph + SCC construction, general SAT's CDCL algorithm becomes approachable.
