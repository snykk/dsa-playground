# Galois Field GF(2⁸) — C++ Implementation

Header-only table-based GF(2⁸) arithmetic suitable for embedded, competitive programming, and Reed-Solomon implementations.

For the conceptual overview, see the parent README: [../README.md](../README.md)

---

## Files

| File | Purpose |
|------|---------|
| `galois_field.h` | Header-only `gf256::GF256` class + `gf256::shared()` singleton accessor |
| `galois_field_test.cpp` | 10 tests including AES known vectors and field-law verification |

---

## C++-Specific Notes

- **`std::array<uint8_t, 2*255>` for the exp table** lives entirely on the stack/data segment — 510 bytes, contiguous, cache-friendly. No heap allocation.
- **`gf256::shared()` Meyers singleton**: `static const GF256 instance;` inside a function. C++11+ guarantees thread-safe initialization. Use it from anywhere in your codebase without paying the table-construction cost more than once per process.
- **Namespace `gf256`** keeps the public API clean and avoids name collisions with code that uses generic names like `add`, `mul`.
- **`noexcept` on the trivial XOR ops** documents the intent and lets the optimizer aggressively inline.
- **`std::domain_error` on inv(0) / div by 0**: matches the standard library convention for mathematically-impossible inputs. Easier to handle in production than UB.

---

## How to Run

```bash
g++ -std=c++17 -O2 -Wall galois_field_test.cpp -o galois_field_test
./galois_field_test
```

---

## Key Takeaways for Learners

1. **Header-only is the right call for fields.** The tables are trivially-constructible, the operations inline aggressively, and consumers don't need to fuss with build systems.
2. **`uint8_t` everywhere matches the field's natural width.** Promoting to `int` only inside the table indexing prevents accidental sign-extension surprises.
3. **Singletons in C++11+ are easy.** The "Meyers singleton" pattern (`static const T x;` inside a function) is thread-safe by the standard — no double-checked-locking gymnastics needed.
