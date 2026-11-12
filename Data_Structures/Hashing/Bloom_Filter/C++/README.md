# Bloom Filter -- C++ Implementation

A Bloom filter over strings. See the [topic README](../README.md).

## Files

- `bloom_filter.cpp`: the `BloomFilter` class (included directly by the test).
- `bloom_filter_test.cpp`: assert-based tests for add/contains, sizing, invalid arguments, tiny filters and the measured false positive rate.

## API

| Member | Description | Time |
|--------|-------------|------|
| `BloomFilter(size_t capacity, double error_rate = 0.01)` | throws `std::invalid_argument` if capacity is 0 or error_rate not in (0, 1) | O(m) |
| `void add(const std::string&)` | set k bits | O(k) |
| `bool contains(const std::string&) const` | maybe present or definitely not | O(k) |
| `numBits()`, `numHashes()` | the chosen `m` and `k` | O(1) |

## C++-Specific Notes

- Position i is `(h(item) + i * h(item + to_string(i))) mod m` with `std::hash<std::string>`. That is two string hashes (and one string allocation) per index, so it is not the cheap Kirsch-Mitzenmacher scheme of computing two hashes once.
- `std::hash` is implementation-defined, so exact bit positions differ between libstdc++ and libc++. The tests therefore check a rate, not specific positions.
- Bits are a `std::vector<bool>`, which is bit-packed.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD bloom_filter_test.cpp -o bloom_filter_test && ./bloom_filter_test
```

## Key Takeaways

- Round `m` up and keep `k >= 1`.
- Test the false positive rate, not one specific miss.
- `std::vector<bool>` gives the space saving for free.
