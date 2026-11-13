# Galois Field GF(2⁸) — Python Implementation

Table-based arithmetic over the AES/Reed-Solomon field GF(2⁸) with `add`, `mul`, `div`, `inv`, `pow`, and polynomial primitives used by Reed-Solomon.

For the conceptual overview (intuition, math, table-construction walk-through), see the parent README: [../README.md](../README.md)

---

## Files

| File | Purpose |
|------|---------|
| `galois_field.py` | `GF256` class with precomputed log/antilog tables, polynomial helpers, and a module-level `GF` singleton |
| `galois_field_test.py` | 27 tests covering field laws, AES known vectors, polynomial ops, and an alternative-poly sanity check |

---

## Python-Specific Notes

- **Singleton `GF`** at module level avoids reconstructing the 512-byte tables every import. Tests can still instantiate a fresh `GF256(primitive_poly=0x11D, generator=0x02)` to verify the same code works on other irreducible polynomials.
- **Doubled exp table (length 512)**: `exp_table[i + 255] == exp_table[i]` so `mul` doesn't need an explicit `% 255` — the index never overflows even when both logs are 254.
- **Polynomial format**: low-degree-first lists (`[c0, c1, c2]` means `c0 + c1·x + c2·x²`). Matches the convention used by every other CP / numerical library so Reed-Solomon code can interop cleanly.
- **Horner's evaluation** for `poly_eval`: `O(n)` multiplies, no exponentiation in the hot loop.
- **`_slow_multiply` lives in module scope** rather than inside the class so it's reusable both for table construction and for cross-checking in tests.

---

## How to Run

```bash
python3 -m unittest galois_field_test.py
```

---

## Key Takeaways for Learners

1. **XOR is the +.** This is the single biggest mental shift moving into GF(2⁸). Every algebraic identity (commutative, associative, distributive) still holds — but `+` is bitwise XOR, not integer plus.
2. **Tables turn O(n) ops into O(1).** Once `log` and `exp` are built, multiply is two adds + one lookup. Reed-Solomon's per-byte cost is dominated by these table accesses; everything else is loop overhead.
3. **`pow(a, n)` via `exp[(log[a] * n) % 255]` is the killer feature.** Polynomial arithmetic in GF(2⁸) demands many high-power evaluations — having them be O(1) is what makes the whole field tractable for production-scale ECC.
