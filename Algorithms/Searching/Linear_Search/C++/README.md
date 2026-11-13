# Linear Search -- C++ Implementation

Template linear search over `std::vector`. For the idea and the trace see the [topic README](../README.md).

## Files

- `linear_search.cpp` - the templates and their explicit instantiations.
- `linear_search_test.cpp` - 12 assert-based tests (it includes the .cpp file).

## API

- `int linearSearch(const std::vector<T>& arr, const T& target)` - index of the first match, or -1.
- `int linearSearchRecursive(arr, target, size_t index = 0)` - the recursive form.
- `std::vector<int> linearSearchAllOccurrences(arr, target)` - all matching indexes.

All three are instantiated for `int`, `double` and `std::string`.

## C++-Specific Notes

- Indexes are returned as `int`, so vectors beyond `INT_MAX` elements are not supported.
- The recursive form uses one stack frame per element, so a long vector can overflow the stack; use the loop.
- Comparing `double` with `==` is exact; use a tolerance if values come from computation.
- For real code, `std::find` and `std::find_if` do the same job.
- Do not compile `linear_search.cpp` and the test together: the test already includes it.

## How to Run

From this folder:

```bash
g++ -std=c++17 -O2 -Wall linear_search_test.cpp -o linear_search_test
./linear_search_test
```

## Key Takeaways

- The first match wins; the all-occurrences function returns every index.
- Prefer `std::find` in production code.
- Avoid the recursive form on long inputs.
