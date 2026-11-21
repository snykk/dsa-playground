# Bit Manipulation

Bit manipulation works directly on the binary digits of an integer. A few identities (`n & (n - 1)`, `x ^ x = 0`) replace loops and extra memory, and a bitmask lets one integer represent a subset. Single operations are O(1); counting set bits is O(k) in the number of set bits.

## Intuition

An integer is a row of switches: bit i has value 2^i. AND keeps or clears switches, OR turns them on, XOR flips them, and a shift moves the whole row. Because all bits are processed in parallel by the CPU, a word-sized set costs one operation instead of a loop.

The key invariant: `n & (n - 1)` removes exactly the lowest set bit. Subtracting 1 turns the lowest 1 into 0 and the zeros below it into 1s, so AND-ing with `n` clears that one bit and leaves the rest.

Signals in a problem statement: "every element appears twice except one" (XOR cancels pairs), "power of two", "count the 1 bits", Hamming distance, and "try every subset of at most about 20 items".

## Visual

```text
n          = 1101   (13)
n - 1      = 1100   (12)
n & (n-1)  = 1100   lowest set bit cleared

-n         = ...0011  (two's complement: invert, add 1)
n & -n     = 0001   isolates the lowest set bit

mask 1 << 2 = 0100
n | mask    = 1101   set bit 2 (already set)
n & ~mask   = 1001   clear bit 2
n ^ mask    = 1001   toggle bit 2
```

## Operations

| Goal | Expression | Time |
|------|------------|------|
| Get bit i | `(n >> i) & 1` | O(1) |
| Set bit i | `n \| (1 << i)` | O(1) |
| Clear bit i | `n & ~(1 << i)` | O(1) |
| Toggle bit i | `n ^ (1 << i)` | O(1) |
| Lowest set bit | `n & -n` | O(1) |
| Clear lowest set bit | `n & (n - 1)` | O(1) |
| Power of two | `n > 0 and (n & (n - 1)) == 0` | O(1) |
| Even | `(n & 1) == 0` | O(1) |
| Count set bits (Kernighan) | repeat `n &= n - 1` | O(k) |
| Hamming distance | popcount of `a ^ b` | O(k) |
| Highest set bit, next power of two | shift loop | O(log n) |
| All subsets of n items | masks `0 .. 2^n - 1` | O(n * 2^n) |

XOR rules: `a ^ a = 0`, `a ^ 0 = a`, commutative and associative. XOR-ing a list therefore cancels every value that appears twice.

## Step-by-Step Trace

`count_set_bits(13)`:

| Round | n (binary) | n - 1 | n & (n - 1) | count after |
|-------|------------|-------|-------------|-------------|
| 1 | 1101 | 1100 | 1100 | 1 |
| 2 | 1100 | 1011 | 1000 | 2 |
| 3 | 1000 | 0111 | 0000 | 3 |

n is 0, so the answer is 3. For the Hamming distance of 7 and 10: `0111 ^ 1010 = 1101`, which has 3 set bits.

## Complexity

| Operation | Time | Space |
|-----------|------|-------|
| Single bit operation | O(1) | O(1) |
| Kernighan popcount | O(k), at most 64 rounds for a 64-bit value | O(1) |
| `highest_set_bit`, `next_power_of_two` | O(log n) | O(1) |
| `subset_generation(n)` | O(n * 2^n) | O(n * 2^n) output |

Subset enumeration is n bit tests for each of the 2^n masks, which is why it is practical only up to n of about 20-25.

## When to Use

Use it for flags and small sets that fit in a word, XOR cancellation tricks, parity and power-of-two tests, popcount, and subset enumeration or bitmask DP. Do not use it when clarity matters more than the saving, or when the set is too large for a word; use a hash set or a bit array library instead.

## Bit Manipulation vs. Alternatives

| Need | Bit trick | Alternative |
|------|-----------|-------------|
| Find the unique element | XOR all values, O(n) time, O(1) space | hash map, O(n) space |
| Small set of flags | one integer | boolean array or hash set |
| Count 1 bits | Kernighan or hardware popcount | loop over every bit |
| Swap two values | XOR swap | plain swap (clearer, equally fast) |

## Common Pitfalls

- In C and C++, `n & (n - 1) == 0` parses as `n & ((n - 1) == 0)`. Parenthesize it.
- Leaving out `n > 0` makes 0 look like a power of two.
- Shifting by the type width or more is undefined in C++; use `1LL << i` above bit 30.
- Right shift of a signed negative copies the sign bit; use unsigned types for pure bit work.
- Python integers have infinitely many sign bits, so a `while n:` loop on a negative never ends. Here negatives are masked to 64 bits first, so `count_set_bits(-1)` is 64 in every language.
- The XOR swap fails if both operands are the same variable (the code guards `a == b`).

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python/](Python/) | `bit_manipulation.py` | unbounded ints; negatives masked to 64 bits in popcount |
| C++ | [C++/](C++/) | `bit_manipulation.cpp` | `int64_t`; popcount works on `uint64_t` |
| Go | [Go/](Go/) | `main.go` | exported names, `int64`; popcount wraps naturally |

## Practice Problems

- LeetCode 136, Single Number
- LeetCode 191, Number of 1 Bits
- LeetCode 231, Power of Two
- LeetCode 461, Hamming Distance
- LeetCode 338, Counting Bits
- LeetCode 78, Subsets

## Related

- [Bitmasking](../../Utilities/Optimization_Techniques/Bitmasking/)
- [Inclusion-Exclusion Principle](../Inclusion_Exclusion_Principle/)
- [Fenwick Tree](../../Data_Structures/Non_Linear/Trees/Fenwick_Tree/)
