# String Hashing -- Go Implementation

Polynomial prefix hashes over the bytes of a Go string, the hash of any substring in O(1), and the queries built on it. See the [topic README](../README.md) for the idea, a trace and the collision numbers.

## Files

| File | Contents |
|------|----------|
| `main.go` | `PolynomialHash`, `DoubleHash`, `PolynomialHashOf`, `OverflowHash`, `ThueMorsePair`, `ErrBadParameters`, the constants and a demo `main()` |
| `main_test.go` | the tables and hashes the Python code computes for `mississippi`, the largest modulus 2^32, a UTF-8 string and a string of 100,000 characters; every substring hash against the definition; the queries against brute force on random strings from `math/rand` with fixed seeds; the empty string, one character, all characters equal; errors and panics; the small-modulus collisions, the n - 1 bound for one pair and the Thue-Morse strings |
| `go.mod` | module `string_hashing` |

## API

| Function | Description |
|----------|-------------|
| `NewPolynomialHash(s string, base, mod uint64) (*PolynomialHash, error)` | the tables, O(n); an error wrapping `ErrBadParameters` unless `2 <= mod <= 2^32` and `1 <= base < mod` |
| `(*PolynomialHash) Get(l, r int) uint64` | the hash of `s[l:r]`, O(1); panics unless `0 <= l <= r <= n` |
| `Prefix()`, `Power()`, `Len()` | copies of the tables, and the length in bytes |
| `NewDoubleHash(s string) *DoubleHash` | (`Base1`, `Mod1`) and (`Base2`, `Mod2`), O(n); `First()` and `Second()` give the two tables |
| `(*DoubleHash) Get(l, r int) [2]uint64` | the pair of hashes, O(1) |
| `Equal(i, j, length int) bool` | O(1); a negative length panics |
| `LCP(i, j int) int` | the longest common prefix of `s[i:]` and `s[j:]`, O(log n) |
| `Compare(l1, r1, l2, r2 int) int` | -1, 0 or 1, byte by byte as `strings.Compare`, O(log n) |
| `CountDistinct(length int) int` | distinct substrings of that length, O(n) expected; a negative length panics |
| `PolynomialHashOf(s string, base, mod uint64) (uint64, error)` | the hash of the whole string, O(m) |
| `OverflowHash(s string, base uint64) uint64` | the hash modulo 2^64 by unsigned overflow (the broken one) |
| `ThueMorsePair(k int) (string, string)` | the Thue-Morse string of length 2^k and its complement; panics unless `0 <= k <= 30` |

`Equal`, `LCP`, `Compare` and `CountDistinct` exist on both types.

## Go-Specific Notes

- **No overflow.** Hashes and powers are `uint64` values below the modulus, at most 2^32, so a product of two of them is at most (2^32 - 1)^2 < 2^64. `Get` adds `mod` before subtracting, since a `uint64` wraps around instead of going negative. A modulus near 2^61 would need the 128-bit product of `math/bits.Mul64`, which this code avoids by keeping two 30-bit primes.
- **Bytes.** Indexing a Go string gives bytes, so UTF-8 text is hashed byte by byte and positions are byte offsets; the test pins the hashes of `h\xc3\xa9llo` that Python computes for `"h\xe9llo".encode()`. Convert to `[]rune` first if you need one position per character (not provided).
- **One set of queries.** `equalOf`, `lcpOf`, `compareOf` and `countDistinctOf` are generic over the hash type (`uint64` or `[2]uint64`, both comparable, so both work as map keys), and the methods of both types call them.
- `OverflowHash` relies on `uint64` wrap-around, which Go defines.

## How to Run

```bash
go test ./...
go run .
```

## Key Takeaways

- The constructor returns an error for bad parameters; a query outside the string panics.
- `[2]uint64` is comparable, so a pair of hashes is a map key as it is.
- The three languages compute the same hashes, checked against the Python values.
