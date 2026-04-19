# LFU Cache — Go Implementation

An O(1) **Least Frequently Used** cache. Evicts the least-frequently-accessed entry first; ties broken by LRU.

For the full conceptual overview, visuals, and LFU vs. LRU comparison, see the parent README: [../README.md](../README.md)

---

## Files

| File | Purpose |
|------|---------|
| `main.go` | `LFUCache` type with `Get` / `Put` methods |
| `main_test.go` | Table-driven tests for basic, eviction, ties, updates, and LeetCode trace |
| `go.mod` | Module definition |

---

## Go-Specific Notes

- **`container/list` is Go's doubly linked list** in the stdlib. Perfect for this: insert/remove in O(1), stable element handles via `*list.Element`.
- **`*list.Element` pointers in the map**: we store `Element` pointers alongside each entry so we can remove from the DLL in O(1) on promotion. No search, no iteration.
- **`interface{}` assertion cost**: `back.Value.(*entry)` has a tiny runtime cost. For hot paths, hand-rolling a typed DLL avoids the boxing — but at this scale it's invisible.
- **No concurrency**: this implementation is not goroutine-safe. For concurrent workloads, wrap `Get`/`Put` with a `sync.Mutex`. For higher throughput, consider a sharded LFU (partition keys by hash).
- **Capacity-zero contract**: rather than panic, `NewLFUCache(0)` returns a valid no-op cache. Matches the LeetCode contract.

---

## How to Run

```bash
go test -v ./...
```

---

## Key Takeaways for Learners

1. **`container/list` is worth knowing.** It's rare to reach for in application code (slices win almost always), but for stable-element, O(1) splice scenarios like this one, it's the correct tool.
2. **`*list.Element` as a handle**: the pattern "hash map → element pointer → DLL node" is the workhorse of every O(1) cache. Implementing LFU cements it.
3. **Keep the `minFreq` invariant small and local.** It only changes in two places: `evict` (implicitly, after `Get` leaves a bucket empty) and `Put` of a new key (reset to 1). Resist the urge to add more "fixups".
