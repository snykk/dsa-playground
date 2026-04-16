# Bit Manipulation Patterns (C++)

C++ implementation of common bit manipulation techniques.

## Files

| File | Description |
|------|-------------|
| `bit_manipulation.cpp` | Main implementation |
| `bit_manipulation_test.cpp` | Test cases |

## How to Run

```bash
g++ -std=c++17 -DTESTING -o test bit_manipulation_test.cpp
./test
```

## Key Functions

| Function | Description | Time |
|----------|-------------|------|
| `isPowerOfTwo(n)` | Check if n is a power of 2 | O(1) |
| `countSetBits(n)` | Count 1-bits (Brian Kernighan) | O(k) |
| `getBit(n, i)` | Get i-th bit value | O(1) |
| `setBit(n, i)` | Set i-th bit to 1 | O(1) |
| `clearBit(n, i)` | Clear i-th bit to 0 | O(1) |
| `toggleBit(n, i)` | Toggle i-th bit | O(1) |
| `lowestSetBit(n)` | Isolate lowest set bit | O(1) |
| `highestSetBit(n)` | Position of highest set bit | O(log n) |
| `countDifferingBits(a, b)` | Hamming distance | O(k) |
| `swapWithoutTemp(a, b)` | XOR swap (by reference) | O(1) |
| `nextPowerOfTwo(n)` | Next power of 2 >= n | O(log n) |
| `subsetGeneration(n)` | Generate all bitmask subsets | O(2^n) |

---

_Last Updated: April 2026_
