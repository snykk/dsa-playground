# Binary Search on Answer — Go Implementation

**Binary Search on Answer** turns an optimization problem ("find the smallest/largest value satisfying a predicate") into a binary search over the answer space. If the predicate is monotone — "if X works, all values on one side work" — you can binary-search directly on the answer, not on the input array.

For the conceptual overview, canonical problems (Aggressive Cows, Painter's Partition, Koko Eating Bananas), and template, see the parent README: [../README.md](../README.md)

---

## Files

| File | Purpose |
|------|---------|
| `main.go` | Reference implementations: Aggressive Cows, min-max partition, feasibility-check template |
| `main_test.go` | Table-driven tests validating each variant |

---

## Go-Specific Notes

- **Integer overflow protection**: compute `mid` as `low + (high-low)/2`, not `(low+high)/2`. On Go's `int` (platform-dependent, but 64-bit on all common targets), this rarely overflows in practice — but the habit pays off.
- **Feasibility predicate as a closure**: Go makes this clean — `canShip := func(capacity int) bool { ... }` captures local state and gets passed around or inlined into the search loop.
- **`sort.Search` from the stdlib**: for simple monotone predicates, use `sort.Search(n, func(i int) bool { ... })`. It does the binary search for you over `[0, n)` and returns the first `i` where the predicate is `true`.
- **Template sizing**: keep the search bounds as `int` unless the answer can exceed `math.MaxInt32` — then use `int64` explicitly to avoid platform surprises.

---

## How to Run

```bash
go test -v ./...
```

---

## Key Takeaways for Learners

1. **The monotone predicate is the point.** Before writing the loop, prove: "if `k` works, does every `k' > k` also work?" If yes, binary search applies. If no, rethink — you might need a different structure.
2. **Closed-form answers are rare in interview problems.** Binary search on the answer space turns "find the smallest feasible value" into "can I check feasibility in O(n)?" — almost always easier.
3. **`sort.Search` is underused in Go.** It handles integer overflow, edge cases, and the `lo <= hi` loop structure correctly. Reading its source is a good exercise in production-quality binary search.
