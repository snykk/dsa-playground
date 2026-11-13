# Fast I/O -- C++ Implementation

`cin`/`cout` setup, character-based integer readers and writers, and buffered `FastInput` / `FastOutput` classes.

For the concept, see the topic README: [../README.md](../README.md).

## Files

| File | Purpose |
|------|---------|
| `fast_io.cpp` | the functions and classes below, three demo functions, and an empty `main` template (disabled when `IS_TEST_BUILD` is defined) |
| `fast_io_test.cpp` | 13 tests: five on string and stream basics, eight on the real readers and writers (redirected stdin and stdout, end of input, a 2 MB input across the buffer, `INT_MIN` and `LLONG_MIN`) |

## API

- `fastIO()`: `sync_with_stdio(false)` and the ties off.
- `readInt()`, `readLong()`: parse from `getchar()`; return 0 at the end of input.
- `writeInt(x)`, `writeLong(x)`: write with `putchar`; correct for `INT_MIN` and `LLONG_MIN`.
- `FastInput`: `readInt()`, `readLong()`, `readString()` over a 1 MiB `fread` buffer; 0 or `""` at the end of input.
- `FastOutput`: `writeChar`, `writeInt`, `writeLong`, `writeString`, `newLine`, `flush`; flushes in its destructor.
- `demoFastIO`, `demoGetcharPutchar`, `demoBufferedIO`: three ways to sum the input numbers (not called by `main`).

## C++-Specific Notes

- The character variable is an `int`, so EOF cannot collide with a data byte.
- Negative numbers are written from an unsigned magnitude, which avoids the undefined `-INT_MIN`.
- The 1 MiB buffers of `FastInput` and `FastOutput` are `std::vector<char>` on the heap, so both objects together do not put 2 MiB on the stack.
- Use one reading family per program: do not mix `cin`, `scanf` and the `getchar` readers when synchronisation is off.
- The file uses explicit standard headers, so it builds with GCC and Clang.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD fast_io_test.cpp -o fast_io_test
./fast_io_test
```

The test creates two small temporary files in the current directory and removes them.

## Key Takeaways

1. Hold `getchar()` results in an `int` and test for EOF.
2. Compute magnitudes in unsigned arithmetic.
3. Put big buffers on the heap.
