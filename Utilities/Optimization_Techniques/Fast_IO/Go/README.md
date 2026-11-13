# Fast I/O -- Go Implementation

Buffered stdin and stdout helpers and a `BufferedInput` that loads every token.

For the concept, see the topic README: [../README.md](../README.md).

## Files

| File | Purpose |
|------|---------|
| `main.go` | the helpers below and a small demo `main` |
| `main_test.go` | 7 tests: `readInt`, `readInts`, end of input, `BufferedInput` tokens, a 100,000-number line, bad tokens, over-long tokens |
| `go.mod` | module definition |

## API

- `readInt()`, `readInt64()`, `readString()`, `readInts(n)`: `fmt.Fscan` on a package-level `bufio.Reader`; return the zero value at the end of input.
- `println(...)`, `printf(...)`: write to a package-level `bufio.Writer` (they shadow the builtin `println` inside this package; call `writer.Flush()` at the end).
- `NewBufferedInput()`: reads all tokens from standard input.
- `NewBufferedInputFrom(r io.Reader)`: the same for any reader.
- `(*BufferedInput).Next()`, `NextInt()`, `Err()`: `Next` returns `""` at the end; `NextInt` returns 0 for a bad token and records the error in `Err()`.

## Go-Specific Notes

- `BufferedInput` uses `bufio.Scanner` with `ScanWords`, so a line of any length works. A single token above 1 MiB stops the read, and `Err()` reports it.
- `fmt.Fscan` is easy but slower than a hand-written parser; for very large inputs use `BufferedInput` or parse bytes from a `bufio.Reader` yourself.
- The writer is buffered: forget `defer writer.Flush()` and the output is lost.

## How to Run

```bash
go test ./...
echo "3 1 2 3" | go run .
```

## Key Takeaways

1. Split on words rather than lines when lines can be long.
2. Never ignore `scanner.Err()` or a parse error.
3. Flush buffered writers.
