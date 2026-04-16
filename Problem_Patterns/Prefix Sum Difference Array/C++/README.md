# Prefix Sum / Difference Array (C++)

Precompute cumulative sums for O(1) range-sum queries, and apply range updates in O(1) using a difference array.

## Files

| File | Description |
|------|-------------|
| `prefix_sum.cpp` | `PrefixSum` and `DifferenceArray` class implementations |
| `prefix_sum_test.cpp` | Test cases for prefix sum queries |

## How to Run

```bash
# Run the demo
g++ -std=c++17 -o ps prefix_sum.cpp
./ps

# Run tests
g++ -std=c++17 -DTESTING -o test prefix_sum_test.cpp
./test
```

## Key Functions

| Function / Method | Description | Time Complexity |
|-------------------|-------------|-----------------|
| `PrefixSum(arr)` | Constructor -- builds the prefix sum array from input | O(n) |
| `PrefixSum::query(l, r)` | Returns sum of elements in range [l, r] | O(1) |
| `DifferenceArray(n)` | Constructor -- initialises a difference array of size n | O(n) |
| `DifferenceArray::update(l, r, v)` | Adds value v to every element in range [l, r] | O(1) |
| `DifferenceArray::getArray()` | Materialises the final array after all updates | O(n) |

## Complexity

| Aspect | PrefixSum | DifferenceArray |
|--------|-----------|-----------------|
| Build / Init | O(n) | O(n) |
| Query / Update | O(1) | O(1) per update |
| Materialise | -- | O(n) |
| Space | O(n) | O(n) |

## Notes

- `PrefixSum` uses a 1-indexed internal array so that `query(0, r)` works without a special case.
- `DifferenceArray` supports batching many range updates before materialising once with `getArray()`.
- These two patterns are duals: prefix sum answers range queries; difference array answers range updates.

---

_Last Updated: April 2026_
