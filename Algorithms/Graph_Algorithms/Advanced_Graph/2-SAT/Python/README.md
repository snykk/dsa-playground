# 2-SAT — Python Implementation

Linear-time 2-SAT solver via implication graph + Tarjan's SCC.

For the conceptual overview, visuals, and complexity proof, see the parent README: [../README.md](../README.md)

---

## Files

| File | Purpose |
|------|---------|
| `two_sat.py` | `TwoSAT` class with `add_clause`, `implies`, `force_true`, `solve` |
| `two_sat_test.py` | Unit tests covering SAT / UNSAT and helper-method semantics |

---

## Python-Specific Notes

- **Literal encoding `2x` / `2x+1`**: positive `x` → `2x`, negated → `2x+1`. The neat property: `lit ^ 1` gives you the negation for free. No branch, no conditional.
- **Iterative Tarjan** (not recursive): Python's default recursion limit is 1000; real 2-SAT instances can exceed that. We use an explicit `work` stack so the algorithm survives 1M+ literals.
- **`sys.setrecursionlimit`** still bumped as a safety net in case of future non-iterative helpers. Always restored via `finally`.
- **Helpers `implies` and `force_true`**: syntactic sugar over `add_clause`. Clearer at the call site and avoids "what do I pass for the two-literal version of a one-literal clause?" confusion.
- **Assignment rule**: `x = true iff comp[2x] < comp[2x+1]`. Tarjan assigns lower IDs to SCCs finished first (sinks in the condensation DAG). The literal whose SCC has the _lower_ ID comes later in topological order — that's the "safely forced true" side.

---

## How to Run

```bash
python3 -m unittest two_sat_test.py
```

---

## Key Takeaways for Learners

1. **2-SAT is the miracle of 2-literal clauses.** Adding a third literal makes SAT NP-complete. Restricting to 2 makes it linear. Few complexity results are this sharp.
2. **Implication graph is the trick.** `(a ∨ b)` becomes `¬a → b` and `¬b → a`. Two directed edges per clause. SCC analysis does the rest.
3. **Tarjan's ID ordering matters.** Different SCC implementations (Tarjan vs. Kosaraju, forward vs. backward) produce different orderings. Understand your tool's convention before writing the assignment rule — flipping `<` vs `>` silently produces garbage.
