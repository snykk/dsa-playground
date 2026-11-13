# Segment Tree (Lazy Propagation) -- C++ Implementation

A recursive segment tree with lazy tags: range add and range sum. See the [topic README](../README.md) for the idea and a trace.

## Files

| File | Contents |
| ---- | -------- |
| `segment_tree_lazy.cpp` | `LazySegmentTree` (included directly by the tests) |
| `segment_tree_lazy_test.cpp` | unit tests and a randomized test against brute force |

## API

| Call | Result |
| ---- | ------ |
| `LazySegmentTree(const vector<int>& arr)` | builds the tree in O(n); accepts temporaries |
| `void updateRange(int left, int right, long long val)` | adds `val` to every element of `left..right` (inclusive) |
| `long long query(int left, int right)` | sum of elements `left..right` (inclusive) |

There is no index validation: a range partly outside the array is clipped, and a range outside does nothing.

## C++-Specific Notes

- Sums, tags and updates are `long long`, so `val * length` does not overflow for ordinary inputs.
- Storage is two `vector<long long>` of length `4n`; no raw pointers, so copying is safe.
- The private recursive helpers share names with the public methods; the public ones start the recursion at node 1.

## How to Run

```bash
cd "Data_Structures/Non_Linear/Trees/Segment_Tree_Lazy_Propagation/C++"
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD segment_tree_lazy_test.cpp -o segment_tree_lazy_test && ./segment_tree_lazy_test
```

## Key Takeaways

- Tags rest only on fully covered nodes.
- Push down before recursing into a partial node.
- Use 64-bit arithmetic for `value * length`.
