# Shell Sort -- Python Implementation

## Files

- `shell_sort.py`: `shell_sort`, `h_sort`, `gap_sequence`, the three gap functions, the sequence names, and a demo that prints the passes of the worked example.
- `shell_sort_test.py`: unit tests (the gap sequences, edge cases, 1,200 random lists and 9 large ones against `sorted()` for every sequence, each pass leaving the list h-sorted, the instability example, errors, and counted comparisons and shifts).

## API

- `shell_sort(arr, sequence="ciura")`: sorts `arr` in place and returns the same list.
- `h_sort(arr, gap)`: one pass, an insertion sort with stride `gap`; returns the same list. A gap of at least `len(arr)` changes nothing.
- `gap_sequence(n, sequence="ciura")`: the gaps `shell_sort` uses on `n` elements, largest first; empty for `n < 2`.
- `shell_gaps(n)`, `knuth_gaps(n)`, `ciura_gaps(n)`: one sequence each.
- `SHELL`, `KNUTH`, `CIURA` (`"shell"`, `"knuth"`, `"ciura"`), `SEQUENCES`, `DEFAULT_SEQUENCE` (`CIURA`) and `CIURA_GAPS`, Ciura's eight measured gaps.

```python
from shell_sort import shell_sort, gap_sequence, KNUTH

print(shell_sort([98, 69, 74, 79, 60, 91, 41, 99, 18, 63, 93, 38]))
# [18, 38, 41, 60, 63, 69, 74, 79, 91, 93, 98, 99]
print(gap_sequence(100), gap_sequence(100, KNUTH))  # [57, 23, 10, 4, 1] [40, 13, 4, 1]
```

## Python-Specific Notes

- Works on any items that support `>`; it is the only comparison the code makes.
- Errors: `ValueError` for a sequence name other than the three (checked even for an empty list) and for a gap below 1.
- `shell_sort` looks up `gap_sequence` and `h_sort` as module globals on every call, so the tests can replace `h_sort` with a wrapper that records the list after every pass.
- Python integers do not overflow; the gap functions still test whether the next gap is below `n` before computing it, so the code reads the same as the C++ and Go versions.
- Not stable. Python 3.9 and later. For real code use `sorted()` or `list.sort()`, which are stable.

## How to Run

```bash
python3 -m unittest shell_sort_test
python3 shell_sort.py   # the passes of the worked example for each sequence
```

## Key Takeaways

- Each pass is Insertion Sort with stride `h`; the last pass, with gap 1, is plain Insertion Sort.
- The gap sequence decides the speed: Ciura's makes the fewest comparisons, Shell's halving is quadratic on bad input.
- Counting the comparisons on wrapped values is how the README's numbers were measured.
