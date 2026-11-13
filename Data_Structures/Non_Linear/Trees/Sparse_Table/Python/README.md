# Sparse Table -- Python Implementation

A static range minimum or maximum table: O(n log n) build, O(1) query. See the [topic README](../README.md) for the idea and a trace.

## Files

| File | Contents |
| ---- | -------- |
| `sparse_table.py` | `SparseTable` |
| `sparse_table_test.py` | unit tests, empty-input and invalid-kind tests, and an exhaustive comparison with brute force on random arrays |

## API

| Call | Result |
| ---- | ------ |
| `SparseTable(arr, query_type='min')` | builds the table from a copy of `arr`; `ValueError` unless `query_type` is `'min'` or `'max'` |
| `query(left, right)` | min or max of `left..right` (inclusive); swapped bounds are reordered |
| `get(index)` | the original element |

An empty array is allowed. Any query or `get` with an index outside `0..n-1` (including every call on an empty table) raises `IndexError`.

## Python-Specific Notes

- The number of levels and the query exponent come from `int.bit_length()`, not from `math.log2`.
- `table[i][j]` is a list of `n` rows; cells beyond a valid window stay 0 and are never read.
- The input list is copied, so later changes to it do not affect the table.

## How to Run

```bash
cd "Data_Structures/Non_Linear/Trees/Sparse_Table/Python"
python3 -m unittest sparse_table_test
```

## Key Takeaways

- Two overlapping power-of-two windows answer any range.
- Only idempotent operations (min, max, gcd) work this way.
- Use integer bit tricks for `floor(log2)`.
