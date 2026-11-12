# Digit DP -- C++ Implementation

A placeholder. This folder does not implement digit DP yet; the working counter is the Python version.

## Files

| File | Description |
|------|-------------|
| `digit_dp.cpp` | Comment-only stub, no functions |
| `digit_dp_test.cpp` | Includes the stub and prints a message; it asserts nothing |

## API

None. There are no functions or types.

## C++-Specific Notes

- A real port would use `std::vector` (or an array) for the memo, `long long` for counts (they can exceed 32 bits for large bounds) and the digits of `n` as a `std::string` or vector.
- Because the test cannot fail, passing it proves nothing about digit DP.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD digit_dp_test.cpp -o digit_dp_test
./digit_dp_test
```

## Key Takeaways

- Treat this folder as a stub; see `../Python/digit_dp.py` for the algorithm.
- The expected cost for a port is O(d * target * 10) time.
