# Ternary Search -- C++ Implementation

Template ternary search over a sorted `std::vector`. For the idea and the traces see the [topic README](../README.md).

## Files

- `ternary_search.cpp` - the templates and their explicit instantiations.
- `ternary_search_test.cpp` - 6 assert-based tests (it includes the .cpp file).

## API

- `int ternarySearch(const std::vector<T>& arr, const T& target)` - index or -1. Instantiated for `int` and `double`.
- `int ternarySearchRecursive(arr, target, left, right)` - the recursive form; the caller passes the bounds. `int` and `double`.

There is no unimodal-function search in C++ (Python has one), although the file includes `<functional>`.

## C++-Specific Notes

- The probes are `left + (right - left) / 3` and `right - (right - left) / 3`, which cannot overflow `int`.
- Indexes are `int`, so vectors beyond `INT_MAX` elements are not supported.
- For lookups, `std::lower_bound` (binary search) is the better choice.
- Do not compile `ternary_search.cpp` and the test together: the test already includes it.

## How to Run

From this folder:

```bash
g++ -std=c++17 -O2 -Wall ternary_search_test.cpp -o ternary_search_test
./ternary_search_test
```

## Key Takeaways

- Two probes per round, a third discarded: more probes in total than binary search.
- Use `std::lower_bound` for lookups in real code.
- Ternary search is for unimodal functions, which this folder does not implement in C++.
