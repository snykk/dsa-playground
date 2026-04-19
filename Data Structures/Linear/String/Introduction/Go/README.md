# String Introduction — Go Implementation

This folder covers the **fundamental operations** on strings in Go: indexing, length, traversal, concatenation, and substring. Go's strings are immutable byte sequences — and the distinction between `byte` and `rune` is where most beginner bugs live.

For the conceptual overview and cross-language comparison, see the parent README: [../README.md](../README.md)

---

## Files

| File | Purpose |
|------|---------|
| `main.go` | Reference implementations of the five core operations |
| `main_test.go` | Table-driven tests |
| `go.mod` | Module definition |

---

## Operations Covered

| Operation | Complexity | Caveat |
|-----------|------------|--------|
| `AccessChar(s, i)` | O(1) | Returns a **byte**, not a rune — see below |
| `StringLength(s)` | O(1) | `len(s)` returns byte count, not rune count |
| `TraverseString(s)` | O(n) | `for i, r := range s` decodes UTF-8 into runes |
| `Concatenate(s1, s2)` | O(n + m) | Always allocates; use `strings.Builder` in loops |
| `Substring(s, l, r)` | O(1) | Slicing **shares** the backing array — no copy |

---

## Go-Specific Notes

- **Strings are immutable `[]byte` with a length.** Slicing (`s[i:j]`) is O(1) and aliases the same memory; appending (`s += t`) always allocates.
- **`byte` vs `rune`**: `s[i]` returns a `byte` (uint8). Ranging with `for i, r := range s` returns runes (int32) and correctly steps over multi-byte UTF-8 sequences. Mixing these up is the #1 string bug in Go.
- **`strings.Builder` is the idiomatic string-builder.** Linear concatenation (`s += x` in a loop) is O(n²); `strings.Builder` is O(n). It's in the stdlib and zero-allocation after initial sizing.
- **No null-termination.** Go strings carry their length explicitly — you can safely embed `\0` bytes.
- **Substring aliasing gotcha:** if you take a small substring from a huge string, the original string's memory stays alive as long as the substring lives. Clone with `string([]byte(sub))` if you need to release the big buffer.

---

## How to Run

```bash
go test -v ./...
```

---

## Key Takeaways for Learners

1. **`len(s)` is byte count, not character count.** For rune count, use `utf8.RuneCountInString(s)`. This matters for any UTF-8 input (emojis, accented letters, non-ASCII scripts).
2. **Range gives you runes for free.** `for _, r := range s` is the right way to iterate Unicode text. Indexing with `s[i]` is the right way to iterate _bytes_.
3. **Use `strings.Builder` for concatenation in loops.** It's the canonical solution to the O(n²) string-growth trap — mandatory reading.
