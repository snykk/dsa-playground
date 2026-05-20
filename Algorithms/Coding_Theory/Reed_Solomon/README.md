# Reed-Solomon Codes

> Given a message of `k` bytes, Reed-Solomon produces a codeword of `n` bytes (`n > k`) that can be **recovered exactly** even if up to `t = (n - k) / 2` bytes are corrupted **anywhere** in the codeword — the corruption locations don't need to be known in advance. This is the math behind QR codes, CDs/DVDs, RAID-6, Voyager 2's communications back to Earth, and most modern storage.

---

## 🎯 Intuition

Think of a `k`-byte message as the coefficients of a polynomial of degree `k − 1`. A polynomial of degree `k − 1` is uniquely determined by any `k` points on its graph. So if you send `n` evaluation points (instead of just the `k` coefficients), the receiver can reconstruct the polynomial as long as they can identify **any** `k` of them as correct — even if the others have been tampered with.

```
Message m₀, m₁, m₂ (k = 3 bytes)  →  polynomial M(x) = m₀ + m₁x + m₂x²
Send n = 5 evaluation points:        M(0), M(1), M(2), M(3), M(4)

Receiver gets 5 bytes. Even if 1 byte was corrupted in transit, the
remaining 4 are still on the original polynomial. There's only one
degree-2 polynomial passing through any 3 of those 4 points → recover.
```

In practice we use the **systematic encoding**: the first `k` bytes of the codeword _are_ the message verbatim, and the last `n − k` bytes are parity (chosen so the whole codeword is a multiple of a fixed generator polynomial). That way, an error-free codeword needs no decoding work — you just read the first `k` bytes.

---

## 🧮 The Algorithm in Four Steps

### 1. Build the generator polynomial g(x) — done once per (n, k)

```
g(x) = (x - α^0)(x - α^1)(x - α^2) ... (x - α^(n-k-1))
```

Where `α` is the primitive element of GF(2⁸) (typically `0x02`). `g(x)` has degree `n − k`. All codewords are multiples of `g(x)`.

### 2. Encode (k bytes → n bytes)

```
Treat message m[] as polynomial M(x) of degree k - 1.
Shift it up by (n - k) positions: M(x) · x^(n-k).
Divide by g(x), keep the remainder r(x).
Codeword: [m₀ m₁ ... m_{k-1} | r₀ r₁ ... r_{n-k-1}]
```

The codeword is now exactly divisible by `g(x)`, by construction.

### 3. Compute syndromes (detect errors)

Receive (possibly corrupted) codeword `r(x)`. Evaluate it at `α^0, α^1, ..., α^(n-k-1)`:

```
s_i = r(α^i)  for i = 0..n-k-1
```

If all syndromes are 0, the codeword is correct (or has too many errors to detect — _extremely_ unlikely). If any syndrome is nonzero, there are errors to locate.

### 4. Locate and fix errors (the hard part)

This is where **Berlekamp-Massey** comes in. The syndromes form a linear recurrence whose minimal polynomial is the **error locator polynomial** Λ(x). BM finds Λ in O((n-k)²) time. Then:

- **Roots of Λ(x)** (via Chien search) give the positions of errors.
- **Forney's algorithm** computes the magnitudes (what value to XOR at each position) from the syndromes and Λ.

XOR the corrections into the received codeword → recovered original.

---

## 📊 Visual: A Tiny RS(7, 5) Example

Goal: send 5-byte message `[2, 3, 5, 7, 11]`, can tolerate 1 byte error.

```
Step 1: g(x) = (x - 1)(x - 2) = x² - 3x + 2 = x² + 3x + 2  (using XOR for sub in GF(2^8))
Step 2: Codeword = [2, 3, 5, 7, 11 | r₀, r₁]
        Pick r₀, r₁ so that codeword(α^0) = 0 and codeword(α^1) = 0.

Step 3: Suppose 7 gets corrupted to 99 in transit.
        Received: [2, 3, 5, 99, 11, r₀, r₁]
        Syndromes: s₀ = received(α^0), s₁ = received(α^1). Both nonzero.

Step 4: Berlekamp-Massey from {s₀, s₁} gives Λ(x) = 1 - α³·x  (a degree-1 poly).
        Root α^(-3) = α^252; so error is at position 3 (where 99 sits).
        Forney gives the error magnitude e = 99 ⊕ 7 = 100.
        Fix: received[3] ⊕= 100 → 99 ⊕ 100 = 7. Recovered!
```

Real implementations use larger `(n, k)` — RS(255, 223) is a typical satellite code that tolerates 16 byte errors per 255-byte block.

---

## ⏱️ Complexity

| Phase | Time | Why |
|-------|------|-----|
| Generator construction | O((n - k) · n) | Once per code parameter |
| Encode | O(k · (n - k)) | Polynomial division by g(x) |
| Syndrome computation | O((n - k) · n) | n - k evaluations at α^i |
| Berlekamp-Massey | O((n - k)²) | Iterate over n - k syndromes |
| Chien search (error positions) | O(n · t) | Evaluate Λ at all n positions |
| Forney (error magnitudes) | O(t²) | per-error correction |
| **Total decode** | **O((n - k) · n)** | Dominated by syndromes |

