# Fast I/O

Fast I/O means reading and writing in big chunks instead of one small call at a time. With hundreds of thousands of numbers of input, the default reading functions can dominate the running time, so buffered readers and one combined write often decide between passing and a time-limit error. It does not change the algorithm: parsing stays linear in the data size, only the constant factor drops.

## Intuition

Each call to a standard reading or writing function has fixed overhead: locking, synchronisation between streams, flushes, system calls. If a program makes a million small calls, it pays that overhead a million times. Fast I/O pays it a few times by moving data in large blocks and doing the parsing in your own code.

Invariant for a custom character reader: the character is held in an `int`, so the end-of-input marker (-1) can never be mistaken for a data byte, and every reading loop tests for it.

## Visual

```text
input bytes:   '1' '2' ' ' '-' '3' '4' EOF

readInt #1:    1 2 _                -> 12      (stops after the separator)
readInt #2:          - 3 4 EOF      -> -34     (sign remembered, digits accumulated)
readInt #3:                   EOF   -> 0       (the skip loop stops at EOF)
```

## How It Works

1. **Turn off needless synchronisation (C++).** `ios_base::sync_with_stdio(false)` lets `cin` and `cout` use their own buffers. `cin.tie(nullptr)` stops `cin` from flushing `cout` before every read. (`cout` is not tied to anything, so `cout.tie(nullptr)` does nothing; it is harmless.)
2. **Read in big blocks.** C++ `FastInput` fills a 1 MiB buffer with `fread`; Python reads a line, or all of stdin at once (`sys.stdin.read().split()`); Go wraps stdin in `bufio`.
3. **Parse yourself.** Skip non-digits (remember a `-`), then accumulate digits.
4. **Write once.** Collect output in a buffer or list and write it in one call; use `'\n'` instead of `endl`, which flushes every time.

Behaviour at the end of the input (after the fixes in this folder):

- C++ `readInt`, `readLong`, `FastInput::readInt`, `FastInput::readLong` return 0 and `FastInput::readString` returns `""`. They used to loop forever because `getchar()` was stored in a `char`.
- C++ `writeInt(INT_MIN)` and `writeLong(LLONG_MIN)` are correct: the magnitude is computed in unsigned arithmetic.
- Go `BufferedInput` splits on words, so a single very long line works (the old line scanner returned no tokens past 64 KiB per line). `Err()` reports read errors and bad tokens.
- Python `fast_int()` raises `ValueError` at the end of the input.

## Step-by-Step Trace

`readInt` on the bytes `12 -34` followed by the end of the stream:

| Call | Bytes consumed | Result |
|------|----------------|--------|
| 1 | `1`, `2`, then the space | 12 |
| 2 | `-` (sign), `3`, `4`, then EOF | -34 |
| 3 | EOF | 0 |

## Complexity

All methods are O(size of the data). They differ in the number of expensive operations:

| Method | Calls into the system |
|--------|------------------------|
| `cin` / `cout`, default | many, with stream synchronisation |
| `cin` / `cout` after `sync_with_stdio(false)` | fewer |
| `getchar` / `putchar` readers | a library call per character |
| `fread` into your own buffer | one per 1 MiB |
| Python `sys.stdin.read()` | one (needs memory for the whole input) |

There is no timing table here: the speed-up depends on the machine, compiler and input, so measure with your own data.

## When to Use

Use it when the input has hundreds of thousands of numbers or more, there is one output line per query, or a correct solution still hits the time limit. For small inputs the default functions are simpler and fine. Do not buffer fully in interactive problems: flush after every answer and read only what has been sent.

## Fast I/O vs. Alternatives

| Method | Strength | Weakness |
|--------|----------|----------|
| `cin` + `sync_with_stdio(false)` | one line of setup | cannot mix with `scanf` |
| `getchar` reader | fast parsing | per-character call overhead; only integers |
| `FastInput` (`fread`) | least overhead | more code, whole-block reads |
| Python `sys.stdin.readline` | good for line-structured input | one call per line |
| Python `sys.stdin.read()` | fastest in CPython | needs memory; no interactivity |
| Go `bufio.Reader` + `fmt.Fscan` | simple | slower than a hand-written parser |

## Common Pitfalls

1. **`getchar()` stored in a `char`:** EOF is never recognised and the loop never ends. Use an `int`.
2. **Mixing `cin` and `scanf`** after `sync_with_stdio(false)`.
3. **`endl` in a loop** flushes every time.
4. **Forgetting to flush:** `FastOutput` flushes in its destructor, a Go `bufio.Writer` needs `defer writer.Flush()`, a Python `BufferedOutput` needs `flush()`.
5. **Negating the minimum integer** (`-INT_MIN`) is undefined behaviour.
6. **Go line scanners:** the default limit is 64 KiB per line; split on words or raise the limit with `Buffer`.
7. **Reading until EOF** when the input header gives the count; use the count.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python/](Python/) | `fast_io.py` | line readers, `BufferedInput`, `BufferedOutput`, `AllInputReader`; `buffer_size` is ignored |
| C++ | [C++/](C++/) | `fast_io.cpp` | `readInt`, `readLong`, `writeInt`, `writeLong`, `FastInput`, `FastOutput` |
| Go | [Go/](Go/) | `main.go` | `readInt`, `readInts`, `readString`, buffered writer, `BufferedInput` |

## Practice Problems

- [Static Range Sum Queries (CSES 1646)](https://cses.fi/problemset/task/1646)
- [Forest Queries (CSES 1652)](https://cses.fi/problemset/task/1652)
- [Inverse Inversions (CSES 2214)](https://cses.fi/problemset/task/2214)
- [Hidden Integer (CSES 3112)](https://cses.fi/problemset/task/3112)
- [Sum of Two Values (CSES 1640)](https://cses.fi/problemset/task/1640)
- [Distinct Numbers (CSES 1621)](https://cses.fi/problemset/task/1621)
- Write a reader that parses 10^6 numbers from a file and compare it with `cin` on your machine.

## Related

- [Precomputation](../Precomputation/README.md)
- [Modular Arithmetic Tricks](../Modular_Arithmetic_Tricks/README.md)
- [Bitmasking](../Bitmasking/README.md)
