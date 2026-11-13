# 🔐 Coding Theory

Algorithms for **error detection and correction** on noisy channels — the math behind QR codes, CDs, DVDs, RAID-6 disk arrays, satellite communications, deep-space probes, and most digital storage media.

Where Cryptography hides data from adversaries, Coding Theory protects it from _accidents_: scratches, cosmic rays, packet loss, electrical noise. The trade-off is bandwidth: a Reed-Solomon code at rate `k/n` sends `n` bytes for every `k` you actually wanted, with the extra `n-k` bytes letting you recover from up to `(n-k)/2` random byte errors anywhere in the codeword.

---

## 📂 Topics in this folder

| Topic | Purpose | Pairs with |
|-------|---------|------------|
| **[Galois Field GF(2⁸)](Galois_Field/)** | Arithmetic over finite fields — add, multiply, divide, polynomial ops. The foundation. | Number theory, modular arithmetic |
| **[Reed-Solomon](Reed_Solomon/)** | Encode/decode a codeword that tolerates `t` byte errors at unknown positions, or up to `n - k` erasures (known-bad positions). Built on top of GF(2⁸). | The world's most-deployed error-correcting code |

---

## 🎯 Why Coding Theory?

Three realities make error correction non-negotiable:

1. **Physical media is noisy.** A typical hard drive bit-error rate is ~10⁻¹⁴; for a 4 TB drive you'd see one corruption every ~30 reads on average. Without RS-style ECC, modern storage would be useless.
2. **Wireless channels lose data.** Cell phones, Wi-Fi, satellite uplinks routinely drop bytes. Reed-Solomon (and successors like LDPC, Turbo codes) silently make these channels look reliable to higher layers.
3. **Adversarial damage isn't always an attack.** A QR code half-covered by a coffee cup is corrupted but recoverable — that's RS in action.

---

## ⚔️ Coding Theory vs. Adjacent Areas

| Field | Goal | Tooling |
|-------|------|---------|
| **Coding Theory** | Recover from random errors | Reed-Solomon, BCH, LDPC, Turbo |
| **Cryptography** | Hide from / authenticate against adversaries | AES, RSA, hashing, signatures |
| **Data Compression** | Reduce volume without losing meaning | Huffman, LZ77, arithmetic coding |
| **Checksum / CRC** | Detect (not correct) errors | CRC-32, Adler-32 |

A CRC tells you "something is broken." Reed-Solomon tells you "something was broken, _and here's the fix_."

---

## 🧮 The Math, in One Picture

```
Byte b in GF(2^8) ≡ polynomial b₇x⁷ + b₆x⁶ + ... + b₁x + b₀ over GF(2).

Add   (b ⊕ c)    : XOR.  Carry-free; "addition" in GF(2) is XOR.
Mul   (b ⊗ c)    : polynomial multiply, then mod a fixed irreducible polynomial
                   (Rijndael uses x⁸ + x⁴ + x³ + x + 1).
Inverse (b⁻¹)    : exists for every b ≠ 0; computed via extended Euclidean or via
                   antilog tables: b⁻¹ = α^(255 - log_α(b)) where α is a generator.

Reed-Solomon then treats your `k`-byte message as the coefficients of a polynomial
M(x) of degree k-1, and produces an n-byte codeword such that C(x) is a multiple
of a generator polynomial g(x). Errors corrupt C(x); decoding recovers the corruption
locations and magnitudes from "syndrome" evaluations of g(x).
```

You don't need to derive this from scratch — the implementations and READMEs walk through it step by step with small worked examples.

---

## 🎯 Real-World Reed-Solomon Codes

| Use case | Code | Errors corrected |
|----------|------|------------------|
| QR Code (Level L) | RS(26, 19) over GF(256) | 2 bytes |
| QR Code (Level H, max) | RS(26, 9) over GF(256) | 8 bytes |
| CD audio (CIRC) | C1 = RS(32, 28) inner, C2 = RS(28, 24) outer | 2 bytes each; C1 flags what it can't fix as erasures, so C2 can then repair up to 4 |
| DVD | RS(208, 192) + RS(182, 172) | Heavy redundancy |
| RAID-6 (P+Q parity) | RS(n, n-2) per stripe | 2 disk failures |
| Voyager 2 deep space | RS(255, 223) over GF(256) | 16 bytes |
| Blu-ray | RS(248, 216) | Tolerates physical scratches |

The exact parameters change but the **mathematical machinery is the same**: GF(2⁸) arithmetic plus a polynomial generator.

---

## 🔗 Related

- [Mathematical Algorithms — Number Theory](../Mathematical_Algorithms/Number_Theory/) — Modular arithmetic is to GF(p) what GF(2⁸) is to bytes
- [Hashing — Bloom Filter](../../Data_Structures/Hashing/Bloom_Filter/) — Probabilistic complement (membership rather than error correction)
- [Pattern Matching — Rabin-Karp](../String_Algorithms/Pattern_Matching/Rabin_Karp_Algorithm/) — Uses modular arithmetic over GF(p)

---

## 📚 Further Reading

- _The Art of Error Correcting Coding_ by Robert H. Morelos-Zaragoza
- _Algebraic Codes for Data Transmission_ by Richard E. Blahut
- [CMU 18-733 lecture notes on Reed-Solomon](https://www.cs.cmu.edu/~odonnell/papers/reed-solomon-tutorial.pdf)
- Wikipedia: [Reed–Solomon error correction](https://en.wikipedia.org/wiki/Reed%E2%80%93Solomon_error_correction)

---

_Part of the [Algorithms](../) section._
