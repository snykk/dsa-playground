# Galois Field GF(2^8) -- Python Implementation

Table-based arithmetic over GF(2^8) (the AES field, polynomial `0x11B`, generator 3) with `add`, `mul`, `div`, `inv`, `pow` and polynomial helpers used by Reed-Solomon.

For the concept, see the topic README: [../README.md](../README.md).

## Files

| File | Purpose |
|------|---------|
| `galois_field.py` | `GF256` class with log/antilog tables, polynomial helpers and a module-level singleton `GF` |
| `galois_field_test.py` | 27 tests: field laws, AES vectors, polynomial operations, an alternative-polynomial check |

## API

- `GF256(primitive_poly=0x11B, generator=0x03)`: builds the tables; the generator is not validated.
- `GF256.add(a, b)` / `sub`: XOR (static).
- `mul(a, b)`, `div(a, b)`, `inv(b)`, `pow(a, n)`: O(1); `div` and `inv` raise `ZeroDivisionError` for 0, `pow(0, 0)` raises `ValueError`.
- `poly_add`, `poly_scale`, `poly_mul`, `poly_eval` (Horner), `poly_divmod`: polynomials are lists of coefficients, lowest degree first.
- `GF`: shared instance for the default field.
- `_slow_multiply(a, b, poly)`: table-free shift-and-add multiply.

## Python-Specific Notes

- The module-level `GF` is built once at import. Tests also build `GF256(primitive_poly=0x11D, generator=0x02)` to check another polynomial.
- The exp table has length 512 (`exp_table[i + 255] == exp_table[i]`), so `mul` needs no `% 255`.
- Polynomials are low-degree-first: `[c0, c1, c2]` means `c0 + c1*x + c2*x^2`.
- `poly_eval` uses Horner's rule: O(d) multiplications.
- `poly_divmod` exists only in the Python version.
- `pow(0, n)` returns 0 for any `n != 0`, even a negative one.

## How to Run

```bash
python3 -m unittest galois_field_test
python3 galois_field.py        # demo: 0x53 * 0xCA = 0x01
```

## Key Takeaways

1. XOR is the `+`; every algebraic law still holds.
2. Tables turn polynomial multiplication into two lookups and an addition.
3. `pow(a, n)` becomes `exp[(log[a] * n) % 255]`, O(1).