For RS(255, 223), all of this finishes in well under a millisecond on a modern CPU — fast enough for terabytes-per-second storage links.

---

## 🎯 Capability — How Many Errors?

Reed-Solomon with `2t` parity bytes can:

- **Detect** up to `2t` byte errors per codeword (any errors → at least one nonzero syndrome).
- **Correct** up to `t` byte errors per codeword (BM + Forney).
- **Correct mixed errors + erasures**: if you know certain positions are wrong (e.g. from a media-read error flag), each "erasure" only costs **1 parity byte** instead of 2. So you can fix `e` erasures + `t'` errors as long as `e + 2t' ≤ n - k`.

| Code | Parity | Corrects | Real-world use |
|------|--------|----------|----------------|
| RS(7, 5) | 2 bytes | 1 byte | Toy example |
| RS(255, 223) | 32 bytes | 16 bytes | Voyager 2, CCSDS standard |
| RS(255, 251) | 4 bytes | 2 bytes | QR code (small) |
| RS(208, 192) | 16 bytes | 8 bytes | DVD inner code |
| RS(stripe, stripe-2) | 2 disks | 2 simultaneous failures | RAID-6 |

---

## ⚔️ Reed-Solomon vs. Alternatives

| Code | Strength | Weakness | Best for |
|------|----------|----------|----------|
| **Reed-Solomon** | Strong burst-error correction; well-studied | Block-oriented; fixed block size | Storage, satellite |
| **Hamming** | Tiny; corrects 1 bit per block | Only 1 bit/block | DRAM ECC |
| **BCH** | Multiple bit errors | More complex than RS for byte errors | Flash memory, DVDs (outer) |
| **LDPC** | Approaches Shannon limit; soft-decision | Iterative decoding; complex | 5G, Wi-Fi 6, DVB-S2 |
| **Turbo codes** | Near-Shannon; great for noisy channels | Iterative; latency | 3G/4G cellular |
| **Polar codes** | Provably Shannon-capacity at infinite block | Recent; some HW complexity | 5G control channels |

Reed-Solomon's sweet spot: **byte-oriented, hardware-friendly, well-understood, decades of deployment**.

---

## ⚠️ Common Pitfalls

1. **Confusing erasure with error.** An erasure is "I know byte 3 is wrong"; an error is "some byte is wrong but I don't know which." Erasures are cheaper to fix.
2. **Generator polynomial mismatch.** Encoder and decoder must use the same `g(x)`. Differing primitive elements or polynomial orders silently produces garbage.
3. **Byte-order in storage.** Codewords are arrays of GF(2⁸) elements. If you store them as little-endian shorts, your decoder will see permuted bytes and report uncorrectable errors.
4. **Berlekamp-Massey edge cases.** When all syndromes are 0, BM should return Λ(x) = 1 (no errors). When `t > (n - k) / 2`, BM detects "more errors than the code can fix" but cannot reliably fix them — return a decode-failure error, don't pretend to succeed.
5. **Chien search precision.** Evaluate Λ at α^0, α^1, ..., α^(n-1) and collect positions where Λ(α^i) = 0. If you find fewer roots than degree(Λ), it's a decode failure (errors beyond capability).
6. **Mixing up bit and byte capacity.** RS(255, 223) corrects 16 _bytes_ — that's potentially 128 _bits_, but contiguous. For random bit errors, BCH or LDPC may be more efficient.

---

## 🔧 Implementations

| Language | Folder | Notes |
|----------|--------|-------|
| Python | [Python/](Python/) | Full encode + Berlekamp-Massey decode + Forney + Chien search. Round-trip tests with random error injection. |
| C++ | [C++/](C++/) | Header-only; reuses `gf256::shared()`. |
| Go | [Go/](Go/) | Mirrors the Python implementation; uses `GF256` from the sibling package. |

All three implementations are tested against the same fixture: encode → inject up to `t` random byte errors → decode → assert original message returned.

---

## 📝 Practice Problems

- Implement RS(255, 251) and decode a QR code's data region.
- Add erasure decoding: given known-bad positions, prove you can correct `n - k` of them.
- Benchmark encode/decode throughput; see how close you get to disk bandwidth.
- Read the QR code specification (ISO/IEC 18004) and verify your `g(x)` matches.
- Extend to GF(2¹⁶) for codes longer than 255 bytes; observe how table size explodes.

---

## 🔗 Related

- [Galois Field GF(2⁸)](../Galois_Field/README.md) — the arithmetic foundation
- [Coding Theory overview](../README.md)
- [Modular Arithmetic](../../Mathematical_Algorithms/Number_Theory/Modular%20Arithmetic/README.md) — analogous structure over prime fields

---

_Part of [Coding Theory](../README.md)._
