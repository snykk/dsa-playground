# Reed-Solomon -- C++ Implementation

Header-only Reed-Solomon over GF(2^8) reusing the sibling `gf256::GF256` field.

For the conceptual overview, see the parent README: [../README.md](../README.md)

---

## Files

| File | Purpose |
|------|---------|
| `reed_solomon.h` | Header-only `reed_solomon::ReedSolomon` class + `DecodeError` exception |
| `reed_solomon_test.cpp` | 9 tests including the Voyager RS(255, 223) max-error case |

---

## C++-Specific Notes

- **Includes `../../Galois_Field/C++/galois_field.h`** via relative path. Compilation works from anywhere in the repo as long as both folders sit in their canonical Coding_Theory layout.
- **Default primitive element `alpha = 3`** -- the byte `2` has multiplicative order 51 in this field, so naive use of `alpha = 2` silently corrupts decoding past ~3 errors. `3` (= x + 1) generates the full order-255 group.
- **`std::pair` return from `polyDivmod`** with C++17 structured bindings (`auto [quot, rem] = polyDivmod(...)`).
- **Exception-based error reporting**: `DecodeError` extends `std::runtime_error`, throws with a descriptive message when more than `t` errors are present.
- **All ops on `std::vector<uint8_t>`** -- low-degree-first polynomial storage, matches the Python sibling byte-for-byte.

---

## How to Run

```bash
g++ -std=c++17 -O2 -Wall reed_solomon_test.cpp -o reed_solomon_test
./reed_solomon_test
```

---

## Key Takeaways for Learners

1. **Primitive-element selection is silent if you get it wrong.** Code passes RS(15, 11) tests, then mysteriously fails RS(255, 223). The right answer is to verify `order(alpha)` equals `FIELD_ORDER` (255) before using it.
2. **Reuse, don't reimplement, the GF layer.** The C++ RS class delegates every byte operation to `gf256::shared()` -- the singleton GF instance. This guarantees the encoder and decoder use bit-identical arithmetic.
3. **Berlekamp-Massey in low-degree-first storage** is a stylistic choice. Wikiversity uses high-first; both produce the same polynomial, just stored opposite. Stay consistent within a codebase to avoid index-flipping bugs.
