# Hash Set — Go Implementation

A **Hash Set** stores **unique** elements with expected O(1) `Add`, `Remove`, and `Contains`. It's a hash map where we only care about the keys.

For the conceptual overview (internal hash tables, load factor, iteration semantics), see the parent README: [../README.md](../README.md)

---

## Files

| File | Purpose |
|------|---------|
| `main.go` | `HashSet` type built on top of Go's built-in `map` |
| `main_test.go` | Tests for `Add`, `Remove`, `Contains`, and uniqueness |
| `go.mod` | Module definition |

---

## Core Operations

| Operation | Average | Worst case |
|-----------|---------|------------|
| `Add(key)` | O(1) | O(n) |
| `Contains(key)` | O(1) | O(n) |
| `Remove(key)` | O(1) | O(n) |
| `Len()` | O(1) | O(1) |

---

## Go-Specific Notes

- **`map[T]struct{}` is the idiomatic Go set.** The empty struct `struct{}{}` occupies **zero bytes**, so this is as memory-efficient as you can get without writing the hash table yourself. Avoid `map[T]bool` — it wastes one byte per entry.
- **No generics? No problem before Go 1.18.** The pre-generics pattern was either (a) hardcoding a type like `map[string]struct{}`, or (b) using `map[interface{}]struct{}` at the cost of boxing and runtime type assertions. On Go 1.18+, `type Set[T comparable] struct { m map[T]struct{} }` is the clean approach.
- **Iteration order is intentionally randomized.** Go's runtime shuffles the starting bucket on every `for range` to prevent accidental reliance on insertion order. Do not expect stable ordering.
- **Concurrency**: `map` is not goroutine-safe. For concurrent sets, either wrap with `sync.RWMutex` or use `sync.Map` (optimized for read-mostly workloads).

---

## How to Run

```bash
go test -v ./...
```

---

## Key Takeaways for Learners

1. **`struct{}` as the value type is a Go idiom worth knowing.** Zero-byte value, zero allocation, and the compiler understands it — readers immediately see "this is a set".
2. **A hash set is a hash map without values.** If you understand `map`, you already understand the implementation; only `Contains` and `Add` semantics differ.
3. **If you need ordered iteration, pair the set with a slice** — add to both on `Add`, mark-as-deleted on `Remove`. Alternatively use a `[]T` + sort, or reach for a third-party ordered set package.
