# Prefix Sum and Difference Array -- C++ Implementation

Prefix sums for range queries and difference arrays for range updates. See the [topic README](../README.md) for the idea.

## Files

| File | Contents |
|------|----------|
| `prefix_sum.cpp` | `PrefixSum`, `DifferenceArray` and a small demo `main` |
| `prefix_sum_test.cpp` | Assert-based tests for both classes (includes the `.cpp`) |

## API

- `PrefixSum(const vector<int>& arr)`; `int query(int left, int right)`: inclusive range sum.
- `DifferenceArray(int n)`; `void update(int left, int right, int value)`; `vector<int> getArray()`.

## C++-Specific Notes

- Sums are `int`: use `long long` for large inputs.
- Indices are not checked; an out-of-range `query` is undefined behaviour.
- The demo `main` is compiled out when `IS_TEST_BUILD` is defined.
- There are no `range_sum_queries` or `range_updates` helpers (they exist only in Python).

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD prefix_sum_test.cpp -o ps_test && ./ps_test
```

## Key Takeaways

- Build once, query many times.
- Allocate `n + 1` cells for the difference array.
- Widen the sum type before the values get large.
