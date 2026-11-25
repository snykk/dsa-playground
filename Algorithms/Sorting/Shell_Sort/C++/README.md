# Shell Sort -- C++ Implementation

## Files

- `shell_sort.cpp`: `enum class Sequence`, the gap functions, the `hSort` and `shellSort` templates (instantiated for `int` and `double`) and a demo `main()` (compiled out when `IS_TEST_BUILD` is defined).
- `shell_sort_test.cpp`: assert-based tests (the gap sequences, gaps near the largest `size_t`, edge cases and random arrays against `std::sort` for every sequence, h-sorted passes, errors, the instability example, counted comparisons and shifts, and 40 arrays whose counts are pinned to the Python outputs). It `#include`s `shell_sort.cpp` directly.

## API

- `template <typename T> void shellSort(std::vector<T>& arr, Sequence seq = Sequence::Ciura)`: sorts in place; returns nothing. `T` needs `operator>` and to be copyable.
- `template <typename T> void hSort(std::vector<T>& arr, std::size_t gap)`: one pass with stride `gap`.
- `std::vector<std::size_t> gapSequence(std::size_t n, Sequence seq = Sequence::Ciura)`: the gaps for `n` elements, largest first.
- `shellGaps(n)`, `knuthGaps(n)`, `ciuraGaps(n)`: one sequence each.
- `enum class Sequence { Shell, Knuth, Ciura }`.

```cpp
#include "shell_sort.cpp"

std::vector<int> arr = {98, 69, 74, 79, 60, 91, 41, 99, 18, 63, 93, 38};
shellSort(arr);                    // Ciura's gaps 10, 4, 1
shellSort(arr, Sequence::Knuth);   // or pick a sequence
```

## C++-Specific Notes

- Indices and gaps are `std::size_t`. The inner loop tests `j >= gap` before it reads `arr[j - gap]`, so `j - gap` never wraps around.
- The gap functions never compute a number above `n`: they stop when `h > (n - 2) / 3` (Knuth) or when `h > (n - 1) / 2 || h / 4 >= n - 2 * h` (Ciura). The tests run them for `n` up to `SIZE_MAX` and check that every gap is below `n` and the gaps decrease.
- Errors: `hSort` with gap 0 throws `std::invalid_argument`, and so does `gapSequence` (and so `shellSort`) for a `Sequence` value outside the enum, which only a cast can produce. A gap of at least `arr.size()` changes nothing.
- The key is copied (`T key = arr[i]`), as in the repository's Insertion Sort.
- Not stable. For production code use `std::sort`, or `std::stable_sort` when equal keys must keep their order.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD shell_sort_test.cpp -o shell_sort_test
./shell_sort_test
g++ -std=c++17 -O2 -Wall shell_sort.cpp -o shell_sort && ./shell_sort   # the demo
```

## Key Takeaways

- `j >= gap` before `arr[j - gap]` keeps unsigned indices safe.
- Generate gaps in integers and test the next gap against `n` before computing it.
- The same comparison as the Python code gives the same counts, which the tests pin.
