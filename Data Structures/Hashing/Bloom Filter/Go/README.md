# Bloom Filter — Go Implementation

A **Bloom Filter** is a space-efficient probabilistic data structure for set-membership testing. It gives you **no false negatives**, accepts small **false-positive probability**, and uses a tiny fraction of the memory that a real set would need.

For the conceptual overview, visuals, sizing formulas, and comparison with alternatives, see the parent README: [../README.md](../README.md)

---

## Files

| File | Purpose |
|------|---------|
| `main.go` | Core `BloomFilter` type with `Add` / `Contains` methods |
| `main_test.go` | Table-driven unit tests |
| `go.mod` | Module definition |

---

## Go-Specific Notes

- **Bit storage via `[]uint64`**: Go has no `BitSet` in the standard library, so we pack bits into a `uint64` slice and index with `idx/64` + `idx%64`. Each word holds 64 bits — efficient for cache lines and CPU word operations.
- **Hashing via `hash/fnv`**: `fnv.New64a()` is in the standard library, fast, and good enough for non-adversarial inputs. We derive `k` hash values using the classic double-hashing trick `h1 + i*h2`.
- **No generics required**: even on Go 1.18+, `Add(key string)` and `Contains(key string)` suffice. If you need arbitrary types, accept `[]byte` and let the caller marshal.
- **Concurrency**: the provided implementation is _not_ goroutine-safe. Wrap writes in a `sync.Mutex` (or use `sync/atomic` on the underlying words) if multiple goroutines call `Add` concurrently.

---

## How to Run

```bash
go test -v ./...
```

---

## Key Takeaways for Learners

1. **Bit packing pays off.** A million-element filter at 1% false-positive rate needs ~1.2 MB as packed bits, versus tens of megabytes for an equivalent `map[string]struct{}`.
2. **Choose `k` carefully.** Too few hash functions → high false-positive rate. Too many → bits saturate quickly and the filter degrades. `k ≈ (m/n) * ln 2` is the sweet spot.
3. **Know your insert budget.** Bloom filters have a fixed capacity — insert more than `n` elements and the false-positive rate blows past your target. For unbounded streams, use a _scalable bloom filter_.
