# Reed-Solomon -- Go Implementation

Full Reed-Solomon over GF(2^8): systematic encode + Berlekamp-Massey decode + Forney + Chien, with combined error + erasure decoding and a configurable first consecutive root (`fcr`). Includes minimal GF(2^8) primitives so this folder is self-contained (no cross-module import).

For the conceptual overview, see the parent README: [../README.md](../README.md)

---

## Files

| File | Purpose |
|------|---------|
| `main.go` | `ReedSolomon` type, GF(2^8) primitives, `Encode` / `Decode` / `DecodeWithErasures` |
| `main_test.go` | 25 tests: errors only (1, 2, QR-like, Voyager RS(255, 223)), erasures only, mixed errors + erasures, several `fcr` values, beyond-budget detection, input validation, and the shared RS(7, 5) known-codeword fixture |
| `go.mod` | Module definition |

---

## Usage

```go
rs, _ := NewReedSolomon(15, 7, 3)            // 8 parity bytes, fcr = 0
cw, _ := rs.Encode([]byte("ABCDEFG"))
for _, p := range []int{0, 1, 2, 3} {        // 4 bytes known to be bad
	cw[p] = 0xFF
}
cw[7] ^= 0xAA                                // + 2 errors at unknown positions
cw[11] ^= 0x55
msg, err := rs.DecodeWithErasures(cw, []int{0, 1, 2, 3}) // 4 + 2*2 <= 8 -> "ABCDEFG"
if errors.Is(err, ErrDecode) { /* damage exceeded the budget */ }

rs1, _ := NewReedSolomonWithFCR(15, 11, 3, 1) // generator roots alpha^1 .. alpha^4
```

---

## Go-Specific Notes

- **Default primitive element alpha = 3.** The byte `2` is NOT primitive in GF(2^8) under Rijndael 0x11B (its multiplicative order is 51, not 255). Using alpha = 2 silently fails decoding once codeword length exceeds ~51 bytes -- a very subtle bug. `3` (= x + 1) generates the full order-255 group.
- **Self-contained GF(2^8)**: this file vendors the minimal Galois Field primitives directly. The sibling `../../Galois_Field/Go` package has the same primitives plus more (used by other algorithms in the repo); we duplicate just the slice needed here to keep the Go module independent.
- **Errors as values**: encode/decode return `([]byte, error)` rather than panic. Malformed input (wrong length, erasure position outside `[0, n)`) returns a plain error; damage beyond the budget `e + 2v <= n - k` returns the sentinel `ErrDecode`, sometimes wrapped with detail (`fmt.Errorf("%w: ...")`), so always test with `errors.Is`.
- **No default arguments in Go**, so the API grows by name instead: `NewReedSolomon` keeps `fcr = 0` and `Decode` means "no erasures"; `NewReedSolomonWithFCR` and `DecodeWithErasures` are the general forms. Existing callers keep compiling.
- **Berlekamp-Massey in the classical L-tracking form**, seeded with the erasure locator `Gamma(x)`: start at syndrome `e` with `L = e`, length-change test `2L <= r + e`. It returns the combined locator `Phi(x) = Lambda(x) * Gamma(x)`, so Chien search and Forney are unchanged.
- **Erasures are copied, sorted (`sort.Ints`), and de-duplicated in place** before use, so the caller's slice is never modified.
- **`init()` builds the log/antilog tables once** at package load. After that, every GF operation is read-only -- safe for unlimited concurrent use.
- **Byte slices everywhere**: polynomial format is `[]byte` (low-degree-first). Matches the Python sibling byte-for-byte on every encoded codeword.

---

## How to Run

```bash
go test -v ./...
```

---

## Key Takeaways for Learners

1. **`init()` is Go's answer to "expensive one-time setup."** No need for double-checked locking or `sync.Once` -- the runtime guarantees `init()` runs exactly once before any package code executes.
2. **Sentinel errors with `errors.Is`** is the modern Go idiom. Callers check `errors.Is(err, ErrDecode)` to handle the recoverable case without panicking.
3. **Don't trust your generator polynomial blindly.** Always verify `pow(alpha, FIELD_ORDER) == 1` AND `pow(alpha, i) != 1` for all `i` in `[1, FIELD_ORDER)`. With alpha = 2 on 0x11B, you'd find `pow(2, 51) == 1`, exposing the bug before it breaks a customer.
