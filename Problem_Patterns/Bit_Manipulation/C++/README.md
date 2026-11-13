# Bit Manipulation -- C++ Implementation

Common bit tricks as small functions on `int64_t`. See the [topic README](../README.md) for the identities.

## Files

| File | Contents |
|------|----------|
| `bit_manipulation.cpp` | 13 functions; the demo `main` is empty |
| `bit_manipulation_test.cpp` | Assert-based tests (includes the `.cpp`) |

## API

- `bool isPowerOfTwo(int64_t n)`, `bool isEven(int64_t n)`
- `int countSetBits(int64_t n)`: negatives count as 64-bit values.
- `int getBit(int64_t n, int i)`, `int64_t setBit / clearBit / toggleBit(int64_t n, int i)`
- `int64_t lowestSetBit(int64_t n)`, `int highestSetBit(int64_t n)` (-1 for `n <= 0`)
- `int countDifferingBits(int64_t a, int64_t b)`
- `pair<int64_t, int64_t> swapWithoutTemp(int64_t a, int64_t b)`: takes values and returns the swapped pair.
- `int64_t nextPowerOfTwo(int64_t n)`
- `vector<vector<int>> subsetGeneration(int n)`: `n` must be below 31 (`1 << n` on `int`).

## C++-Specific Notes

- Bit masks use `1LL << i` so positions above 30 work.
- `countSetBits` converts to `uint64_t` first: `n - 1` on `INT64_MIN` would be signed overflow.
- Shifting by 64 or more is still undefined; keep `i` in `[0, 63]`.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD bit_manipulation_test.cpp -o bm_test && ./bm_test
```

## Key Takeaways

- Use unsigned types when you only care about bit patterns.
- Parenthesize every `&` comparison: `==` binds tighter.
- The functions take and return values; nothing is modified in place.
