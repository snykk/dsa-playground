# Collision Handling — Go Implementation

When two distinct keys hash to the same bucket, that's a **collision**. This folder shows two mainstream strategies side-by-side:

- **Separate Chaining** — each bucket holds a slice (or linked list) of entries.
- **Open Addressing** — probe to another slot in the same array (linear / quadratic / double hashing).

For the conceptual overview and "when to pick which" decision tree, see the parent README: [../README.md](../README.md)

---

## Files

| File | Purpose |
|------|---------|
| `main.go` | Both `ChainingHashTable` and `OpenAddressingHashTable` types |
| `main_test.go` | Tests for insert / lookup / delete plus load-factor stress |
| `go.mod` | Module definition |

---

## Go-Specific Notes

- **Built-in `map` already uses chaining** (with extra runtime tricks). This implementation is educational — in real code you should almost always use `map[string]V`.
- **Chaining with slices, not `container/list`**: modern Go style prefers `[]Entry` per bucket. Slices have better cache behavior and simpler semantics than the linked-list package.
- **Open addressing needs a tombstone state**: we use `enum`-style constants (`slotEmpty`, `slotOccupied`, `slotDeleted`) because deleting an occupied slot naively would break every probe sequence that _used_ to pass through it.
- **Hashing with `hash/fnv`**: fast, stdlib, good enough for non-adversarial input. For user-controlled keys under DoS concerns, use `maphash` (Go 1.14+) which is keyed per process.

---

## How to Run

```bash
go test -v ./...
```

---

## Key Takeaways for Learners

1. **Tombstones are not optional.** Without them, `Delete` silently corrupts `Lookup` for any key that collides with the deleted slot. It's subtle and catastrophic.
2. **Load factor governs everything.** Chaining stays O(1) average up to α ≈ 1. Open addressing's expected probe count is `1/(1-α)` — it degrades rapidly past α = 0.7.
3. **Go's runtime `map` picks neither extreme.** It uses a variant of open addressing with buckets of 8 entries, incremental rehashing, and internal tombstone management. Reading the reference implementation in `runtime/map.go` is a great next step.
