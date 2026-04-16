# Bit Manipulation Patterns (Go)

Go implementation of common bit manipulation techniques.

## Files

| File | Description |
|------|-------------|
| `main.go` | Main implementation |
| `main_test.go` | Test cases |

## How to Run

```bash
go run main.go      # Run demo
go test ./...        # Run tests
```

## Key Functions

| Function | Description | Time |
|----------|-------------|------|
| `IsPowerOfTwo(n)` | Check if n is a power of 2 | O(1) |
| `CountSetBits(n)` | Count 1-bits (Brian Kernighan) | O(k) |
| `GetBit(n, i)` | Get i-th bit value | O(1) |
| `SetBit(n, i)` | Set i-th bit to 1 | O(1) |
| `ClearBit(n, i)` | Clear i-th bit to 0 | O(1) |
| `ToggleBit(n, i)` | Toggle i-th bit | O(1) |
| `LowestSetBit(n)` | Isolate lowest set bit | O(1) |
| `HighestSetBit(n)` | Position of highest set bit | O(log n) |
| `CountDifferingBits(a, b)` | Hamming distance | O(k) |
| `SwapWithoutTemp(a, b)` | XOR swap | O(1) |
| `NextPowerOfTwo(n)` | Next power of 2 >= n | O(log n) |
| `SubsetGeneration(n)` | Generate all bitmask subsets | O(2^n) |

---

_Last Updated: April 2026_
