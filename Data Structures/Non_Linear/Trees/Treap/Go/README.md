# Treap — Go Implementation

Randomized self-balancing BST via split/merge. Expected O(log n) per operation.

For the conceptual overview and comparison with AVL / Red-Black, see the parent README: [../README.md](../README.md)

---

## Files

| File | Purpose |
|------|---------|
| `main.go` | `Treap` type with `Insert`, `Delete`, `Contains`, `Inorder` methods |
| `main_test.go` | Table-driven tests + 1000-op randomized stress test |
| `go.mod` | Module definition |

---

## Go-Specific Notes

- **`*node` pointers**: Go's GC makes manual memory management irrelevant. Keep pointers; let the GC reclaim when subtrees drop.
- **`math/rand.Uint32()` for priorities**: fine for algorithmic use. For adversarial contexts (contest judges seeding inputs to your randomness), use `math/rand/v2` with `ChaCha8` or seed from `crypto/rand`.
- **Closures for tree walks**: `var walk func(n *node)` followed by `walk = func(n *node) { ... walk(n.left) ... }` is the Go way to express recursive closures. The two-line pattern is needed because Go doesn't support forward self-reference in a single `var` decl.
- **`split` and `merge` as free functions**: they don't need access to private state of `Treap`, so they're package-level helpers. Cleaner than methods.
- **`nil`-safe everywhere**: `split(nil, k)` and `merge(nil, x)` both work correctly. This makes the recursive formulation significantly easier to reason about.

---

## How to Run

```bash
go test -v ./...
```

---

## Key Takeaways for Learners

1. **`nil` is a valid treap.** Every split/merge operation treats `nil` as "empty subtree" — the recursion bottoms out without special-casing. This is the single most important insight for clean tree code in Go.
2. **Closures over local state beat threading arguments.** The `walk` helpers capture `out` via closure instead of returning/accumulating — cleaner and Go-idiomatic.
3. **`math/rand` is thread-unsafe**: if multiple goroutines insert concurrently, seed a `*rand.Rand` per goroutine. The default global `rand` has internal locking but that hurts throughput.
