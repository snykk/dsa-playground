# Reed-Solomon -- Python Implementation

Full Reed-Solomon over GF(2^8): systematic encoder, Berlekamp-Massey decoder, Forney magnitudes, and Chien search, with **combined error + erasure decoding** and a configurable **first consecutive root (`fcr`)**. Tested on an RS(255, 223) code with 16 byte errors.

For the conceptual overview, see the parent README: [../README.md](../README.md)

## Files

| File | Purpose |
|------|---------|
| `reed_solomon.py` | `ReedSolomon(n, k, alpha=3, fcr=0)` with `encode()` / `decode(received, erasures=None)`, plus `DecodeError` |
| `reed_solomon_test.py` | 28 tests: 0..t errors, erasures only (up to `n - k`), mixed errors + erasures, several `fcr` values, beyond-budget detection, Voyager RS(255, 223), boundary cases |

## Usage

```python
from reed_solomon import ReedSolomon, DecodeError

rs = ReedSolomon(n=15, k=11)                 # 4 parity bytes
codeword = rs.encode(b"Hello DSA!!")         # any iterable of ints 0..255

codeword[3] ^= 0x99                          # 2 errors at unknown positions
codeword[12] ^= 0xFF
rs.decode(codeword)                          # -> original 11 bytes

codeword[0] = codeword[1] = 0                # now also 2 bytes known to be bad
rs.decode(codeword, erasures=[0, 1])         # DecodeError: 2 + 2*2 = 6 > 4 parity bytes

fresh = rs.encode(b"Hello DSA!!")
fresh[0] = fresh[1] = fresh[2] = fresh[3] = 0
rs.decode(fresh, erasures=[0, 1, 2, 3])      # -> original: 4 erasures fit 4 parity bytes
```

## API

- `ReedSolomon(n, k, alpha=3, fcr=0)`: validates `0 < k < n <= 255`, builds the generator; `t = (n - k) // 2`.
- `encode(message)`: any iterable of `k` ints; returns the `n`-byte systematic codeword `[parity | message]`.
- `decode(received, erasures=None)`: returns the `k` message bytes; raises `DecodeError` when the damage exceeds the budget `e + 2v <= n - k`, and `ValueError` for malformed input.
- `DecodeError`: subclass of `Exception`.
- Internal steps: `_compute_syndromes`, `_berlekamp_massey`, `_find_error_positions`, `_forney`.

## Python-Specific Notes

- **Re-uses the sibling `Galois_Field/Python/galois_field.py`** via a `sys.path` shim. No duplicate GF code, so both modules agree byte-for-byte on every primitive.
- **Polynomial layout**: low-degree-first throughout (matching the GF module's convention). The systematic codeword is `[parity_0, ..., parity_{n-k-1}, msg_0, ..., msg_{k-1}]`: parity at the low-degree positions, message at the high-degree end, so the message is the **last** `k` bytes.
- **Critical default: `alpha = 3`, not 2.** Under the Rijndael polynomial 0x11B, the byte `2` is **not** primitive: its multiplicative order is 51, so it generates only a subgroup and decoding breaks for codewords longer than 51 bytes, even with a single error (Chien search finds several candidate positions and `decode` raises `DecodeError`). The element `3` (= x + 1) has order 255.
- **Erasures go straight into Berlekamp-Massey.** `decode()` builds the erasure locator `Gamma(x) = prod (1 + alpha^i x)` over the known positions, starts BM from `Gamma` instead of `1`, and skips the first `e` syndromes. BM then returns the combined locator `Phi(x) = Lambda(x) * Gamma(x)` directly; Chien search and Forney need no changes.
- **Berlekamp-Massey** uses the "swap-and-scale" form (as in the Wikiversity Reed-Solomon tutorial) with high-degree-first storage internally. The C++ and Go versions use the classical L-tracking form; both produce the same locator.
- **Forney uses `X_j^(1 - fcr)`**: `X_j` for `fcr = 0`, `1` for `fcr = 1`. Skipping or hard-coding this factor is the #1 way to get wrong magnitudes that pass small tests but fail in production.
- **Inputs are any iterable** (`bytes`, `tuple`, `list`); outputs are `list[int]`.

## How to Run

```bash
python3 -m unittest reed_solomon_test      # tests
python3 reed_solomon.py                    # demo: errors-only and erasure + error decode
```

## Key Takeaways

1. **The primitive element matters.** Picking `alpha = 2` because "it's the smallest" silently corrupts decoders for codes longer than ~51 bytes. Always check that `alpha` generates the full multiplicative group; for the Rijndael field 0x11B, use `alpha = 3`.
2. **An erasure costs half an error.** For an unknown error the decoder must find two unknowns (where, and by how much); for an erasure only the value is unknown. That is why the budget is `e + 2v <= n - k`, and why RS(7, 5) can repair 2 bytes only when it is told where they are.
3. **`fcr` is part of the code's identity.** The same message encoded with `fcr = 1` is not a valid codeword for an `fcr = 0` decoder. A real decoder must match the standard's field polynomial, `alpha`, *and* `fcr`.
4. **Berlekamp-Massey + Forney + Chien is "linear algebra on syndromes."** Once you see that the syndromes pin down the locator uniquely (within the budget), the rest is mechanical. The hard part is the field arithmetic: get GF(2^8) right and RS just works.
