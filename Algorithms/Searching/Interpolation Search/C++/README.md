# Interpolation Search -- C++ Implementation

Template interpolation search over `std::vector`. For the idea, the formula and the traces see the [topic README](../README.md).

## Files

- `interpolation_search.cpp` - the templates and their explicit instantiations.
- `interpolation_search_test.cpp` - 9 assert-based tests (it includes the .cpp file), including duplicates and `INT_MIN` / `INT_MAX`.

## API

- `int interpolationSearch(const std::vector<T>& arr, const T& target)` - index or -1. Instantiated for `int` and `double`.
- `int interpolationSearchRecursive(arr, target, left, right)` - the recursive form; the caller passes the bounds. `int` and `double`.

## C++-Specific Notes

- The probe is computed in `double`, because `arr[right] - arr[left]` can overflow `int` (for example `INT_MAX - INT_MIN`), which is undefined behavior.
- Doubles represent integers exactly only up to 2^53, so for very wide values the estimate is approximate; it only affects speed, not correctness.
- A flat window (`arr[left] == arr[right]`) returns before the division.
- Indexes are `int`. The recursive form takes the bounds from the caller: pass `0` and `size() - 1`.
- Do not compile `interpolation_search.cpp` and the test together: the test already includes it.

## How to Run

From this folder:

```bash
g++ -std=c++17 -O2 -Wall interpolation_search_test.cpp -o interpolation_search_test
./interpolation_search_test
```

## Key Takeaways

- Do the subtraction in a wider type than the keys.
- Guard the flat window before dividing.
- Prefer binary search unless the keys are close to uniform.
