# Binary Search -- C++ Implementation

Template binary search over `std::vector`, with recursive and first/last occurrence variants. For the idea, the invariant and the trace see the [topic README](../README.md).

## Files

- `binary_search.cpp` - the templates and their explicit instantiations.
- `binary_search_test.cpp` - 9 assert-based tests (it includes the .cpp file).

## API

- `int binarySearch(const std::vector<T>& arr, const T& target)` - index or -1. Instantiated for `int` and `double`.
- `int binarySearchRecursive(arr, target, left, right)` - the recursive form; the caller passes the bounds. `int` and `double`.
- `int binarySearchFirstOccurrence(arr, target)` and `int binarySearchLastOccurrence(arr, target)` - `int` only.

There is no closest-element search in C++ (Python has one). For insertion points use `std::lower_bound` and `std::upper_bound`.

## C++-Specific Notes

- The midpoint is `left + (right - left) / 2`, which avoids the overflow of `(left + right) / 2`.
- Indexes are `int`, so arrays beyond `INT_MAX` elements are not supported.
- The explicit instantiations at the end of the file mean only the listed types work when the file is linked separately; including the .cpp (as the test does) works for any type with `==` and `<`.
- Do not compile `binary_search.cpp` and the test together: the test already includes it.

## How to Run

From this folder:

```bash
g++ -std=c++17 -O2 -Wall binary_search_test.cpp -o binary_search_test
./binary_search_test
```

## Key Takeaways

- Write the midpoint as `left + (right - left) / 2`.
- Prefer `std::lower_bound` and `std::upper_bound` in real code.
- First and last occurrence only change what happens on a match.
