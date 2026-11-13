# Reed-Solomon Codes

Given a message of `k` bytes, Reed-Solomon produces a codeword of `n` bytes (`n > k`) that can be **recovered exactly** even if up to `t = floor((n - k) / 2)` bytes are corrupted **anywhere** in the codeword, without knowing in advance where the corruption is. If the bad positions *are* known (erasures), it can repair up to `n - k` of them. This is the math behind QR codes, CDs/DVDs, RAID-6, Voyager 2's communications back to Earth, and most modern storage.

## Intuition

Think of a `k`-byte message as the coefficients of a polynomial of degree `k − 1`. A polynomial of degree `k − 1` is uniquely determined by any `k` points on its graph. So if you send `n` evaluation points (instead of just the `k` coefficients), the receiver can reconstruct the polynomial as long as they can identify **any** `k` of them as correct, even if the others have been tampered with.

```
Message m0, m1, m2 (k = 3 bytes)  ->  polynomial M(x) = m0 + m1*x + m2*x^2
Send n = 5 evaluation points:         M(0), M(1), M(2), M(3), M(4)

Receiver gets 5 bytes. Even if 1 byte was corrupted in transit, the
remaining 4 are still on the original polynomial. There's only one
degree-2 polynomial passing through any 3 of those 4 points -> recover.
```

In practice we use **systematic encoding**: the message appears verbatim inside the codeword and the other `n − k` bytes are parity, chosen so the whole codeword is a multiple of a fixed **generator polynomial** `g(x)`. An error-free codeword then needs no decoding work: you just read the message bytes back out.

> **Layout convention used in this repo:** polynomials are stored low-degree-first, so the codeword is `[parity_0 .. parity_(n-k-1) | msg_0 .. msg_(k-1)]` and the message is the **last** `k` bytes. Many references print polynomials high-degree-first and therefore show the message first. It is the same codeword, read from the other end, but erasure positions must be given in the layout your encoder used.

## How It Works: The Algorithm in Four Steps

### 1. Build the generator polynomial g(x), once per (n, k)

```
g(x) = (x - alpha^fcr) (x - alpha^(fcr+1)) ... (x - alpha^(fcr+n-k-1))
```

