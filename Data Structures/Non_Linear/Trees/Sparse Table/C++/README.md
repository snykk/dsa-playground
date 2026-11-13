# Sparse Table -- C++ Implementation

A static range minimum or maximum table: O(n log n) build, O(1) query. See the [topic README](../README.md) for the idea and a trace.

## Files

| File | Contents |
| ---- | -------- |
| `sparse_table.cpp` | `SparseTable` (included directly by the tests) |
| `sparse_table_test.cpp` | unit tests, empty-input, invalid-kind and range tests, and an exhaustive comparison with brute force |

## API

| Call | Result |
| ---- | ------ |
| `SparseTable(const vector<int>& arr, string query_type = "min")` | builds from a copy; throws `std::invalid_argument` unless the type is `"min"` or `"max"` |
| `int query(int left, int right) const` | min or max of `left..right`; swapped bounds are reordered; throws `std::out_of_range` outside `0..n-1` |
| `int get(int index) const` | the original element; throws `std::out_of_range` |

An empty array is allowed; every query on it throws.

## C++-Specific Notes

- The exponent `k` comes from an integer `floorLog2`, not from `std::log2`, so there is no floating-point rounding.
- Storage is `vector<vector<int>>` of `n` rows by `floor(log2(n)) + 1` columns; copying is safe.
- Values are `int`, so the table holds no sums and nothing overflows.

## How to Run

```bash
cd "Data Structures/Non_Linear/Trees/Sparse Table/C++"
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD sparse_table_test.cpp -o sparse_table_test && ./sparse_table_test
```

## Key Takeaways

- A query is two lookups and one `min` or `max`.
- Validate the kind and the range; the table does not.
- Never use `log2` on integers when exactness matters.
