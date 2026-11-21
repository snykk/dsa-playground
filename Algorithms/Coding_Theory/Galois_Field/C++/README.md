# Galois Field GF(2^8) -- C++ Implementation

Header-only, table-based GF(2^8) arithmetic (polynomial `0x11B`, generator 3).

For the concept, see the topic README: [../README.md](../README.md).

## Files

| File | Purpose |
|------|---------|
| `galois_field.h` | `gf256::GF256` class, `gf256::slowMultiply` and the `gf256::shared()` accessor |
| `galois_field_test.cpp` | 11 tests: AES vectors, inverses, distributive law, polynomial multiply and evaluation, `pow` with a large exponent |

## API

- `GF256(int poly = 0x11B, int generator = 0x03)`: builds the tables at run time; the generator is not validated.
- `add(a, b)`, `sub(a, b)`: static, `noexcept`, XOR.
- `mul(a, b)`, `div(a, b)`, `inv(b)`, `pow(a, n)`: O(1); `div` and `inv` throw `std::domain_error` for 0, and so does `pow(0, 0)`.
- `polyAdd`, `polyScale`, `polyMul`, `polyEval`: `std::vector<uint8_t>`, lowest degree first.
- `gf256::shared()`: a function-local static default field.
- `slowMultiply(a, b, poly)`: table-free multiply used for the setup.

## C++-Specific Notes

- The tables are `std::array<uint8_t, 2 * 255>` and `std::array<uint8_t, 256>` members: no heap allocation. They are filled by the constructor at run time (not `constexpr`).
- `shared()` is a function-local `static const` object; C++11 guarantees thread-safe initialisation.
- Everything lives in namespace `gf256`.
- `std::domain_error` is thrown instead of undefined behaviour for division by zero.
- There is no polynomial division helper in this version.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall galois_field_test.cpp -o galois_field_test
./galois_field_test
```

## Key Takeaways

1. A header-only class is enough: the tables are small and the operations inline well.
2. `uint8_t` matches the field width; promote to `int` only for table indexing.
3. A Meyers singleton gives one shared table set without locking code.
