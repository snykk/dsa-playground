# Reed-Solomon — Python Implementation

Full Reed-Solomon over GF(2⁸): systematic encoder, Berlekamp-Massey decoder, Forney magnitudes, and Chien search. Verified against Voyager 2's RS(255, 223) code with 16-byte error correction.

For the conceptual overview, see the parent README: [../README.md](../README.md)

---

## Files

| File | Purpose |
|------|---------|
| `reed_solomon.py` | `ReedSolomon` class (encode/decode), `DecodeError` exception |
| `reed_solomon_test.py` | 14 tests — round trip with 0–t errors, QR-like codes, Voyager RS(255,223), boundary cases |

---

## Python-Specific Notes

- **Re-uses the sibling `Galois_Field/Python/galois_field.py`** via a `sys.path` shim. No duplicate GF code — both modules agree byte-for-byte on every primitive.
- **Polynomial layout**: low-degree-first throughout (matching the GF module's convention). The systematic codeword is laid out as `[parity_0, parity_1, ..., parity_{n-k-1}, msg_0, msg_1, ..., msg_{k-1}]` — parity at low-degree positions, message at high-degree.
- **Critical default: `alpha = 3`, not 2.** In GF(2⁸) under polynomial 0x11B (Rijndael), the byte `2` is **not** a primitive element — its multiplicative order is 51, so it generates only a subgroup. Decoding silently breaks past ~3 errors with α=2. The element `3` (= x + 1) is the standard primitive root of order 255.
- **Berlekamp-Massey** uses the iterative "swap-and-scale" form: track `err_loc` and `old_loc` (the latter being a shifted scratch). When the discrepancy is nonzero and `len(old_loc) > len(err_loc)`, swap roles before adding.
- **Forney's algorithm** includes the `X_j = α^j` multiplier (since syndromes start at `α^0`, i.e., `fcr = 0`). Skipping this is the #1 way to get wrong magnitudes that pass small tests but fail in production.

---

## How to Run

```bash
python3 -m unittest reed_solomon_test.py
```

---

## Key Takeaways for Learners

1. **The primitive element matters.** Naively picking `α = 2` because "it's the smallest" silently corrupts decoders for codes longer than ~51 bytes. Always verify your α generates the full multiplicative group — for AES/Rijndael GF(2⁸), use α = 3.
2. **Forney needs the X_j factor when fcr = 0.** The Forney formula `e_j = X_j^(1-fcr) · Ω(X_j⁻¹) / Λ'(X_j⁻¹)` — for `fcr = 0` (syndromes from α⁰), the `X_j` multiplier is required. Easy to omit; small tests still pass; large tests fail.
3. **Berlekamp-Massey + Forney + Chien is "linear algebra on syndromes."** Once you internalize that syndromes determine Λ uniquely (when ≤ t errors occurred), the rest is mechanical. The hard part is field arithmetic — get the GF(2⁸) operations right and RS just works.
