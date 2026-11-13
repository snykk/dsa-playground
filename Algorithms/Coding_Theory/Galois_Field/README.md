# Galois Field GF(2^8)

A **Galois field** (finite field) is a set with exactly `q` elements on which you can add, subtract, multiply and divide like ordinary numbers, with every answer staying inside the set. **GF(2^8)** has 256 elements, one per byte, and powers AES, Reed-Solomon, QR codes and storage ECC. Addition is XOR, multiplication is polynomial multiplication modulo a fixed irreducible polynomial, and with log/antilog tables every operation is O(1).

## Intuition

A byte has 256 values. Can we define `+` and `*` so that:

1. every result is again a byte (no overflow ever),
2. every nonzero byte has a multiplicative inverse (so division works for everything except 0),
3. the usual laws (commutative, associative, distributive) hold?

Yes, but the operations are not the integer ones:

- Treat each byte as a polynomial of degree <= 7 over GF(2), the two-element field `{0, 1}` with XOR as addition and AND as multiplication. `0x53` = `0101 0011` = `x^6 + x^4 + x + 1`.
- **Addition** is polynomial addition with GF(2) coefficients, which is **bitwise XOR**.
- **Multiplication** is polynomial multiplication followed by the remainder modulo a fixed irreducible polynomial. This repository uses the AES one, `x^8 + x^4 + x^3 + x + 1` (`0x11B`), with generator `0x03`. QR codes and many storage codes use `x^8 + x^4 + x^3 + x^2 + 1` (`0x11D`); both are valid fields, but encoder and decoder must agree.

The invariant that makes the log tables work: the 255 nonzero elements are exactly `alpha^0, alpha^1, ..., alpha^254` for a generator `alpha`, and `alpha^255 = 1`. Under `0x11B` the element 2 is not a generator (its order is 51); 3 is.

## Visual

`0x53 * 0xCA` in GF(2^8), the classic AES test vector:

```text
Step 1: carry-less polynomial multiply (XOR instead of add)
  0x53 = x^6+x^4+x+1
  0xCA = x^7+x^6+x^3+x

  (x^6+x^4+x+1) * (x^7+x^6+x^3+x)
  = x^13+x^12+x^9+x^7     (from x^6 * ...)
  + x^11+x^10+x^7+x^5     (from x^4 * ...)
  + x^8+x^7+x^4+x^2       (from x   * ...)
  + x^7+x^6+x^3+x         (from 1   * ...)

  XOR the coefficients:
  x^13+x^12+x^11+x^10+x^9+x^8+x^6+x^5+x^4+x^3+x^2+x   = 0x3F7E

Step 2: reduce modulo 0x11B, clearing the top bit each time
  0x3F7E ^ (0x11B << 5) = 0x1C1E
  0x1C1E ^ (0x11B << 4) = 0x0DAE
  0x0DAE ^ (0x11B << 3) = 0x0576
  0x0576 ^ (0x11B << 2) = 0x011A
  0x011A ^  0x11B       = 0x0001

0x53 * 0xCA = 0x01, so they are multiplicative inverses.
```

## Operations

| Operation | How | Cost |
|-----------|-----|------|
| `add(a, b)` | `a ^ b` | O(1) |
| `sub(a, b)` | `a ^ b` (subtraction is addition in GF(2)) | O(1) |
| `mul(a, b)` | `exp[log[a] + log[b]]` (0 if either is 0) | O(1) |
| `div(a, b)` | `exp[(log[a] - log[b]) mod 255]`; error if `b == 0` | O(1) |
| `inv(b)` | `exp[255 - log[b]]`; error if `b == 0` | O(1) |
| `pow(a, n)` | `exp[(log[a] * n) mod 255]`; error only for `0^0` | O(1) |
| polynomial helpers | add, scale, multiply, Horner evaluation (Python also has divmod) | O(d), O(d^2) |

**Log/antilog tables** are the speed trick. Pick a generator `alpha` (here `0x03`), store `exp[i] = alpha^i` and `log[alpha^i] = i`. Then `a * b = exp[log[a] + log[b]]`: one addition and two lookups instead of a polynomial multiplication. The exp table is stored twice over (`exp[i + 255] = exp[i]`) so the index never needs `mod 255`.

Building the tables:

```text
exp = [0] * 2*255 (Python: 512)
log = [0] * 256
acc = 1
for i in 0..254:
    exp[i] = acc
    log[acc] = i
    acc = slow_multiply(acc, 0x03)      # shift-and-add with reduction
for i in 255..end: exp[i] = exp[i - 255]
```

