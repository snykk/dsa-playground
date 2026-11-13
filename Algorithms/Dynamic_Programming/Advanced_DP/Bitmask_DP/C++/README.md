# Bitmask DP -- C++ Implementation

A placeholder. This folder does not implement bitmask DP yet; the working solver is the Python version.

## Files

| File | Description |
|------|-------------|
| `bitmask_dp.cpp` | Comment-only stub, no functions |
| `bitmask_dp_test.cpp` | Includes the stub and prints a message; it asserts nothing |

## API

None. There are no functions or types.

## C++-Specific Notes

- A real port would use `std::vector<std::vector<long long>>` or a flat array of size `(1 << n) * n`, a large sentinel for infinity (take care that `INF + dist` does not overflow) and `1LL << j` for masks above 31 bits.
- Because the test only prints a message, passing it proves nothing about bitmask DP.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD bitmask_dp_test.cpp -o bitmask_dp_test
./bitmask_dp_test
```

## Key Takeaways

- Treat this folder as a stub; see `../Python/bitmask_dp.py` for the algorithm.
- The expected cost for a port is O(n^2 * 2^n) time and O(n * 2^n) space.
