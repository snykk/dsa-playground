# Pattern Matching — Go Implementation

Pattern matching: **"at which positions does pattern `P` appear inside text `T`?"** This folder contrasts the naive O(n·m) walk against KMP's O(n + m) linear-time algorithm.

For the conceptual overview, complexity proofs, and when-to-use decision table, see the parent README: [../README.md](../README.md)

---

## Files

| File | Purpose |
|------|---------|
| `main.go` | `NaiveSearch` and `KMPSearch` implementations |
| `main_test.go` | Table-driven tests with shared fixtures |
| `go.mod` | Module definition |

---

## Algorithms Covered

| Algorithm | Preprocessing | Match | Good when... |
|-----------|---------------|-------|--------------|
| **Naive** | O(1) | O(n·m) | Pattern is tiny or matches appear early |
| **KMP** | O(m) | O(n + m) | You want guaranteed linear worst-case |

---

## Go-Specific Notes

- **`strings.Index(T, P)` is the stdlib answer.** Go's implementation uses Rabin-Karp with a SIMD-assisted variant on supported architectures. For production code, reach for it first.
- **`strings.Contains`, `strings.Count`, `strings.LastIndex`** all build on the same primitive — know that they exist before writing your own.
- **Byte-level vs rune-level matching**: this implementation operates on bytes (`string` indexing). For rune-level matching of UTF-8 text, convert `T` and `P` to `[]rune` first, or use `regexp` for character-class semantics.
- **KMP's failure function uses `[]int`** — avoid fixed-size arrays unless `m` is known at compile time. Slice allocation is cheap and idiomatic.

---

## How to Run

```bash
go test -v ./...
```

---

## Key Takeaways for Learners

1. **`strings.Index` is already optimized.** If you only need "find substring", use the stdlib. Hand-rolled KMP is educational; reaching for it in production usually means you're solving the wrong problem.
2. **KMP is the foundation for more advanced algorithms** — Aho-Corasick (multi-pattern), Z-algorithm (same preprocessing idea in disguise), suffix automata. Master it first.
3. **Understand amortized analysis here.** Each character of `T` is examined a bounded number of times; the failure function ensures we never re-scan what we've already matched. Trace the pointer by hand on a small example — it's the clearest way to see why it's O(n + m), not O(n·m).
