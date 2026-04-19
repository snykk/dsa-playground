# Bloom Filter — C++ Implementation

A **Bloom Filter** is a space-efficient probabilistic data structure used to test set membership with **no false negatives**, but small false-positive probability. Great when you need to check "is this item _possibly_ in the set?" before touching an expensive source (database, disk, network).

For the conceptual overview, visuals, and comparison with alternatives, see the parent README: [../README.md](../README.md)

---

## Files

| File | Purpose |
|------|---------|
| `bloom_filter.cpp` | Core implementation: bit array, hash family, `add` / `contains` |
| `bloom_filter_test.cpp` | Assertion-based unit tests |

---

## C++-Specific Notes

- **`std::vector<bool>`** is used as a packed bit array (1 bit per element in most stdlib implementations). This is exactly what a bloom filter needs — do not replace it with `std::vector<int>`, which wastes 32–64× memory.
- **Hash family via double hashing**: combine two independent hash values `h1, h2` and derive the k-th hash as `h1 + k * h2`. This avoids computing `k` separate hash functions while preserving the false-positive guarantees (Kirsch & Mitzenmacher, 2006).
- **`std::hash<std::string>`** from `<functional>` is the base hash. It's fast and reasonably well-distributed; for adversarial inputs you would swap in a keyed hash (e.g. SipHash).
- **No erase operation** — a standard bloom filter cannot delete items without introducing false negatives. If deletion is required, use a _counting_ bloom filter.

---

## How to Run

```bash
g++ -std=c++17 -O2 -Wall bloom_filter_test.cpp -o bloom_filter_test
./bloom_filter_test
```

---

## Key Takeaways for Learners

1. **False positives are the price of compactness.** Sizing the bit array and picking `k` (number of hash functions) are the two knobs that trade memory for accuracy — the classic formula is `m = -(n * ln p) / (ln 2)²` and `k = (m / n) * ln 2`.
2. **Double hashing is a real engineering shortcut.** Computing `k` hashes naively is slow; the `h1 + i * h2` trick gives you `k` cheap hashes with essentially the same properties.
3. **Understand what bloom filters can't do.** They cannot enumerate their contents, cannot give a false-negative-free "not present" after deletions, and cannot give you counts. They answer _one_ question: "definitely absent, or possibly present?"
