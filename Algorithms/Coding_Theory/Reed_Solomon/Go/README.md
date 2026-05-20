# Reed-Solomon -- Go Implementation

Full Reed-Solomon over GF(2^8): systematic encode + Berlekamp-Massey decode + Forney + Chien. Includes minimal GF(2^8) primitives so this folder is self-contained (no cross-module import).

For the conceptual overview, see the parent README: [../README.md](../README.md)

---

## Files

| File | Purpose |
|------|---------|
| `main.go` | `ReedSolomon` type, GF(2^8) primitives, encode/decode methods |
| `main_test.go` | 11 tests: round-trip, 1/2/QR/Voyager error counts, too-many-errors |
| `go.mod` | Module definition |

---

## Go-Specific Notes

- **Default primitive element alpha = 3.** The byte `2` is NOT primitive in GF(2^8) under Rijndael 0x11B (its multiplicative order is 51, not 255). Using alpha = 2 silently fails decoding once codeword length exceeds ~51 bytes -- a very subtle bug. `3` (= x + 1) generates the full order-255 group.
- **Self-contained GF(2^8)**: this file vendors the minimal Galois Field primitives directly. The sibling `../../Galois_Field/Go` package has the same primitives plus more (used by other algorithms in the repo); we duplicate just the slice needed here to keep the Go module independent.
- **Errors as values**: encode/decode return `([]byte, error)` rather than panic. The sentinel `ErrDecode` is wrappable with `errors.Is`.
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
