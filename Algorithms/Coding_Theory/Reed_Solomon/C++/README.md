# Reed-Solomon -- C++ Implementation

Header-only Reed-Solomon over GF(2^8) reusing the sibling `gf256::GF256` field, with combined error + erasure decoding and a configurable first consecutive root (`fcr`).

For the conceptual overview, see the parent README: [../README.md](../README.md)

## Files

| File | Purpose |
|------|---------|
| `reed_solomon.h` | Header-only `reed_solomon::ReedSolomon(n, k, alpha = 3, fcr = 0)` with `encode()` / `decode(received, erasures = {})`, plus `DecodeError` |
| `reed_solomon_test.cpp` | 22 tests: errors only (incl. Voyager RS(255, 223) at 16 errors), erasures only, mixed errors + erasures, several `fcr` values, beyond-budget detection, and the shared RS(7, 5) known-codeword fixture |

## Usage

```cpp
#include "reed_solomon.h"
using reed_solomon::ReedSolomon;

ReedSolomon rs(15, 7);                       // 8 parity bytes
auto cw = rs.encode({'A', 'B', 'C', 'D', 'E', 'F', 'G'});
cw[0] = cw[1] = cw[2] = cw[3] = 0xFF;        // 4 bytes known to be bad
cw[7] ^= 0xAA; cw[11] ^= 0x55;               // + 2 errors at unknown positions
auto msg = rs.decode(cw, {0, 1, 2, 3});      // 4 + 2*2 = 8 <= 8 -> "ABCDEFG"
```

## API

- `reed_solomon::ReedSolomon(int n, int k, int alpha = 3, int fcr = 0)`.
- `encode(message)`: returns the `n`-byte systematic codeword `[parity | message]` as `std::vector<uint8_t>`.
- `decode(received, erasures = {})`: returns the `k` message bytes; throws `DecodeError` (a `std::runtime_error`) when the damage exceeds the budget and `std::invalid_argument` for malformed input.
- `reed_solomon::DecodeError`.

## C++-Specific Notes

- **Includes `../../Galois_Field/C++/galois_field.h`** via relative path. Compilation works from anywhere in the repo as long as both folders sit in their canonical Coding_Theory layout.
- **Default primitive element `alpha = 3`** -- the byte `2` has multiplicative order 51 in this field, so naive use of `alpha = 2` silently corrupts decoding past ~3 errors. `3` (= x + 1) generates the full order-255 group.
- **`std::pair` return from `polyDivmod`** with C++17 structured bindings (`auto [quot, rem] = polyDivmod(...)`).
- **Exception-based error reporting**: malformed input (wrong length, erasure position outside `[0, n)`) throws `std::invalid_argument`; damage beyond the budget `e + 2v <= n - k` (including more than `n - k` erasures) throws `DecodeError`, which extends `std::runtime_error`.
- **Erasures are a defaulted `const std::vector<int>&`**, so `rs.decode(cw)` and `rs.decode(cw, {2, 5})` both work. They are sorted and de-duplicated before use.
- **Berlekamp-Massey in the classical L-tracking form**, seeded with the erasure locator `Gamma(x)`: it starts at syndrome index `e` with `L = e`, and its length-change test is `2L <= r + e`. The Python sibling uses the swap-and-scale form; both return the same combined locator `Phi(x) = Lambda(x) * Gamma(x)`.
- **Exponents are reduced mod 255** (`expMod`) before `gf.pow`, so any `fcr` value, even a large or negative one, is safe from integer overflow.
- **All ops on `std::vector<uint8_t>`** -- low-degree-first polynomial storage, matches the Python sibling byte-for-byte.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall reed_solomon_test.cpp -o reed_solomon_test
./reed_solomon_test
```

## Key Takeaways

1. **Primitive-element selection is silent if you get it wrong.** Code passes RS(15, 11) tests, then mysteriously fails RS(255, 223). The right answer is to verify `order(alpha)` equals `FIELD_ORDER` (255) before using it.
2. **Reuse, don't reimplement, the GF layer.** The C++ RS class delegates every byte operation to `gf256::shared()` -- the singleton GF instance. This guarantees the encoder and decoder use bit-identical arithmetic.
3. **Berlekamp-Massey in low-degree-first storage** is a stylistic choice. Wikiversity uses high-first; both produce the same polynomial, just stored opposite. Stay consistent within a codebase to avoid index-flipping bugs.
4. **Erasure support is a three-line change to BM**: seed `Lambda` and `B` with `Gamma(x)` instead of `1`, start at `L = e` and syndrome `e`, and shift the length test to `2L <= r + e`. Chien search and Forney don't change at all.
