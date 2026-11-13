# Bitmasking -- Go Implementation

Bit operations, subset enumeration, bitmask DP, SOS DP and power-of-two helpers.

For the concept, see the topic README: [../README.md](../README.md).

## Files

| File | Purpose |
|------|---------|
| `main.go` | the functions below and a demo `main` |
| `main_test.go` | 13 tests: bit operations, TSP (including one and zero cities), `NextPowerOf2` beyond 32 bits, subset enumeration, SOS DP |
| `go.mod` | module definition |

## API

- `GetBit`, `SetBit`, `ClearBit`, `ToggleBit`, `CountBits`, `LowestSetBit`, `ClearLowestBit` (all on `int`).
- `EnumerateSubsets(mask) []int`: every submask, empty set last.
- `TSP(dist [][]int) int`: shortest tour from city 0; returns 0 for 0 or 1 city; `INF` is `1 << 30`.
- `CountSubsetSum(nums []int, target int) int`.
- `IsPowerOf2(n)`, `NextPowerOf2(n)`: uses `bits.Len`, correct for the full width of `int`.
- `SOSDP(a []int) []int`: any length.

## Go-Specific Notes

- `int` is 64 bits on 64-bit platforms, so masks hold up to 63 items.
- `&^` is Go's "and not", used by `ClearBit`.
- `CountBits` loops with `mask &= mask - 1`; `math/bits.OnesCount` is the library alternative.
- There is no Gosper's hack function and no meet in the middle in the Go version.

## How to Run

```bash
go test ./...
go run .
```

## Key Takeaways

1. `math/bits` gives width-correct primitives (`Len`, `OnesCount`).
2. A fixed shift-or ladder is only correct up to its last shift.
3. Test edge cases: zero, one element, and values above 2^32.
