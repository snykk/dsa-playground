# Bloom Filter

A Bloom filter is a bit array plus k hash functions that tests set membership in a few bits per item. It can say "maybe" for an item that was never added (a false positive) but never says "no" for one that was added (no false negatives). Add and query cost O(k).

## Intuition

Imagine a wall of `m` light switches, all off. To remember an item you flip the k switches its hashes point to. To ask about an item you look at its k switches: if any is off, the item was certainly never added. If all are on, it was probably added, but other items might have flipped those same switches.

Invariant: a bit is only ever set, never cleared. So every added item keeps all its k bits set, which is why a "no" is always right.

## Visual

```text
m = 24 bits, k = 3, after add("cat") and add("dog")

index: 0         1         2
       012345678901234567890123
bits:  001000010000000101001000
         ^     ^       ^ ^  ^
         2     7      15 17 20
cat -> 20, 7, 2     dog -> 17, 7, 15      (bit 7 is shared)

query "owl" -> 21, 1, 2   bit 21 is 0   -> definitely not
query "aoo" -> 17, 2, 20  all are 1     -> maybe (false positive)
```

## Operations

| Operation | Description | Time |
|-----------|-------------|------|
| `BloomFilter(capacity, error_rate)` | choose `m` and `k` from `n` and `p` | O(m) |
| `add(item)` | set k bits | O(k) |
| `contains(item)` | all k bits set? stops at the first 0 | O(k) |

There is no delete and no way to list the items.

Sizing for `n` items at false positive rate `p`:

```text
m = ceil( -n * ln(p) / (ln 2)^2 )      about 9.6 n bits for p = 1%
k = max(1, round( (m / n) * ln 2 ))    7 for p = 1%
```

Invalid sizes are rejected: capacity 0 or less, or an error rate outside (0, 1), raises `ValueError` (Python), throws `std::invalid_argument` (C++) or panics (Go).

## Step-by-Step Trace

The tiny filter above (`BloomFilter(5, 0.1)` gives m = 24, k = 3 in all three languages' formula):

| Step | Positions | Effect |
|------|-----------|--------|
| `add("cat")` | 20, 7, 2 | three bits set |
| `add("dog")` | 17, 7, 15 | bits 17 and 15 set, bit 7 already set |
| `contains("cat")` | 20, 7, 2 | all set: maybe (true) |
| `contains("owl")` | 21, 1, 2 | bit 21 is 0: definitely not |
| `contains("aoo")` | 17, 2, 20 | all set: maybe (false positive) |

The positions come from the Python implementation (MD5 based); C++ and Go use different hash families, so their positions differ.

## Complexity

| Quantity | Cost |
|----------|------|
| add, contains | O(k), independent of n (plus hashing the item) |
| space | O(m), about 1.44 * log2(1/p) bits per item |
| false positive rate | about `(1 - e^(-k n / m))^k`, near `p` at n items |

Measured on 1000 items at p = 1% (m = 9586, k = 7) with 20000 non-members: Python 1.05%, C++ 0.98%, Go 1.14%. The rate rises above p if more than `capacity` items are added.

## When to Use

- A "no" lets you skip an expensive lookup (disk, network, cache) and an occasional wasted lookup is fine.
- You can bound the number of items in advance.
- Not when you need exact answers, deletion, or the items back. Use a hash set, a counting Bloom filter or a cuckoo filter.

## Bloom Filter vs. Hash Set

| Structure | Space per item | Lookup | Error | Delete |
|-----------|----------------|--------|-------|--------|
| Bloom filter | about 10 bits at 1% | O(k) | false positives | no |
| Hash set | full item plus overhead | O(1) average | none | yes |
| Counting Bloom filter | several times a Bloom filter | O(k) | false positives | yes |

## Common Pitfalls

- Treating "yes" as certain.
- Truncating `m` and `k`: `int(...)` made `k = 0` for tiny filters, so `contains` was always true. Round `m` up and keep `k >= 1`.
- Correlated hashes: the Go version once hashed `item + index byte` with one 32-bit FNV, which put the k positions on one arithmetic progression and gave 10-19% false positives at a configured 1%. It now uses double hashing `h1 + i * h2`.
- Overfilling past the capacity.
- Expecting to delete.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [`Python/`](Python/) | `bloom_filter.py` | MD5-based hashes, `bytearray` bits, `get_stats`, `in` |
| C++ | [`C++/`](C++/) | `bloom_filter.cpp` | `std::vector<bool>`, two `std::hash` calls per index |
| Go | [`Go/`](Go/) | `main.go` | FNV-1a plus a mixer, double hashing, `[]bool` |

## Practice Problems

- Exercise: design a spell checker or URL-seen filter with a Bloom filter in front of an exact set.

## Related

- [Hash Set](../Hash_Set/README.md)
- [Hash Table](../Hash_Table/README.md)
- [Collision Handling](../Collision_Handling/README.md)
- [Hashing overview](../README.md)
