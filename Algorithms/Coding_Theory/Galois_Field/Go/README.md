# Galois Field GF(2^8) -- Go Implementation

GF(2^8) arithmetic (polynomial `0x11B`, generator 3) with a package-level shared field. Read-only after construction, so safe for concurrent use.

For the concept, see the topic README: [../README.md](../README.md).

## Files

| File | Purpose |
|------|---------|
| `main.go` | `GF256` type, `NewGF256`, `Shared()`, polynomial helpers and a small demo `main` |
| `main_test.go` | 12 tests: AES vectors, field laws, polynomial multiply and evaluation, `Pow` with a huge exponent |
| `go.mod` | module definition |

## API

- `NewGF256(poly, generator int) *GF256`: builds the tables; the generator is not validated.
- `Shared() *GF256`: the default field.
- `Add`, `Sub`, `Mul`: return `byte`.
- `Div(a, b) (byte, error)`, `Inv(b) (byte, error)`: return `ErrDivByZero` for 0.
- `Pow(a, n) (byte, error)`: error only for `0^0`; negative `n` is allowed.
- `PolyAdd`, `PolyScale`, `PolyMul`, `PolyEval`: `[]byte`, lowest degree first.
- `ErrDivByZero`: sentinel error (compare with `errors.Is`).

## Go-Specific Notes

- `Shared()` returns a value built once at package initialisation; the methods only read the tables, so no mutex is needed.
- The exp table is a fixed `[2 * FieldOrder]byte` array inside the struct.
- Fallible operations return `(byte, error)`; `Mul` cannot fail and returns a plain `byte`.
- Types are hard-coded to `byte` because the field is fixed at 8 bits.
- There is no polynomial division helper in this version.

## How to Run

```bash
go test -v ./...
go run .
```

## Key Takeaways

1. No operator overloading: `gf.Mul(a, b)` reminds you this is not integer multiplication.
2. A package-level variable is enough for an immutable shared table.
3. Return errors for 0 where a result is impossible, not for ordinary control flow.