`alpha` is a **primitive element** of GF(2⁸): its powers `alpha^0 .. alpha^254` hit every nonzero byte. Which byte that is depends on the field polynomial. Under the Rijndael polynomial 0x11B used in this repo, `alpha = 3`; the byte `2` has order 51 there and is **not** primitive. Under 0x11D (QR codes, many storage systems), `alpha = 2` is primitive. `fcr` is the **first consecutive root**, usually 0 (see [The fcr Parameter](#the-fcr-parameter)). `g(x)` has degree `n − k`, and every codeword is a multiple of it.

### 2. Encode (k bytes → n bytes)

```
Treat message m[] as polynomial M(x) of degree k - 1.
Shift it up by (n - k) positions: M(x) * x^(n-k)   (message moves to the high-degree end)
Divide by g(x), keep the remainder r(x)            (degree < n - k)
Codeword: c(x) = M(x) * x^(n-k) - r(x)  ->  [r0 r1 ... r_(n-k-1) | m0 m1 ... m_(k-1)]
```

Subtracting the remainder makes `c(x)` exactly divisible by `g(x)`, so `c(x)` is zero at every root of `g(x)`. In GF(2⁸), subtraction is XOR, which is the same as addition.

### 3. Compute syndromes (detect errors)

The receiver gets `r(x) = c(x) + e(x)`, where `e(x)` is the error pattern. Evaluate `r(x)` at the roots of `g(x)`:

```
s_i = r(alpha^(fcr+i))  for i = 0 .. n-k-1
```

Because `c(x)` vanishes at those roots, **`s_i = e(alpha^(fcr+i))`: the syndromes depend only on the errors, never on the message.** All zero means no detectable error. Anything else describes the errors and nothing else, which is what makes the next step possible.

### 4. Locate and fix errors (the hard part)

The syndromes form a linear recurrence whose minimal connection polynomial is the **error locator** `Lambda(x) = prod (1 + X_j x)`, where `X_j = alpha^(position j)`. **Berlekamp-Massey** finds it in O((n − k)²) time. Then:

- **Chien search** tries every position `p` and keeps those where `Lambda(alpha^-p) = 0`. These are the error positions.
- **Forney's algorithm** computes each error's magnitude (the value to XOR back in) from the syndromes and `Lambda`.

XOR the corrections into the received word, then re-check that all syndromes are now zero.

## Visual: The Decoding Pipeline

```
 received r(x)
      |
      v
 syndromes s_i = r(alpha^(fcr+i)) ---- all zero? ----> done (read the message bytes)
      |                     |
      |                     v
      |          Berlekamp-Massey <----- erasure locator Gamma(x)  (optional: known-bad positions)
      |                     |
      |                     v
      |          locator Phi(x) = Lambda(x) * Gamma(x)
      |                     |
      |                     v
      |          Chien search: which alpha^-p are roots?  --> bad positions p
      |                     |                                  (count != degree -> DecodeError)
      v                     v
 Forney: magnitude at each bad position
      |
      v
 XOR fixes into r(x) --> recompute syndromes --> all zero? yes: message / no: DecodeError
```

The expensive boxes are the syndromes, Berlekamp-Massey, and Chien search; each is O(n · (n − k)) at worst.

## Step-by-Step Trace: RS(7, 5) With Real Numbers

These are the actual values the implementations here produce (GF(2⁸) over 0x11B, `alpha = 3`, `fcr = 0`). RS(7, 5) has 2 parity bytes, so `t = 1`.

```
Step 1  g(x) = (x + alpha^0)(x + alpha^1) = (x + 1)(x + 3) = x^2 + 2x + 3
        (minus is XOR in GF(2^8); 1 XOR 3 = 2)

Step 2  message [2, 3, 5, 7, 11]  ->  codeword [87, 95 | 2, 3, 5, 7, 11]
                                               parity   message
        check: codeword(1) = 0 and codeword(3) = 0

Step 3  position 5 (the 7) is hit in transit: 7 -> 99
        received [87, 95, 2, 3, 5, 99, 11]
        s0 = received(alpha^0) = 100        s1 = received(alpha^1) = 130

Step 4  One error of value e at position p gives s0 = e and s1 = e * alpha^p, so
            alpha^p = s1 / s0 = 130 / 100 = 51 = alpha^5   ->   p = 5
        Berlekamp-Massey says the same: Lambda(x) = 1 + 51x, whose root is alpha^-5.
        Forney: magnitude = 100 (and indeed 99 XOR 7 = 100)
        received[5] XOR 100 = 99 XOR 100 = 7  ->  [2, 3, 5, 7, 11]  Recovered!
```

The same code facing two destroyed bytes shows what erasure information is worth:

```
received [87, 95, 0, 3, 5, 0, 11]          (bytes 2 and 5 wiped)
  decode(received)                   2 unknown errors > t = 1         -> DecodeError
  decode(received, erasures=[2, 5])  2 erasures <= n - k = 2          -> [2, 3, 5, 7, 11]
```

Real systems use larger `(n, k)`. RS(255, 223) is the classic satellite code that tolerates 16 byte errors per 255-byte block.

## Errors + Erasures

An **erasure** is a byte whose *position* is known to be bad: a sector the drive flagged as unreadable, a RAID disk that died, a packet that never arrived. Only its *value* is unknown.

Count unknowns against equations. Each syndrome is one equation, so there are `n − k` of them. An unknown error has two unknowns (where, and by how much); an erasure has one. Hence the budget:

```
e + 2v <= n - k        (e = erasures, v = unknown errors)
```

The decoder uses the extra knowledge like this:

1. Build the **erasure locator** from the known positions: `Gamma(x) = prod over erased i of (1 + alpha^i x)`.
2. **Seed Berlekamp-Massey with `Gamma(x)`** instead of `1`, and skip the first `e` syndromes; the known positions already account for them. BM returns `Phi(x) = Lambda(x) * Gamma(x)`, the locator of *all* bad positions (known and newly found).
3. Chien search and Forney run unchanged on `Phi(x)`.

Two practical consequences. First, flagging a byte that turns out to be fine is safe, but it still spends one parity byte. Second, RAID-6 is the pure-erasure case: a failed disk is a known position, so 2 parity disks rebuild any 2 failed disks.

## The fcr Parameter

`fcr` (first consecutive root) chooses *which* consecutive powers of `alpha` are the roots of `g(x)`: `alpha^fcr .. alpha^(fcr+n-k-1)`. The error-correcting power is the same for every choice, but the codes are different. A codeword of one is generally not a codeword of another.

| Standard | Field polynomial | alpha (root step) | fcr |
|----------|------------------|-------------------|-----|
| QR codes | 0x11D | 2 | 0 |
| "Narrow-sense" textbook convention | any | primitive | 1 |
| CCSDS RS(255, 223) (deep space) | 0x187 | alpha^11 | 112 (plus a dual-basis symbol mapping) |
| This repo's default | 0x11B | 3 | 0 |

Two places in the decoder must honor it:

- the syndromes are evaluated at `alpha^(fcr+i)`;
- Forney's magnitude formula carries a factor `X_j^(1 - fcr)`: `e_j = X_j^(1-fcr) * Omega(X_j^-1) / Lambda'(X_j^-1)`. That factor is `X_j` when `fcr = 0` and `1` when `fcr = 1`.

Get either wrong and decoding fails: a perfectly clean `fcr = 1` RS(15, 11) codeword fed to an `fcr = 0` decoder shows syndromes `[190, 0, 0, 0]` and raises `DecodeError`.

## Complexity

| Phase | Time | Why |
|-------|------|-----|
| Generator construction | O((n - k)²) | Multiply `n - k` linear factors, once per code |
| Encode | O(k · (n - k)) | Polynomial division by `g(x)` |
| Syndrome computation | O((n - k) · n) | `n - k` evaluations of a degree-`n` polynomial |
| Erasure locator `Gamma(x)` | O(e²) | Multiply `e` linear factors |
| Berlekamp-Massey | O((n - k)²) | `n - k - e` iterations, each O(n - k) |
| Chien search | O(n · (n - k)) | Evaluate a locator of degree ≤ `n - k` at all `n` positions |
| Forney | O((n - k)²) | One O(n - k) evaluation per bad position |
| **Total decode** | **O(n · (n - k))** | Dominated by syndromes and Chien search |

How fast is that in practice? This educational Python version decodes an RS(255, 223) block with 16 errors in about 5 ms (measured on an Apple Silicon laptop). Table-driven C, SIMD libraries, and hardware decoders are orders of magnitude faster, which is what lets storage and satellite links run Reed-Solomon at line rate.

## Capability: How Many Errors?

Reed-Solomon with `n − k` parity bytes has minimum distance `d = n − k + 1`, the largest possible for its length and rate (it is an **MDS** code). That buys:

- **Detect** up to `n − k` byte errors (any such pattern leaves a nonzero syndrome).
- **Correct** up to `t = floor((n − k) / 2)` byte errors at unknown positions.
- **Correct mixed errors and erasures** as long as `e + 2v ≤ n − k`, including up to `n − k` pure erasures.

| Code | Parity | Corrects (unknown positions) | Real-world use |
|------|--------|------------------------------|----------------|
| RS(7, 5) | 2 bytes | 1 byte, or 2 erasures | Toy example above |
| RS(26, 19) | 7 bytes | 3 bytes | QR code version 1-L (the spec relies on only 2 and keeps the slack as misdecode protection) |
| RS(208, 192) | 16 bytes | 8 bytes | DVD outer code (PO); the inner code (PI) is RS(182, 172) |
| RS(255, 223) | 32 bytes | 16 bytes | Voyager 2, CCSDS deep-space standard |
| RS-style P+Q parity | 2 disks | 2 failed disks (erasures) | RAID-6 |

## When to Use

Use Reed-Solomon when:

- errors come in bursts of bytes (scratches, lost sectors, lost packets) and the data is byte oriented,
- you know which pieces are missing (RAID, erasure-coded storage): erasures cost half as much,
- you need a hard guarantee of the correction budget, not a probabilistic one.

Do not use it alone when the channel flips many scattered single bits (BCH or LDPC are more efficient), or when blocks must be longer than 255 symbols (use a larger field, or interleave).

## Reed-Solomon vs. Alternatives

| Code | Strength | Weakness | Best for |
|------|----------|----------|----------|
| **Reed-Solomon** | Strong burst-error correction; MDS; well-studied | Block-oriented; symbol size limits block length (255 for bytes) | Storage, optical media, satellite |
| **Hamming** | Tiny; corrects 1 bit per block | Only 1 bit/block | DRAM ECC (as SECDED) |
| **BCH** | Multiple random *bit* errors | Less natural than RS for byte bursts | NAND flash, DVB-S2 outer code |
| **LDPC** | Approaches Shannon limit; soft-decision | Iterative decoding; complex | 5G data, Wi-Fi, DVB-S2 inner code |
| **Turbo codes** | Near-Shannon; great for noisy channels | Iterative; latency | 3G/4G cellular |
| **Polar codes** | Provably capacity-achieving as block length grows | Recent; some HW complexity | 5G control channels |

Reed-Solomon's sweet spot is **byte-oriented, hardware-friendly, well-understood, decades of deployment**, and it is often paired with an inner code (convolutional, LDPC) that cleans up random bit errors first.

## Common Pitfalls

1. **Assuming `alpha = 2` is primitive everywhere.** It is under 0x11D but not under 0x11B (order 51). A non-primitive `alpha` builds a broken code that still passes small tests.
2. **Mismatched code parameters.** Encoder and decoder must agree on the field polynomial, `alpha`, *and* `fcr`. A mismatch produces garbage or decode failures even on clean data (see the `fcr` example above).
3. **Confusing erasures with errors.** An erasure is "I know byte 3 is wrong"; an error is "some byte is wrong but I don't know which." Erasures cost half as much, but only when their positions are passed to the decoder. Flagging everything suspicious wastes budget.
4. **Erasure positions in the wrong coordinates.** Positions refer to the codeword layout (here: parity first). Code written for a high-degree-first library numbers positions from the other end.
5. **Trusting Berlekamp-Massey blindly.** When the damage exceeds the budget, BM still returns *some* polynomial; it cannot know it was overwhelmed. Always check that Chien search finds exactly `deg(Lambda)` roots inside the codeword and that the corrected word has all-zero syndromes. Otherwise report failure instead of pretending to succeed.
6. **Forgetting Forney's `X_j^(1 - fcr)` factor.** For `fcr = 0` it is `X_j`; omitting it gives wrong magnitudes that pass small tests and fail in production.
7. **Mixing up bit and byte capacity.** RS(255, 223) corrects 16 *bytes*. That covers any burst of up to 121 bits wherever it starts (128 if byte-aligned), but 17 scattered single-bit errors in 17 different bytes defeat it. For random bit errors, BCH or LDPC are more efficient.

## Implementations

| Language | Folder | Notes |
|----------|--------|-------|
| Python | [Python/](Python/) | `decode(received, erasures=None)`; Berlekamp-Massey in the swap-and-scale form (Wikiversity style). |
| C++ | [C++/](C++/) | Header-only; reuses `gf256::shared()` from [Galois_Field/C++](../Galois_Field/C++/). `decode(received, erasures = {})`; classical L-tracking Berlekamp-Massey. |
| Go | [Go/](Go/) | Self-contained: a minimal GF(2⁸) lives in `main.go` and agrees byte-for-byte with [Galois_Field/Go](../Galois_Field/Go/). `Decode` / `DecodeWithErasures`, `NewReedSolomonWithFCR`. |

All three support errors + erasures and a configurable `fcr`, and share the same test fixtures: the RS(7, 5) codeword `[87, 95, 2, 3, 5, 7, 11]` from the trace above, random errors up to `t`, random errors + erasures within `e + 2v ≤ n − k`, several `fcr` values, and beyond-budget detection.

## Practice Problems

- Switch the field to 0x11D with `alpha = 2` and `fcr = 0`, then check your parity bytes against a real QR code's error-correction codewords (ISO/IEC 18004).
- Replace Berlekamp-Massey with the extended Euclidean (Sugiyama) algorithm and check that both give the same locator.
- Prove the Singleton bound `d ≤ n − k + 1`, show that RS meets it with equality, and derive `e + 2v ≤ n − k` from `d`.
- Simulate RAID-6: stripe data over `k` "disks", add 2 parity disks, kill any 2 disks, and rebuild them with erasure decoding.
- Benchmark encode/decode throughput, then speed it up (precomputed generator tables, syndrome via Horner with log/antilog tables).
- Extend to GF(2¹⁶) for codes longer than 255 symbols; observe how table size explodes.

## Related

- [Galois Field GF(2⁸)](../Galois_Field/README.md): the arithmetic foundation
- [Coding Theory overview](../README.md)
- [Modular Arithmetic](../../Mathematical_Algorithms/Number_Theory/Modular%20Arithmetic/README.md): analogous structure over prime fields
