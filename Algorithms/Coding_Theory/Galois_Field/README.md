# Galois Field GF(2⁸)

> A **Galois Field** (finite field) is a set with exactly `q` elements on which you can `+`, `−`, `×`, `÷` like ordinary numbers — but the answers always stay inside the set. **GF(2⁸)** is the field with 256 elements that powers AES, Reed-Solomon, QR codes, and modern storage ECC. Each element is a byte; addition is XOR; multiplication is polynomial modulo a fixed irreducible polynomial.

---

## 🎯 Intuition

A byte has 256 possible values: `0`, `1`, `2`, …, `255`. Can we define + and × so that:

1. The result of any operation is still a byte (no overflow ever).
2. Every nonzero byte has a multiplicative inverse (so division works for everyone except 0).
3. The usual laws (commutative, associative, distributive) hold.

Surprising fact from abstract algebra: **yes**, but the operations don't look like the integer ones you'd guess. Instead:

- Treat each byte as a polynomial of degree ≤ 7 over GF(2) (the two-element field `{0, 1}` with XOR as addition and AND as multiplication).
  - `0x53` = binary `0101 0011` = `x⁶ + x⁴ + x + 1`.
- **Addition** = polynomial addition with GF(2) coefficients = **bitwise XOR**.
- **Multiplication** = polynomial multiplication, then take the remainder modulo a fixed irreducible polynomial. Rijndael / AES use **`x⁸ + x⁴ + x³ + x + 1`** (`0x11B`), and this repo's Reed-Solomon reuses it. QR codes and most storage Reed-Solomon codes use `x⁸ + x⁴ + x³ + x² + 1` (`0x11D`) instead; both are valid, but encoder and decoder must agree.

This gives 256 distinct elements (the 256 polynomials of degree < 8), every nonzero one has a unique inverse, and arithmetic stays inside the byte.

---

## 📊 Visual: GF(2⁸) Multiplication

`0x53 × 0xCA` in GF(2⁸):

```
Step 1: Polynomial multiply (no carry, just XOR shift-and-add)
  0x53 = x⁶+x⁴+x+1
  0xCA = x⁷+x⁶+x³+x

Multiply each term (in GF(2), so 1+1 = 0):
  (x⁶+x⁴+x+1) × (x⁷+x⁶+x³+x)
  = x¹³+x¹²+x⁹+x⁷   (from x⁶ × …)
  + x¹¹+x¹⁰+x⁷+x⁵   (from x⁴ × …)
  + x⁸+x⁷+x⁴+x²    (from x  × …)
  + x⁷+x⁶+x³+x     (from 1  × …)

Sum (XOR coefficients):
  x¹³+x¹²+x¹¹+x¹⁰+x⁹+x⁸+x⁶+x⁵+x⁴+x³+x²+x

Step 2: Reduce modulo x⁸+x⁴+x³+x+1 (= 0x11B)
  Each time the result has degree ≥ 8, XOR with 0x11B shifted to align.

Final answer: 0x01.   (So 0x53 and 0xCA are multiplicative inverses!)
```

---

## 🧮 Core Operations

| Operation | How | Cost |
|-----------|-----|------|
| `add(a, b)` | `a ^ b` (XOR) | O(1) |
| `sub(a, b)` | `a ^ b` (subtraction _is_ addition in GF(2)) | O(1) |
| `mul(a, b)` | Russian-peasant multiply with reduce-after-shift, OR table lookup | O(1) with tables |
| `div(a, b)` | `mul(a, inv(b))` | O(1) with tables |
| `inv(b)` | `exp_table[(255 - log_table[b]) % 255]` | O(1) with tables |
| `pow(a, n)` | repeated squaring, or `exp_table[(log_table[a] * n) % 255]` | O(log n) or O(1) |

**Log/antilog tables** are the speed trick: pick a generator `α` (typically `0x03`), precompute `log[a] = i` such that `αⁱ = a`, and `exp[i] = αⁱ`. Then `a × b = exp[(log[a] + log[b]) mod 255]` — one addition and two table lookups instead of a polynomial multiplication.

---

## 🚶 Step-by-Step: Building the Log Table

```
α = 0x03 (a generator: every nonzero byte is α^i for some i ∈ [0, 254])
exp_table = [0] * 256
log_table = [0] * 256

acc = 1
for i in 0..254:
    exp_table[i] = acc
    log_table[acc] = i
    acc = mul_polynomial(acc, α)   # full poly multiply with reduce, one-time cost
exp_table[255] = exp_table[0]  # convenience: exp[255] == exp[0] == 1
```

