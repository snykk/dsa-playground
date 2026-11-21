# Chinese Remainder Theorem

The Chinese Remainder Theorem (CRT) solves a system of congruences `x = r_i (mod m_i)` and combines it into one congruence `x = r (mod M)`. When the moduli are pairwise coprime the solution always exists and is unique modulo the product of the moduli. The repository version merges the congruences one at a time, so it also handles moduli that are not coprime. It runs in about `O(n log max(m))` time for `n` congruences.

## Intuition

Knowing `x mod 3` and `x mod 5` tells you `x mod 15`: the pair of remainders is a "fingerprint" that is different for every `x` in `0..14`. Each congruence throws away some information about `x`; when the moduli share no factor, the pieces of information are independent, so together they pin `x` down modulo the product.

The merge step is the invariant: after processing the first `k` congruences, `x` is the smallest non-negative solution of all of them, and it is known modulo `L = lcm(m_1..m_k)`. Adding the next congruence only has to find the right multiple of `L` to add.

## Visual

Every `x` in `0..14` appears exactly once in the table of its two remainders. The system `x = 1 (mod 3)`, `x = 2 (mod 5)` is the cell in row 1, column 2:

```text
              x mod 5
            0    1    2    3    4
         +----+----+----+----+----+
x mod 3=0|  0 |  6 | 12 |  3 |  9 |
         +----+----+----+----+----+
x mod 3=1| 10 |  1 | [7]| 13 |  4 |
         +----+----+----+----+----+
x mod 3=2|  5 | 11 |  2 |  8 | 14 |
         +----+----+----+----+----+
```

## How It Works

To merge `x = r1 (mod m1)` with `x = r2 (mod m2)`:

1. Run extended Euclid: `m1*p + m2*q = g` where `g = gcd(m1, m2)`.
2. If `(r2 - r1) mod g != 0` the two congruences contradict each other: no solution.
3. Otherwise `t = ((r2 - r1) / g * p) mod (m2 / g)` and `x = r1 + m1 * t`.
4. The merged modulus is `lcm(m1, m2) = m1 / g * m2`.

`chinese_remainder_theorem` starts from `x = 0 (mod 1)` and merges each congruence in turn, after reducing every remainder into `0..m-1`. The classical closed form for coprime moduli is `x = sum(r_i * M_i * inv(M_i, m_i)) mod M` with `M_i = M / m_i`; it gives the same answer but needs the full product `M` at once.

## Step-by-Step Trace

`x = 2 (mod 3)`, `x = 3 (mod 5)`, `x = 2 (mod 7)`:

| Step | Merge | `p` from ext. gcd | `t` | `x` | modulus |
|------|-------|-------------------|-----|-----|---------|
| 0 | start | | | 0 | 1 |
| 1 | `x = 2 (mod 3)` | | | 2 | 3 |
| 2 | `x = 3 (mod 5)` | `3*2 + 5*(-1) = 1`, p = 2 | `(1*2) mod 5 = 2` | `2 + 3*2 = 8` | 15 |
| 3 | `x = 2 (mod 7)` | `15*1 + 7*(-2) = 1`, p = 1 | `(-6*1) mod 7 = 1` | `8 + 15*1 = 23` | 105 |

The answer is 23, unique modulo 105. For a non-coprime system, `x = 1 (mod 4)` and `x = 3 (mod 6)`: `g = 2`, `p = -1`, `(3 - 1) mod 2 = 0` so it is solvable, `t = (1 * -1) mod 3 = 2`, `x = 1 + 4*2 = 9` modulo 12. The system `x = 1 (mod 4)`, `x = 2 (mod 6)` has `(2 - 1) mod 2 = 1`, so it has no solution.

## Complexity

- Time: each merge runs one extended Euclid on `(L, m_i)`, which costs `O(log m_i)` because the first step reduces `L` modulo `m_i`. In total `O(n + log M)`, which is within `O(n log max(m))`.
- Space: `O(1)` besides the input.
- The Python version uses big integers, so the lcm can be any size. C++ and Go keep every residue product in 128 bits and return `-1` if the combined modulus does not fit in a signed 64-bit integer (above `2^63 - 1`).

## When to Use

- Reconstructing a number from its residues modulo several small coprime moduli (for example the results of several modular computations).
- Splitting a large modulus into prime-power or coprime pieces, solving each piece, then recombining.
- Scheduling problems: "the next day when event A (every 3 days) and event B (every 5 days) coincide".
- Not needed for a single congruence, or when you can simply iterate (when `M` is tiny).

## CRT vs. Alternatives

| Approach | Idea | Notes |
|----------|------|-------|
| Brute force | try `x = r1, r1 + m1, ...` until all hold | up to `M / m1` tries; fine only for tiny `M` |
| Closed form `sum(r_i M_i inv_i)` | one inverse per modulus | needs coprime moduli and the whole product `M` (overflows 64 bits quickly) |
| Incremental merge (this code) | extended Euclid per congruence | works for non-coprime moduli too; intermediate values stay below `lcm` |
| Garner's algorithm | mixed-radix digits | avoids big products; useful with many moduli |

## Common Pitfalls

- Assuming coprime moduli. Without coprimality a system may still be solvable (`x = 1 mod 4`, `x = 3 mod 6`), or not (`x = 1 mod 4`, `x = 2 mod 6`).
- Forgetting to normalize a negative or large remainder: `-1 (mod 7)` is `6`, and `8 (mod 3)` is `2`.
- Overflow: the product `M` and the products `r * M_i * inv` exceed 64 bits quickly. This code multiplies in 128 bits and merges incrementally.
- Confusing the sentinel: C++ and Go return `-1` for "no solution"; Python returns `None`. A valid answer is never negative.
- Using an extended gcd that drops the signs of its inputs (`a*x + b*y` must equal `gcd(a, b)` for any signs).

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python](Python/) | `chinese_remainder_theorem.py` | big integers, returns `None` when unsolvable |
| C++ | [C++](C++/) | `chinese_remainder_theorem.cpp` | `__int128` products, returns `-1` |
| Go | [Go](Go/) | `main.go` | `math/bits` products, returns `-1` |

## Practice Problems

- [CRT on cp-algorithms](https://cp-algorithms.com/algebra/chinese-remainder-theorem.html): theory and the Garner algorithm.
- [Chinese remainder theorem (Wikipedia)](https://en.wikipedia.org/wiki/Chinese_remainder_theorem): statement, proof and applications.
- Exercise: solve `x = 3 (mod 4)`, `x = 4 (mod 5)`, `x = 5 (mod 7)` by hand, then check with `verify_crt_solution`.
- Exercise: decide whether `x = 5 (mod 12)` and `x = 7 (mod 18)` is solvable (look at `gcd(12, 18) = 6`).

## Related

- [Euclidean Algorithm](../Euclidean_Algorithm/README.md)
- [Modular Arithmetic](../Modular_Arithmetic/README.md)
- [Modular Exponentiation](../Modular_Exponentiation/README.md)
