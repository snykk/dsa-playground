# Bloom Filter -- Go Implementation

A Bloom filter over strings. See the [topic README](../README.md).

## Files

- `main.go`: the `BloomFilter` type (no `main` function).
- `main_test.go`: tests for add/contains, tiny filters, sizing, invalid arguments (panics) and the measured false positive rate.
- `go.mod`: module file.

## API

| Function | Description | Time |
|----------|-------------|------|
| `NewBloomFilter(capacity, errorRate)` | panics if capacity <= 0 or errorRate not in (0, 1) | O(m) |
| `(*BloomFilter).Add(item)` | set k bits | O(k) |
| `(*BloomFilter).Contains(item)` | maybe present or definitely not | O(k) |

## Go-Specific Notes

- Two 64-bit hashes: `h1` is FNV-1a of the item and `h2` is a splitmix64-style mix of `h1`, forced odd. Position i is `(h1 + i*h2) mod m` in `uint64` arithmetic.
- An earlier version appended the index byte to the item and used FNV-32a, which correlated the k positions and gave 10-19% false positives at a configured 1%.
- Bits are a `[]bool` (one byte per bit), not packed into `uint64` words.

## How to Run

```bash
go test ./...
```

## Key Takeaways

- Correlated hashes silently ruin the false positive rate; measure it.
- Double hashing needs two independent hashes.
- Invalid sizes panic rather than build a filter that always says yes.
