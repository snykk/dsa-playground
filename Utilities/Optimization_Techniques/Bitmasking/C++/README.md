# Bitmasking -- C++ Implementation

Bit operations, subset enumeration, bitmask DP, SOS DP and a `BitSet` class.

For the concept, see the topic README: [../README.md](../README.md).

## Files

| File | Purpose |
|------|---------|
| `bitmasking.cpp` | the functions below and a demo `main` (disabled when `IS_TEST_BUILD` is defined) |
| `bitmasking_test.cpp` | 12 tests: bit operations, zero inputs, subset output, TSP edge cases, power-of-two helpers, SOS DP, `BitSet` |

## API

- `getBit`, `setBit`, `clearBit`, `toggleBit`, `countBits`, `lowestBit`, `clearLowestBit`.
- `trailingZeros(mask)`, `leadingZeros(mask)`: return 32 for 0 instead of invoking undefined behaviour.
- `enumerateSubsets(mask)`, `subsetsOfSizeK(n, k)`: print the masks; `k = 0` prints only the empty mask.
- `tsp(dist)`: returns 0 for 0 or 1 city; `INF` is 1e9.
- `countSubsetSum(nums, target)`.
- `isPowerOf2(n)`, `nextPowerOf2(n)` (valid up to 2^30), `swapBits`, `absNoBranch`, `averageNoOverflow`.
- `sosDp(a)`: sum over subsets for any length.
- `BitSet(n)`: `set`, `clear`, `get`, `count`, `&`, `|` over 64-bit words.

## C++-Specific Notes

- Uses `__builtin_popcount`, `__builtin_ctz`, `__builtin_clz` (GCC and Clang). The file includes explicit standard headers, so it builds with Clang on macOS as well as GCC.
- `int` masks hold up to 31 items; use `1LL << i` and `long long` beyond that.
- `absNoBranch` relies on arithmetic right shift and overflows for `INT_MIN`.
- The enumeration functions print instead of returning, which keeps them allocation-free but is awkward to reuse; copy the loop into your own code.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD bitmasking_test.cpp -o bitmasking_test
./bitmasking_test
g++ -std=c++17 -O2 -Wall bitmasking.cpp -o bitmasking_demo && ./bitmasking_demo
```

## Key Takeaways

1. Builtins such as `__builtin_ctz` are undefined at 0; guard them.
2. Choose the mask type (`int`, `long long`, `uint64_t`) from the item count.
3. Keep `main` out of test builds with a macro guard.
