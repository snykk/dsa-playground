# Game Theory — Go Implementation

This folder implements the classical **impartial game** toolkit: Nim, Grundy numbers (nimbers), the MEX function, and misère variants. These tools plus the Sprague-Grundy theorem cover a wide class of two-player combinatorial games.

For the conceptual overview and worked examples, see the parent README: [../README.md](../README.md)

---

## Functions Included

| Function | Returns | Tells you |
|----------|---------|-----------|
| `NimWinner(piles)` | `bool` | `true` iff XOR(piles) ≠ 0 |
| `NimWinningMove(piles)` | `(pileIdx, removeCount int)` | A winning move to preserve the win |
| `Mex(s map[int]struct{})` | `int` | Smallest non-negative int not in the set |
| `SubtractionGrundy(n int, moves []int)` | `[]int` | Grundy values for a subtraction game |
| `CombinedGrundy(states []int, tables [][]int)` | `int` | XOR across independent sub-games |
| `MisereNimWinner(piles)` | `bool` | Winner under misère play |

---

## Go-Specific Notes

- **XOR via `^`**: `nimSum := 0; for _, p := range piles { nimSum ^= p }`. Clean, no library needed.
- **`map[int]struct{}` as the set for MEX**: zero-byte value type, idiomatic Go "set". For dense sets `[]bool` is faster due to cache locality.
- **Memoization via `map[int]int`** (or a slice if the state space is small and contiguous). Go has no `functools.lru_cache` equivalent in the stdlib, but a helper type that wraps a map is five lines.
- **Int type**: Go's `int` is 64-bit on modern systems. For game-theory heap sizes, `int` is safe; explicit `int64` only when portability matters.
- **Concurrency**: game-tree evaluation can be parallelized with goroutines + a `sync.Map` for memoization, but expect the synchronization overhead to swamp the benefit on small-state games. Profile first.

---

## How to Run

```bash
go test -v ./...
```

---

## Key Takeaways for Learners

1. **Nim's XOR rule is the first theorem to internalize.** First player wins iff the XOR of all pile sizes is non-zero. This single rule dissolves a surprising share of game problems.
2. **Sprague-Grundy is the generalization.** Compute a Grundy value per position via MEX of next-states. For independent parallel games, XOR the component Grundy values.
3. **Misère's "last move loses" has edge cases.** Under misère, Nim's winner matches standard play _except_ when all piles have size ≤ 1. Always test the terminal configurations explicitly.