## Step-by-Step Trace

The first powers of 3 under `0x11B` (from the repository's table):

| i | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 |
|---|---|---|---|---|---|---|---|---|---|---|----|----|
| `exp[i]` | 1 | 3 | 5 | 15 | 17 | 51 | 85 | 255 | 26 | 46 | 114 | 150 |

`exp[8]` is the first overflow: `255 * 3 = 0x1FE` has bit 8 set, so XOR with `0x11B` gives `0x1A` = 26.

Multiply `0x53 * 0xCA` with tables: `log[0x53] = 48`, `log[0xCA] = 207`, the sum is 255, and `exp[255] = exp[0] = 1`. Also `0x53 + 0xCA = 0x99`, and `inv(0x53) = 0xCA`.

## Complexity

| Operation | Time |
|-----------|------|
| table setup | O(256), once |
| `add` / `sub` | O(1), pure XOR |
| `mul` / `div` / `inv` / `pow` | O(1), a few lookups |
| polynomial multiply (degrees d, e) | O(d * e) |
| polynomial evaluation (Horner) | O(d) |

Memory: about 510 to 512 bytes of exp table plus 256 of log table.

## When to Use

Use it when:

- building Reed-Solomon, BCH or other algebraic error-correcting codes,
- implementing AES (the S-box is the inverse in GF(2^8) followed by an affine map),
- computing RAID-6 style parity,
- any setting where "every nonzero element has an inverse" matters.

Do not use it when plain XOR or a checksum is enough. Larger fields such as GF(2^16) need much bigger tables, or carry-less multiplication hardware (PCLMULQDQ).

## GF(2^8) vs. Integers Mod 256

| Aspect | Integers mod 256 | GF(2^8) |
|--------|------------------|---------|
| Every nonzero value has an inverse | No (only the 128 odd values) | Yes (all 255) |
| Addition | `+` with wrap-around | XOR (no carries) |
| Closed under all four operations | No | Yes |
| Useful for ECC | No (cannot always divide) | Yes (RS, BCH) |
| Useful for AES | No | Yes |

The integers mod 256 form a ring, not a field.

## Common Pitfalls

1. **Mixing XOR and integer add.** In GF(2^8), `5 + 3 = 6` (`0b101 ^ 0b011 = 0b110`), not 8.
2. **Wrong polynomial.** `0x11B` and `0x11D` define different fields; tables from one cannot be used with data from the other.
3. **Wrong generator.** The constructors do not check the generator. With `0x11B`, 2 has order 51, so the tables would be silently broken; use 3.
4. **Reading `log[0]`.** It is undefined. Guard `b == 0` before `log`, `inv` or `div`.
5. **Intermediate overflow.** A byte shifted left needs 9 bits before reduction; use a wider integer in `slow_multiply`.
6. **mod 255, not 256.** Exponents wrap at the group order 255.
7. **`pow(0, n)`.** Only `0^0` is rejected; `pow(0, n)` returns 0 for any other `n`, including negative `n`.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python/](Python/) | `galois_field.py` | `GF256` class, module singleton `GF`, polynomial helpers including `poly_divmod`; raises `ZeroDivisionError` |
| C++ | [C++/](C++/) | `galois_field.h` | header-only `gf256::GF256`, tables built at run time, `gf256::shared()`; throws `std::domain_error` |
| Go | [Go/](Go/) | `main.go` | `GF256` type, package-level `Shared()`; `Div`, `Inv` and `Pow` return errors |

All three produce the same results on the shared known-value vectors (the AES vector `0x53 * 0xCA = 0x01`).

## Practice Problems

- Build the AES S-box using only your GF(2^8) primitives.
- Compute every element's inverse and verify `a * inv(a) = 1`.
- Find all generators of GF(2^8) under `0x11B` (there are phi(255) = 128 of them).
- Implement carry-less multiplication with XOR and shifts and compare it with table lookup.
- Then build a Reed-Solomon encoder on top of it (see the Reed-Solomon topic).

## Related

- [Reed-Solomon](../Reed_Solomon/README.md): the main user of GF(2^8) arithmetic.
- [Modular Arithmetic](../../Mathematical_Algorithms/Number_Theory/Modular%20Arithmetic/README.md): the prime-field cousin GF(p).
- [Fast Fourier Transform](../../Mathematical_Algorithms/Advanced_Math/Fast%20Fourier%20Transform/README.md): also polynomial evaluation, over a different field.