After this, all per-byte arithmetic becomes 3 table lookups. The setup cost is O(256). Total memory: 512 bytes for the two tables — fits in a single CPU cache line group.

---

## ⏱️ Complexity

| Operation | After table setup |
|-----------|-------------------|
| `add` / `sub` | O(1) — pure XOR, no tables |
| `mul` / `div` | O(1) — 2-3 table lookups |
| `inv` | O(1) — one subtract + one lookup |
| `pow(a, n)` | O(1) — `exp[(log[a] * n) % 255]` |
| Polynomial mul (degree d) | O(d²) |

Setup: O(256) once, amortized to zero across operations.

---

## ⚔️ GF(2⁸) vs. Plain Integer Arithmetic

| Aspect | Z mod 2⁵⁶ (integers mod 256) | GF(2⁸) |
|--------|------------------------------|---------|
| Every nonzero has inverse? | ❌ (only 128 of them do) | ✅ all 255 nonzero values |
| Addition | Regular `+` with mod | XOR (carry-free) |
| Closed under all four ops? | No | Yes |
| Useful for ECC? | No (can't always divide) | Yes (foundation of RS, BCH) |
| Useful for AES? | No | Yes (S-box is GF(2⁸) inverse + affine) |

Z mod 256 is a _ring_, not a field. Lacking division by half the elements would make Reed-Solomon math impossible.

---

## ⚠️ Common Pitfalls

1. **Mixing XOR and arithmetic add.** In GF(2⁸), `5 + 3 = 6` (because `0b101 ^ 0b011 = 0b110`), not `8`. Get used to it — every multiplication step interleaves both.
2. **Wrong irreducible polynomial.** Rijndael uses `0x11B` (`x⁸ + x⁴ + x³ + x + 1`). Some implementations use `0x11D` (`x⁸ + x⁴ + x³ + x² + 1`). Both define valid GF(2⁸)s but the elements correspond differently — you can't mix tables from different polys.
3. **Off-by-one in log table.** `log_table[0]` is undefined (there's no `i` with `αⁱ = 0`); reading it crashes. Always guard `b == 0` before computing `inv(b)` or `log(b)`.
4. **Multiplication overflow during construction.** `mul_polynomial` of two bytes can produce up to 15 bits before reduction. Use `int` (or `uint16`) for the intermediate, then reduce.
5. **Mod 255 vs. mod 256.** Exponents reduce mod **255** (the group order of GF(2⁸)*), not 256. `α²⁵⁵ = α⁰ = 1` — that's the cyclicity that makes the log table close.

---

## 🎯 When to Use GF(2⁸)

✅ **Use when:**
- Building Reed-Solomon, BCH, or other algebraic ECC
- Implementing AES (the S-box is GF(2⁸) inversion)
- RAID-6 disk parity (P+Q syndrome math is GF(2⁸))
- Any context where "every nonzero element has an inverse" matters

❌ **Don't use when:**
- You just need bitwise XOR or checksums — plain integers suffice
- Higher-degree fields are needed: GF(2¹⁶) and GF(2³²) exist but have larger tables (64 KB and infeasible respectively — switch to carryless multiplication or PCLMULQDQ on modern CPUs)

---

## 🔧 Implementations

| Language | Folder | Notes |
|----------|--------|-------|
| Python | [Python/](Python/) | `GF256` class with precomputed log/antilog tables; explicit polynomial ops |
| C++ | [C++/](C++/) | Header-only `GF256` with `constexpr` table construction at compile time |
| Go | [Go/](Go/) | Singleton-style table; concurrent-safe (read-only after init) |

All three implementations agree byte-for-byte on every operation (tested against shared known-value vectors).

---

## 📝 Practice Problems

- Implement AES S-box construction using only your GF(2⁸) primitives.
- Compute every element's multiplicative inverse and verify `a · inv(a) = 1`.
- Find all primitive elements of GF(2⁸) (there are φ(255) = 128 of them).
- Implement carry-less multiplication using only XOR and shift; benchmark vs. table lookup.

---

## 🔗 Related

- [Reed-Solomon](../Reed_Solomon/README.md) — the canonical user of GF(2⁸) arithmetic
- [Modular Arithmetic](../../Mathematical_Algorithms/Number_Theory/Modular%20Arithmetic/) — the prime-field cousin (GF(p))
- [Fast Fourier Transform](../../Mathematical_Algorithms/Advanced_Math/Fast%20Fourier%20Transform/) — also a polynomial-evaluation algorithm, in a different field

---

_Part of [Coding Theory](../README.md)._
