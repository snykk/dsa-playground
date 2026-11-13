# Coding Theory

Coding theory protects data from accidents such as scratches, noise and lost packets. The two topics pair up. The Galois field GF(2^8) is the arithmetic on bytes, and the Reed-Solomon code runs on that arithmetic to repair corrupted bytes.

## Topics

Read them in this order.

| # | Topic | What it adds | Level |
|---|-------|--------------|-------|
| 1 | [Galois Field GF(2^8)](Galois_Field/) | The arithmetic. Add is XOR, multiply and divide are table lookups, and every nonzero byte has an inverse. | Advanced |
| 2 | [Reed-Solomon Codes](Reed_Solomon/) | The code. Add n-k parity bytes to k message bytes, then locate and repair damaged bytes with the field. | Advanced |

Both use the same field: polynomial `0x11B` (x^8 + x^4 + x^3 + x + 1) with generator 3. Python and C++ Reed-Solomon reuse the Galois Field topic directly, and Go carries its own minimal copy.

## How They Compare

| Topic | Role | Key property | Cost |
|-------|------|--------------|------|
| Galois Field | byte arithmetic with no overflow | add is XOR; every nonzero element has an inverse | O(1) per operation after an O(256) setup |
| Reed-Solomon | error and erasure correction | repairs up to (n-k)/2 errors at unknown positions, or e + 2v <= n - k with e erasures and v unknown errors | decode O(n (n-k)) |

With no erasures the budget is floor((n-k)/2) unknown errors. With known positions only, it is n-k erasures.

## Choosing One

| Situation | Read | Why |
|-----------|------|-----|
| You want the arithmetic behind AES, RAID-6 or QR codes | Galois Field | bytes as polynomials over GF(2), reduced by a fixed polynomial |
| You want to repair corrupted bytes | Reed-Solomon | parity bytes plus a decoder that finds positions and values |
| You know which bytes are bad | Reed-Solomon, erasures | each erasure costs one parity byte, an unknown error costs two |
| You need to compare this code with a standard | Reed-Solomon, the fcr section | the field here is fixed to 0x11B, so it is not bit-compatible with QR codes or CCSDS |

## Common Pitfalls

- GF(2^8) is not integers mod 256: addition is XOR, and multiplication reduces by the field polynomial.
- RS(255, 223) corrects 16 bytes, not bits, so 17 bit errors in 17 different bytes defeat it.
- Erasures `e` and unknown errors `v` must satisfy `e + 2v <= n - k`. Past it the decoder raises `DecodeError` in almost every case, but a heavy pattern can rarely look like a different valid codeword, and the code cannot detect that.
- QR codes use polynomial `0x11D` with alpha = 2, and CCSDS uses `0x187`. This code fixes `0x11B`, so its codewords are not theirs.
- The encoder and the decoder must use the same `fcr` (default 0), or a clean word looks corrupted.

## Related

- [Modular Arithmetic](../Mathematical_Algorithms/Number_Theory/Modular_Arithmetic/): read first.
- [Fast Fourier Transform](../Mathematical_Algorithms/Advanced_Math/Fast_Fourier_Transform/): another transform over a field, with complex numbers instead of bytes.
- [Number Theory Algorithms](../Mathematical_Algorithms/Number_Theory/): the modular ideas the finite field builds on.
