# Fibonacci Numbers -- C++ Implementation

Three ways to compute Fibonacci numbers with 64-bit results.

## Files

| File | Contents |
|------|----------|
| `fibonacci.cpp` | the functions below |
| `fibonacci_test.cpp` | `assert`-based tests; it `#include`s `fibonacci.cpp` |

## API

| Function | Description | Time | Space |
|----------|-------------|------|-------|
| `long long fibonacciTabulation(int n)` | bottom-up table | O(n) | O(n) |
| `long long fibonacciOptimized(int n)` | two variables | O(n) | O(1) |
| `long long fibonacciMemoization(int n)` | top-down with an `unordered_map` | O(n) | O(n) |
| `long long fibonacciMemoization(int n, std::unordered_map<int, long long>& memo)` | the same, with a caller-supplied cache | O(n) | O(n) |

Every function throws `std::invalid_argument` for a negative `n`. There is no naive, matrix or sequence version here; the Python folder has them.

## C++-Specific Notes

- `F(92)` is the largest value that fits in `long long`. For `n >= 93` the addition overflows, which is undefined behaviour for signed integers. Check `n <= 92` before calling.
- The memoized version recurses `n` deep, so very large `n` can exhaust the stack (it is already past the `long long` range there).
- The test file includes the `.cpp`, so compile only the test file.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD fibonacci_test.cpp -o fibonacci_test
./fibonacci_test
```

## Key Takeaways

- Results are exact for `n <= 92` only.
- Memoization and tabulation are linear; the loop with two variables needs no memory.
- Compile just the test file, not both.
