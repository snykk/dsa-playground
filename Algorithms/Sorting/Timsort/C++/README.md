# Timsort -- C++ Implementation

## Files

- `timsort.cpp`: `computeMinrun`, the `countRun`, `binaryInsertionSort`, `gallopLeft` and `gallopRight` templates, `Run`, `invariantsHold`, `MergeState`, `mergeLo`, `mergeHi`, `mergeAt`, `mergeCollapse`, `mergeForceCollapse`, the `timsort` template (instantiated for `int` and `double`) and a demo `main()` (compiled out when `IS_TEST_BUILD` is defined).
- `timsort_test.cpp`: assert-based tests (minrun against CPython's rule, runs, binary insertion, the gallop searches against `std::lower_bound` and `std::upper_bound` and their cost, random and structured arrays against `std::stable_sort` with a payload, galloping on and off, the stack invariants after every collapse through the hook, the 2015 example, merges and `minGallop`, `n - 1` comparisons on sorted and strictly descending input, and 40 arrays whose comparison counts are pinned to the Python outputs). It `#include`s `timsort.cpp` directly.

## API

- `template <typename T> void timsort(std::vector<T>& arr, bool gallop = true, std::size_t minrun = 0, const CollapseHook& afterCollapse = nullptr)`: sorts in place, stably. `T` needs `operator<` and to be copyable. `minrun = 0` computes it from `arr.size()`.
- `using CollapseHook = std::function<void(const std::vector<Run>&)>`: called with the run stack after every collapse.
- `std::size_t computeMinrun(std::size_t n)`; `RunInfo countRun(arr, lo, hi)` with `length` and `descending`; `binaryInsertionSort(arr, lo, hi, start)`; `gallopLeft(key, a, base, n, hint)` and `gallopRight(...)`.
- `struct Run { std::size_t base, length; }`, `bool invariantsHold(const std::vector<Run>&)`, `MergeState<T>` (`arr`, `gallop`, `pending`, `minGallop`, `tmp`) and `mergeAt(ms, i)` for merging two runs directly.

```cpp
#include "timsort.cpp"

std::vector<int> arr = {43, 37, 31, 24, 15, 9, 12, 40, 6, 28, 2, 5};
timsort(arr);                   // minrun computed: 12 values, one binary insertion sort
timsort(arr, true, 4);          // minrun 4: several runs and merges
```

## C++-Specific Notes

- Indices are `std::size_t`. In `mergeHi` the index `a` of A's last element steps below `baseA` once A is empty and wraps around when `baseA` is 0; unsigned wrap-around is defined, and the value is never read again. The tests pass under AddressSanitizer and UndefinedBehaviorSanitizer.
- Block moves use `std::copy` when the target lies to the left of the source and `std::copy_backward` when it lies to the right, so overlapping ranges are safe.
- The temporary copy is one `std::vector<T>` in `MergeState`, reused by every merge. In the exponential search `ofs` stays below `n`, so `2 * ofs + 1` cannot overflow.
- No function here throws on its own; a throwing `operator<` can leave the vector with elements lost and others duplicated. For production code use `std::stable_sort`.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD timsort_test.cpp -o timsort_test
./timsort_test
g++ -std=c++17 -O2 -Wall timsort.cpp -o timsort && ./timsort   # the demo
```

## Key Takeaways

- `operator<` is the only comparison, so a counting `operator<` counts the work, and the counts match Python's.
- The `afterCollapse` hook lets the tests check the stack invariants on every push without changing the sort.
- `std::copy` versus `std::copy_backward` decides whether an overlapping block move is safe.
