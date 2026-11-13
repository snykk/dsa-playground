# Interactive Problems -- Go Implementation

## Files

| File | Contents |
|------|----------|
| `main.go` | `Query`, `Answer`, `GuessNumber`, `BinarySearchAnswer` and a demo `main()` |
| `main_test.go` | tests that connect the reader and writer to an in-process fake judge through pipes |
| `go.mod` | module `interactive` |

## API

| Function | Description |
|----------|-------------|
| `Query(x int) int` | write `? x`, flush, read the integer reply |
| `Answer(x int)` | write `! x`, flush |
| `GuessNumber(n int)` | binary search with `higher` / `lower` / `correct` replies |
| `BinarySearchAnswer(n int, predicate func(int) bool) int` | offline binary search for the largest `m` with `predicate(m)` |

Go has 4 of the roughly 12 functions in Python.

## Go-Specific Notes

- Reading and writing use package-level `bufio.Reader` and `bufio.Writer`; flush the writer after every query.
- The tests swap `reader` and `writer` for pipes and run the judge in a goroutine.
- `main` guesses a number between 1 and 100 against the real standard input.

## How to Run

```bash
go test ./...
```

## Key Takeaways

- A buffered writer needs an explicit `Flush()` after each query.
- A fake judge makes interactive code testable.
