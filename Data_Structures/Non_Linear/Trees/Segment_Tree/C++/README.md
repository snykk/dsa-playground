# Segment Tree -- C++ Implementation

A bottom-up segment tree for range sums and point assignment. See the [topic README](../README.md) for the layout and traces.

## Files

| File | Contents |
| ---- | -------- |
| `segment_tree.cpp` | `SegmentTree` (included directly by the tests) |
| `segment_tree_test.cpp` | unit tests, overflow and range-error tests, a randomized test against brute force |

## API

| Call | Result |
| ---- | ------ |
| `SegmentTree(const vector<int>& arr)` | builds the tree in O(n); accepts temporaries |
| `void update(int index, long long value)` | assigns `value` to element `index` |
| `long long query(int left, int right) const` | sum of elements `left..right`, inclusive |
| `long long get(int index) const` | one element |

Bad indices and `left > right` throw `std::out_of_range`.

## C++-Specific Notes

- The tree stores `long long`, so sums of `int` values do not overflow (`{2000000000, 2000000000}` sums to 4000000000). Go uses 64-bit `int` and Python has big integers, so all three agree.
- Input elements are `int`; assigned values may be `long long`.
- Storage is a `vector<long long>` of length `2 * size`; no raw pointers, so copying is safe.

## How to Run

```bash
cd "Data_Structures/Non_Linear/Trees/Segment_Tree/C++"
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD segment_tree_test.cpp -o segment_tree_test && ./segment_tree_test
```

## Key Takeaways

- Use a 64-bit accumulator for sums.
- Validate indices; the padded leaves and internal nodes are not elements.
- A `const` reference constructor lets you pass a braced list.
