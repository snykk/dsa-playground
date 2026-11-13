# Galois Field GF(2⁸) — Go Implementation

GF(2⁸) arithmetic with package-level singleton tables. Thread-safe for concurrent reads after the one-time init.

For the conceptual overview, see the parent README: [../README.md](../README.md)

---

## Files

| File | Purpose |
|------|---------|
| `main.go` | `GF256` type with `Add`, `Mul`, `Div`, `Inv`, `Pow` + polynomial helpers; package-level `Shared()` accessor |
| `main_test.go` | 11 tests including AES known vectors, field laws, and polynomial ops |
| `go.mod` | Module definition |

---

## Go-Specific Notes

- **`Shared()` returns a `*GF256`** built once at package init time. Methods are read-only, so the singleton is safe for unlimited concurrent reads — no mutex required.
- **`ErrDivByZero`** is a sentinel error wrapped via `errors.Is` for clean handling at call sites. Matches Go stdlib conventions (`errors.New`, exported sentinel).
- **`[2 * FieldOrder]byte` fixed-size array** for the exp table — zero allocation, lives entirely on the `*GF256` struct.
- **No generics**: hardcoded to `byte` because the field is fixed at GF(2⁸). A different-sized field would warrant a different type.
- **`Pow` returns an error only on 0⁰**: matches the mathematical convention and lets callers handle the edge case explicitly rather than panic.

---

## How to Run

```bash
go test -v ./...
```

---

## Key Takeaways for Learners

1. **Go's lack of operator overloading is a feature here.** Forcing `gf.Mul(a, b)` instead of `a * b` is honest — it reminds you this isn't regular multiplication.
2. **Singleton via package-level var** is the idiomatic Go pattern for "expensive immutable global." No `sync.Once`, no double-checked locking — Go's init order handles it.
3. **Errors for exceptional cases, not control flow.** `Mul` returns just a byte (it can't fail). `Inv` returns `(byte, error)` because invalidating 0 is a real possibility callers should handle explicitly.
