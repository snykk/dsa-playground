# Monotonic Queue — Go Implementation

O(n) sliding-window maximum / minimum via a slice-backed monotonic deque.

For the conceptual overview, visuals, and common problems, see the parent README: [../README.md](../README.md)

---

## Files

| File | Purpose |
|------|---------|
| `main.go` | `SlidingWindowMax` and `SlidingWindowMin` exported functions |
| `main_test.go` | Table-driven tests |
| `go.mod` | Module definition |

---

## Go-Specific Notes

- **Slice as deque**: `dq = dq[1:]` to "pop front", `dq = dq[:len(dq)-1]` to "pop back", `append(dq, v)` to push back. This is idiomatic Go — no `container/list` needed, and no pointer-chasing cost.
- **Front-pop via `dq[1:]` leaks capacity of the original backing array.** For workloads where the deque is short-lived (one call), this is fine — GC reclaims when the function returns. For long-lived deques (e.g. in an interactive loop), copy into a fresh slice periodically.
- **Pre-sized result slice**: `make([]int, 0, n-k+1)` avoids `append` growth reallocation — classic Go performance idiom.
- **Index-based deque** instead of storing `{index, value}` pairs: halves memory and keeps the inner-loop code branch-predictable.
- **No concurrency**: the functions are stateless and therefore safe to call from multiple goroutines simultaneously. Each call allocates its own deque.

---

## How to Run

```bash
go test -v ./...
```

---

## Key Takeaways for Learners

1. **Slice-based deque is fine.** Go's `container/list` is a doubly linked list — overkill (and slower) for this use case. Slice operations at both ends are O(1) amortized.
2. **The amortized analysis is identical** in any language. Each index enters the deque once and leaves once — total inner-loop work is O(n).
3. **Boundary guards at the top** (`k <= 0`, `n == 0`, `k > n`) keep the hot loop clean. In Go especially, returning `[]int{}` (not `nil`) matches the caller's typical expectations and avoids nil-check boilerplate downstream.
