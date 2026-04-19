# Aho-Corasick — Go Implementation

An O(n + m + z) multi-pattern string-matching automaton.

For the conceptual overview, visuals, and comparison with alternatives, see the parent README: [../README.md](../README.md)

---

## Files

| File | Purpose |
|------|---------|
| `main.go` | `AhoCorasick` type with `New(patterns)` + `Search(text)` |
| `main_test.go` | Table-driven tests covering classic, overlapping, and edge cases |
| `go.mod` | Module definition |

---

## Go-Specific Notes

- **`[]node` with integer children** keeps nodes cache-adjacent. We never hold a `*node` pointer across `append` — indices survive reallocation, pointers would not.
- **`map[byte]int` children** for byte-level alphabet (covers all 8-bit inputs, including UTF-8 at byte granularity). For UTF-8-aware rune matching, convert to `map[rune]int` — otherwise you match code points as byte sequences, which is fine for most text.
- **Simple BFS queue** with `queue[0]` / `queue[1:]` — idiomatic Go; for large pattern sets, pre-size the queue or use `container/list`.
- **No concurrency primitives**: `New` is not thread-safe, but `Search` on a built automaton is (the struct is read-only after construction). This enables sharing one automaton across worker goroutines.
- **`Match` struct** exposes `EndIndex` and `PatternID` rather than returning the pattern string directly — cheaper (no allocation) and easier to batch into slices.

---

## How to Run

```bash
go test -v ./...
```

---

## Key Takeaways for Learners

1. **Indices, not pointers.** Go's `append` may reallocate the backing array of `nodes`, invalidating any pointers you held. Integer IDs are stable forever.
2. **The automaton is read-only after build.** That makes it a natural fit for high-throughput servers: build once, search concurrently from every request handler.
3. **Byte-level matching is almost always what you want.** UTF-8 has the property that any byte sequence that's a valid encoding remains a valid encoding in context — so byte-level Aho-Corasick finds the right matches for multi-byte characters without extra decoding.
