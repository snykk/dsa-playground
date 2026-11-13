# Maximum Subarray (Kadane's Algorithm) -- C++ Implementation

The one-pass sum.

## Files

| File | Contents |
|------|----------|
| `kadane.cpp` | `kadaneAlgorithm` |
| `kadane_test.cpp` | `assert`-based tests; it `#include`s `kadane.cpp` |

## API

| Function | Description | Time | Space |
|----------|-------------|------|-------|
| `int kadaneAlgorithm(const std::vector<int>& arr)` | maximum subarray sum; 0 for an empty vector | O(n) | O(1) |

There is no window (index) version here; the Python folder has one.

## C++-Specific Notes

- Sums are `int`. A sum above `INT_MAX` overflows (undefined behaviour for signed integers); widen to `long long` for large inputs.
- The loop index is `size_t`, starting at 1 after the empty check.
- The test file includes the `.cpp`, so compile only the test file.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD kadane_test.cpp -o kadane_test
./kadane_test
```

## Key Takeaways

- Start from `arr[0]` so all-negative input works.
- Watch the `int` range.
- Empty input returns 0 by convention.
