# Bit Manipulation -- Go Implementation

Common bit tricks as small functions on `int64`. See the [topic README](../README.md) for the identities.

## Files

| File | Contents |
|------|----------|
| `main.go` | 13 exported functions and a short demo `main` |
| `main_test.go` | Tests per function, including negative inputs |
| `go.mod` | Module definition |

## API

- `IsPowerOfTwo(n int64) bool`, `IsEven(n int64) bool`
- `CountSetBits(n int64) int`: negatives count as 64-bit values (`-1` gives 64).
- `GetBit(n int64, i int) int`, `SetBit`, `ClearBit`, `ToggleBit`
- `LowestSetBit(n int64) int64`, `HighestSetBit(n int64) int` (-1 for `n <= 0`)
- `CountDifferingBits(a, b int64) int`
- `SwapWithoutTemp(a, b int64) (int64, int64)`
- `NextPowerOfTwo(n int64) int64`
- `SubsetGeneration(n int) [][]int`

## Go-Specific Notes

- `int64` arithmetic wraps on overflow instead of being undefined, so the Kernighan loop on a negative value ends after at most 64 rounds.
- Shift counts are converted with `uint(i)`; a shift count of 64 or more yields 0 rather than undefined behaviour.
- The standard library has `math/bits` (`OnesCount64`, `LeadingZeros64`) for hardware-backed versions.

## How to Run

```bash
go test ./...
go run main.go
```

## Key Takeaways

- Go's defined overflow makes bit tricks safer than in C++.
- Keep the value type explicit (`int64`) so results do not depend on the platform.
- Prefer `math/bits` in production code.
