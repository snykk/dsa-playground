# Fenwick Tree -- C++ Implementation

A Fenwick tree over `int` input with `long long` sums. See the [topic README](../README.md) for the idea.

## Files

| File | Contents |
| ---- | -------- |
| `fenwick_tree.cpp` | `FenwickTree` (included directly by the tests) |
| `fenwick_tree_test.cpp` | unit tests, overflow and range-error tests, a randomized test against brute force |

## API

| Call | Result |
| ---- | ------ |
| `FenwickTree(const vector<int>& arr)` | builds with `n` updates; accepts temporaries |
| `void update(int index, long long delta)` | adds `delta` to element `index` |
| `long long prefixSum(int index) const` | sum of `0..index` |
| `long long query(int left, int right) const` | sum of `left..right`, inclusive |
| `long long get(int index) const` | one element |

Bad indices and `left > right` throw `std::out_of_range`.

## C++-Specific Notes

- The tree stores `long long`, so sums of `int` values do not overflow (`{2000000000, 2000000000}` sums to 4000000000).
- Input elements are `int`; deltas are `long long`.
- Indices are `int`; the range check is what prevents the infinite loop at index -1.

## How to Run

```bash
cd "Data_Structures/Non_Linear/Trees/Fenwick_Tree/C++"
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD fenwick_tree_test.cpp -o fenwick_tree_test && ./fenwick_tree_test
```

## Key Takeaways

- Use a 64-bit accumulator for sums.
- Validate before the loop: `lowbit(0)` is 0.
- A `const` reference constructor lets you pass a braced list.
