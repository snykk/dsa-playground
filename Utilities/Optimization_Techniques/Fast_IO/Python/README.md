# Fast I/O -- Python Implementation

Line readers, fast writers, buffered readers and writers, and read-everything-at-once helpers.

For the concept, see the topic README: [../README.md](../README.md).

## Files

| File | Purpose |
|------|---------|
| `fast_io.py` | the functions and classes below, plus a template `solve()` |
| `fast_io_test.py` | 22 tests: the real readers and writers run on a fake `sys.stdin`, plus parsing and join checks |

## API

- `fast_input()`, `fast_int()`, `fast_ints()`, `fast_floats()`, `fast_strings()`, `fast_iter_ints()`: read one line from `sys.stdin`.
- `fast_print(*args, sep, end)`, `fast_print_list(lst)`, `fast_print_matrix(matrix)`: write with `sys.stdout.write`.
- `BufferedInput`: reads all of stdin at once; `next()`, `next_int()`, `next_float()`, `next_ints(n)`, `next_line()` (returns the next token, not a line). The `buffer_size` argument is accepted but ignored. `next()` raises `IndexError` when the tokens run out.
- `BufferedOutput`: `write`, `write_list`, `flush`.
- `read_all_ints()`, `AllInputReader` (`next()`, `next_n(n)`): all integers of stdin.

## Python-Specific Notes

- At the end of the input `fast_input()` returns `""` and `fast_int()` raises `ValueError`.
- The module rebinds the name `input` to `sys.stdin.readline` at import time; `input()` then keeps the trailing newline.
- `sys.stdin.read().split()` is usually the quickest way to read many numbers in CPython but needs memory for the whole input and cannot be used for interactive problems.
- PyPy often gives a large speed-up for the same code.

## How to Run

```bash
python3 -m unittest fast_io_test
```

## Key Takeaways

1. Fewer, larger reads beat many small ones.
2. Join the output and write it once.
3. Know what your reader does at the end of the input.
