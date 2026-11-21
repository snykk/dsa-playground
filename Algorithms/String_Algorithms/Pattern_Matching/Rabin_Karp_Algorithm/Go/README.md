# Rabin-Karp Algorithm -- Go Implementation

Rabin-Karp search with a rolling hash and verified hits.

## Files

| File | Contents |
|------|----------|
| `main.go` | package `main`: the constants `base` and `mod`, `RabinKarpSearch`, and a demo `main` |
| `main_test.go` | a table-driven `TestRabinKarpSearch`: matches, no match, empty inputs, overlaps, a spurious hit, bytes above 0x7F |
| `go.mod` | module `rabin_karp` |

## API

- `RabinKarpSearch(text, pattern string) []int`: all start indices, in increasing order; an empty slice for an empty pattern, an empty text, or a pattern longer than the text. O(n + m) expected, O(n*m) worst case.

## Go-Specific Notes

- Strings are indexed by `byte`, which is unsigned, so no sign problem arises; indices are byte offsets.
- Go's `%` can return a negative number, so the rolled hash is normalised by adding `mod`.
- `base = 256` and `mod = 101` are constants. `int` is 64 bits on 64-bit platforms, so a modulus near 10^9 still fits (the products reach about `256 * 255 * mod`); only a far larger one needs `math/bits`.

## How to Run

```bash
go test -v ./...
```

## Key Takeaways

1. Verify every hash hit.
2. Normalise negative results of `%`.
