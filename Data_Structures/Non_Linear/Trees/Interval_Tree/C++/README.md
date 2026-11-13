# Interval Tree -- C++ Implementation

An augmented binary search tree of closed `int` intervals. See the [topic README](../README.md) for the algorithms.

## Files

| File | Contents |
| ---- | -------- |
| `interval_tree.cpp` | `Interval`, `IntervalNode`, `IntervalTree` (included directly by the tests) |
| `interval_tree_test.cpp` | unit tests with exact results, a 100000-insert scaling test and a randomized test against brute force |

## API

| Call | Result |
| ---- | ------ |
| `Interval(int low, int high)` | closed interval; a low greater than high swaps the bounds |
| `void insert(const Interval&)` | adds an interval |
| `bool remove(const Interval&)` | removes one equal interval; false if none |
| `vector<Interval> searchOverlapping(const Interval&)` | overlapping intervals |
| `vector<Interval> searchContainingPoint(int)` | intervals containing a point |
| `vector<Interval> searchContainedIn(const Interval&)` | intervals fully inside the query |
| `vector<Interval> inorderTraversal() const`, `int size() const`, `bool isEmpty()` | sorted by low, count, emptiness |
| `bool validateMax() const` | every node's `max` is correct |

## C++-Specific Notes

- The destructor frees every node and copying is deleted, because a shallow copy would double free.
- The recursion follows the tree height; a chain of very many sorted intervals can exhaust the stack.
- Results are returned by value.

## How to Run

```bash
cd "Data_Structures/Non_Linear/Trees/Interval_Tree/C++"
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD interval_tree_test.cpp -o interval_tree_test && ./interval_tree_test
```

## Key Takeaways

- Update `max` on the path only; a global recomputation made every insert O(n).
- Own nodes in one place and forbid copies.
- `validateMax()` lets tests check the augmentation.
