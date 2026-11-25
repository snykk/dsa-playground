# Number Theoretic Transform (NTT)

The Number Theoretic Transform is the [Fast Fourier Transform](../Fast_Fourier_Transform/) computed with the integers modulo a prime instead of complex numbers. Here the prime is `p = 998244353 = 119 * 2^23 + 1`, with the primitive root 3. It multiplies two polynomials, or convolves two sequences, in O(n log n) like the FFT, but every step is an exact integer operation, so each coefficient of the product comes out exact modulo p: nothing is rounded. The API follows the FFT topic's: `ntt`, `intt`, `multiply_polynomials` and `convolve`.

## Intuition

The FFT needs only a few facts about its root of unity `w = e^(-2*pi*i/n)`: `w^n = 1`, `w^(n/2) = -1`, the powers `w^0 .. w^(n-1)` are all different, and `w^2` is the same kind of root for `n/2`. Then `A(x) = E(x^2) + x * O(x^2)` splits one transform of size n into two of size n/2, and the butterflies

```text
X[k]       = E[k] + w^k * O[k]
X[k + n/2] = E[k] - w^k * O[k]
```

put them back together. Nothing in that argument needs complex numbers. Modulo a prime p, the nonzero residues form a cyclic group of order `p - 1`: one element, a primitive root `g`, has every nonzero residue among its powers. For p = 998244353 that is `g = 3`, and `p - 1 = 2^23 * 7 * 17`. So for every power of two n up to 2^23, `w = 3^((p - 1) / n)` has exactly the facts above: `w^n = 3^(p - 1) = 1` (Fermat), no smaller power is 1 because 3 is a primitive root, so `w^(n/2)` is the other square root of 1, which is `-1`. The same butterflies, with every product and sum taken modulo p, compute

```text
X[k] = sum_{j=0..n-1} a[j] * w^(j*k)  (mod p)
```

and the inverse uses `w^-1` and divides by n, that is, multiplies by `n^(p - 2)`, the inverse of n modulo p.

| | FFT | NTT |
|---|-----|-----|
| numbers | complex doubles | integers 0 .. p - 1 |
| root of unity for n = 4 | `w = -i` | `w = 911660635` (`w^2 = p - 1`, that is `-1`) |
| largest power-of-two length | any | 2^23 = 8,388,608 |
| inverse | `w^-1`, divide by n | `w^-1`, multiply by `n^(p - 2)` |
| result of a product | rounded, exact only for small enough coefficients | exact modulo p |

The invariant of the iterative version: after the stage of length L, every block of L entries holds the transform of the L input values that the FFT's recursion would have sent to that block's call.

## Visual

`ntt([1, 2, 3, 4])`, with `w = 3^((p - 1) / 4) = 911660635`:

```text
p = 998244353, w = 3^((p - 1) / 4) = 911660635, w^2 = p - 1 = -1

bit-reversed    stage length 2: pairs (0,1), (2,3)    stage length 4: pairs (0,2), (1,3)
a[0] = 1        a[0] = 1 + 1*3 = 4                    a[0] = 4 + 1*6          = 10
a[1] = 3        a[1] = 1 - 1*3 = p - 2                a[1] = (p-2) + w*(p-2)  = 173167434
a[2] = 2        a[2] = 2 + 1*4 = 6                    a[2] = 4 - 1*6          = p - 2 = 998244351
a[3] = 4        a[3] = 2 - 1*4 = p - 2                a[3] = (p-2) - w*(p-2)  = 825076915
```

The FFT of the same input is `[10, -2+2i, -2, -2-2i]`. Its `X[1] = -2 - 2w` with `w = -i`; the NTT's is `-2 - 2w` with `w = 911660635`, which is `173167434` modulo p. Only the root changed.

## How It Works

### The prime and its roots (`root_of_unity`)

`p = 998244353 = 119 * 2^23 + 1` is prime, and 3 is a primitive root: none of `3^((p - 1) / 2)`, `3^((p - 1) / 7)`, `3^((p - 1) / 17)` is 1. `root_of_unity(n)` returns `3^((p - 1) / n) mod p` for n a power of two from 1 to 2^23, and with `inverse=True` its inverse `w^(p - 2)`. Squaring the root of `2n` gives the root of `n`, the FFT's "the squares of the n-th roots are the n/2-th roots". The tests check, for every n from 1 to 2^23, that `w^n = 1` and `w^(n/2) = p - 1`.

### The iterative transform (`ntt_in_place`)

1. Check that the length n is a power of two from 1 to 2^23 (`ValueError` otherwise).
2. `bit_reverse_permute(a)`: swap `a[i]` and `a[rev(i)]`, where `rev(i)` reverses the `log2(n)` bits of i. For n = 8 the order becomes 0, 4, 2, 6, 1, 5, 3, 7.
3. For `length = 2, 4, ..., n`: `w_length = root_of_unity(length)` (the inverse root for the inverse). For every block start `0, length, 2*length, ...`: start with `w = 1`, and for `k = 0 .. length/2 - 1` do one butterfly on positions `start + k` and `start + k + length/2`: `t = w * a[j]`, `a[i], a[j] = a[i] + t, a[i] - t`, all modulo p; then `w = w * w_length`.
4. For the inverse, multiply every entry by `n^(p - 2) mod p`.
5. Return the number of butterflies, `(n / 2) * log2(n)`.

### How it maps to the FFT's recursion

The FFT topic's code is recursive: it splits into even and odd positions until single values are left, then combines on the way back up. This code does the same work without recursion:

- **The leaves.** Read left to right, the single values the recursion reaches are the input in bit-reversed order (for n = 8: positions 0, 4, 2, 6, 1, 5, 3, 7). The tests compare `bit_reverse_permute` with that recursive split for every n up to 1024. So step 2 puts every value where the recursion would deliver it.
- **The levels.** The stage of length L does the combining loops of all the recursive calls of size L, in place. Its block at `start` is one call: `E[k]` is `a[start + k]`, `O[k]` is `a[start + k + L/2]`, and `w_length^k` is the FFT's `e^(-2*pi*i*k/L)`.
- **No copies.** Each butterfly reads two entries and writes the same two, so the whole transform runs in the input list. The recursion builds new lists at every level.

### `ntt`, `intt`, `multiply_polynomials`

- `ntt(a, inverse=False)` copies a, reduces every entry modulo p (so negative integers work; a float raises `TypeError`), pads a forward transform with zeros to the next power of two, and transforms the copy. An empty list returns `[]`. The inverse needs a power-of-two length, exactly as the FFT's: padding a spectrum does not give the spectrum of anything shorter.
- `intt(a)` is `ntt(a, inverse=True)`, so `intt(ntt(a)) == [x % p for x in a]` for a power-of-two length.
- `multiply_polynomials(p, q)`: n is the smallest power of two at least `len(p) + len(q) - 1`; pad both, transform both, multiply point by point modulo p, transform back, and keep the first `len(p) + len(q) - 1` values. An empty list is the zero polynomial: the result has `len(p) + len(q) - 1` zeros (none when that is below 1), the same lengths the FFT topic returns. `convolve` is the same function.

### Results above p, and the length limit

- **Reduced modulo p.** The result is the true coefficient modulo p. It equals the true coefficient when that lies in `0 .. p - 1`; a larger one comes out reduced (`10^9 * 10^9` gives `716070898`), and a negative one as p minus its absolute value (`(1 - x)(1 + x)` gives `[1, 0, 998244352]`). For exact coefficients above p, run the NTT modulo three such primes (998244353, 167772161 and 469762049 are the usual ones) and combine the residues with the Chinese Remainder Theorem: that covers every coefficient below their product, about 2^86. This repository does not implement that.
- **At most 2^23 coefficients.** 2^23 is the largest power of two dividing `p - 1`, so no longer transform exists modulo p. `ntt` refuses more than 2^23 values and `multiply_polynomials` a product with more than 2^23 coefficients (two lists of 2^22 + 1 values, for example).

### Errors

| Input | Python | C++ | Go |
|-------|--------|-----|----|
| an inverse of a length that is not a power of two | `ValueError` | `std::invalid_argument` | an error wrapping `ErrNotPowerOfTwo` |
| more than 2^23 values, or a product with more than 2^23 coefficients | `ValueError` | `std::invalid_argument` | an error wrapping `ErrTooLong` |
| `root_of_unity(n)` with n not a power of two from 1 to 2^23 | `ValueError` | `std::invalid_argument` | `ErrNotPowerOfTwo`, or `ErrTooLong` above 2^23 |
| a float in the input | `TypeError` | (the type is `long long`) | (the type is `int`) |

### 64-bit products are enough

Residues are below p < 2^30, so the product of two of them is below 2^60: C++ (`uint64_t`) and Go (`uint64`) multiply them without overflow, and the largest one, `(p - 1)^2 = 996491786299899904`, is below 2^63. No 128-bit arithmetic is needed for this modulus; a modulus above 2^32 would need it. The tests multiply 1000 coefficients of `p - 1` by 1000 more and check every coefficient of the result.

## Step-by-Step Trace

`multiply_polynomials([1, 2, 3], [4, 5])`, the same product as the FFT topic's trace, with n = 4 (values from the Python code; the FFT column is the FFT topic's):

| Stage | NTT (mod p) | FFT |
|-------|-------------|-----|
| transform of `[1, 2, 3, 0]` | `[6, 825076915, 2, 173167434]` | `[6, -2-2i, 2, -2+2i]` |
| transform of `[4, 5, 0, 0]` | `[9, 565325767, 998244352, 432918594]` | `[9, 4-5i, -1, 4+5i]` |
| pointwise product | `[54, 173167418, 998244351, 825076899]` | `[54, -18+2i, -2, -18-2i]` |
| inverse stages, before dividing by n | `[16, 52, 88, 60]` | |
| times `4^(p - 2) = 748683265` | `[4, 13, 22, 15]` | `[4, 13, 22, 15]` after rounding |

`998244352` is `-1` and `998244351` is `-2`: where the FFT has a real number, the NTT has the same number modulo p. The other entries correspond through `w = 911660635` standing for `-i`. The product is `4 + 13x + 22x^2 + 15x^3`, with no rounding step.

The butterflies of the first transform, after the bit reversal `[1, 3, 2, 0]`:

| Stage | Block | k | w | Reads | t = w * second | Writes |
|-------|-------|---|---|-------|----------------|--------|
| length 2 | 0 | 0 | 1 | 1, 3 | 3 | 4, 998244351 |
| length 2 | 2 | 0 | 1 | 2, 0 | 0 | 2, 2 |
| length 4 | 0 | 0 | 1 | 4, 2 | 2 | 6, 2 |
| length 4 | 0 | 1 | 911660635 | 998244351, 2 | 825076917 | 825076915, 173167434 |

Four butterflies, `(4 / 2) * log2(4)`.

## Complexity

| Operation | Time | Space |
|-----------|------|-------|
| `ntt` / `intt`, `ntt_in_place` | O(n log n): `(n / 2) * log2(n)` butterflies | O(n) for the copy; `ntt_in_place` O(1) extra |
| `multiply_polynomials` | O(n log n): three transforms and n pointwise products | O(n) |
| `root_of_unity` | O(log p) multiplications | O(1) |
| direct transform or schoolbook product | O(n^2) | O(n) |

Counted with the Python code (the tests wrap `_butterfly` and `root_of_unity`): every transform of length n = 2^k does exactly `(n / 2) * k` butterflies, for every k from 0 to 12, forward and inverse; 1024 values take 5,120 butterflies and 4096 take 24,576; each stage touches every index once; `root_of_unity` is called once per stage, k times; and a product does exactly three transforms. The C++ and Go tests check the returned count for every n up to 2^16.

Measured on the machine the repository's numbers come from: Python multiplies two polynomials of 2^17 coefficients (n = 2^18) in about 4 s; C++ (`-O2`) and Go multiply two of 2^22, the largest product (n = 2^23), in about 1.7 s and 1.8 s.

### Exact where the FFT rounds

The FFT topic computes in doubles and rounds at the end, so its product is right only while the rounding errors stay below 1/2. Measured with its Python code: two polynomials of the same length with random coefficients from 0 to c, five seeds per c, and the smallest c (to within 0.5%) at which one of the five products had a wrong coefficient:

| Length of each (n) | First wrong at c | Largest true coefficient in that run |
|--------------------|------------------|--------------------------------------|
| 2 (4) | about 1.34e8 | 1.5e16, above 2^53 = 9.0e15, where odd integers are no longer doubles |
| 4 (8) | about 5.3e7 | 3.4e15 |
| 16 (32) | about 2.3e7 | 2.9e15 |
| 64 (128) | about 8.7e6 | 1.4e15 |
| 256 (512) | about 4.2e6 | 1.3e15 |
| 1024 (2048) | about 2.0e6 | 1.0e15 |
| 4096 (8192) | about 8.8e5 | 8.1e14 |

So:

- **Every coefficient below p.** Both are right. In every run, a product whose coefficients stayed below p was exact in the FFT too: at these lengths the FFT's first errors came near 10^15, about a million times p. The Python tests compare the two on 400 random products, and the C++ and Go tests on 12 products pinned from the FFT's Python code.
- **Coefficients between p and about 10^15.** The FFT gives the integers; the NTT gives them modulo p, which is what a problem that asks for the answer modulo 998244353 wants anyway.
- **Larger coefficients.** The FFT's rounded integers are wrong, and so are their residues; the NTT still gives the exact residue. `(p - 2) * (p - 2) = 996491784303411201` is odd and above 2^53, so no double holds it: the FFT returns `996491784303411200`, which is 3 modulo p, and the NTT returns 4, the true value modulo p. Below 2^53 the FFT goes wrong too once n grows: 4096 coefficients up to 2,000,000 on each side (the test's seed) give true coefficients of at most 4.1e15, under half of 2^53, and the FFT got 4,038 of the 8,191 wrong, by up to 2; the NTT got all of them right modulo p. A three-coefficient example: `[73000000, 11000000, 53000000] * [37000000, 55000000, 53000000]` has true coefficients `[2701, 4422, 6435, 3498, 2809] * 10^12`, all below 2^53, and the FFT returned `4422000000000001` for the second one; the exact last digits of such an error depend on the platform's sine and cosine.

## When to Use

- Convolutions and polynomial products whose answer is wanted modulo 998244353: counting problems, generating functions, combinatorics. This is the common case in contests.
- Exact products of non-negative integer polynomials whose coefficients stay below p, such as counts of pairs in sequences of up to a few hundred thousand values.
- Products where the FFT's rounding is not safe and the answer modulo a prime is enough.
- Not for exact coefficients above p: they come out reduced. Use the FFT while they stay below about 10^14, or three primes and the CRT, or big-integer arithmetic.
- Not for more than 2^23 coefficients with this prime.
- Not for real or complex data, or for spectra: the NTT's "frequencies" are residues with no physical meaning.
- Not for short inputs: below about 100 coefficients per polynomial the schoolbook product was faster, in Python and in C++ alike.

## NTT vs. Alternatives

| Method | Time | Exact | Good for |
|--------|------|-------|----------|
| NTT modulo 998244353 (here) | O(n log n) | Yes, modulo p | answers modulo p; lengths up to 2^23 |
| FFT with doubles | O(n log n) | No: rounding, about 10^15 at most | real data, moderate integer coefficients |
| Three NTT primes + CRT | 3 x O(n log n) | Yes, below about 2^86 | exact large coefficients, other moduli such as 10^9 + 7 |
| Schoolbook | O(n^2) | Yes | short inputs |
| Karatsuba | O(n^1.585) | Yes | medium sizes, any ring |

## Common Pitfalls

1. **A prime without enough powers of two.** The length must divide `p - 1`. 10^9 + 7 has `p - 1 = 2 * 500000003`, so it only allows length 2; that is why counting problems use 998244353.
2. **Expecting the true coefficient above p.** It is reduced modulo p, silently. Negative coefficients come out as `p - |c|`.
3. **Forgetting `n^-1` after the inverse.** Without it the result is n times too large (`[16, 52, 88, 60]` in the trace).
4. **Using the forward root in the inverse.** The inverse needs `w^-1`; with `w` the output comes back reversed after its first entry: position j holds `a[(n - j) mod n]`.
5. **Overflow in C++ or Go.** Two residues multiply to almost 2^60: a 32-bit `int` overflows, `uint64_t` does not. A modulus above 2^32 would need 128-bit products.
6. **Padding too little.** Like the FFT, the length must hold `len(p) + len(q) - 1` coefficients, or the product wraps around: `[1, 2, 3] * [4, 5, 6]` with n = 4 gives `[22, 13, 28, 27]`, the `18x^4` added to the constant 4.
7. **Skipping the bit reversal.** The stages expect the input in bit-reversed order; without it the output is wrong, not merely reordered.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python/](Python/) | `number_theoretic_transform.py` | `ntt`, `intt`, `ntt_in_place`, `multiply_polynomials`, `convolve`, `root_of_unity`, `bit_reverse_permute`; lists of `int`; the helper `_butterfly` sits at module level so the tests can count the work |
| C++ | [C++/](C++/) | `number_theoretic_transform.cpp` | `ntt`, `intt`, `nttInPlace`, `multiplyPolynomials`, `convolve`, `rootOfUnity`, `bitReversePermute`, `mulMod`, `powMod`; `std::vector<long long>`; `uint64_t` products |
| Go | [Go/](Go/) | `main.go` | `NTT`, `INTT`, `NTTInPlace`, `MultiplyPolynomials`, `Convolve`, `RootOfUnity`, `BitReversePermute`, `MulMod`, `PowMod`; `[]int`; errors instead of exceptions |

The three give the same residues on the same input. The C++ and Go tests pin the 24 roots of unity and their inverses, 12 transforms and 40 products computed by the Python code, and 12 products computed by the FFT topic's Python code; all three languages check every transform against the direct O(n^2) sum for every length up to 64, and the products against schoolbook multiplication modulo p on 720 random pairs with fixed seeds. C++ and Go also run the largest product, two lists of 2^22 ones (n = 2^23).

## Practice Problems

- [Convolution (AtCoder Library Practice F)](https://atcoder.jp/contests/practice2/tasks/practice2_f): the product modulo 998244353 of two sequences of up to 524,288 values.
- [One Bit Positions (CSES 2112)](https://cses.fi/problemset/task/2112): convolve the bit string with its reverse; the counts stay below p, so the residues are the counts.
- [Substring 2 (AtCoder ABC196 F)](https://atcoder.jp/contests/abc196/tasks/abc196_f): count the mismatches of T at every offset of S with two convolutions of bits.
- [Lucky Tickets (Codeforces 1096G)](https://codeforces.com/problemset/problem/1096/G): one transform of the digit polynomial, a pointwise power, one inverse transform, all modulo 998244353.

## Related

- [Fast Fourier Transform](../Fast_Fourier_Transform/): the same butterflies over the complex numbers; read first.
- [Modular Exponentiation](../../Number_Theory/Modular_Exponentiation/): the square and multiply behind the roots and `n^(p - 2)`.
- [Modular Arithmetic](../../Number_Theory/Modular_Arithmetic/): inverses modulo a prime by Fermat's little theorem.
- [Chinese Remainder Theorem](../../Number_Theory/Chinese_Remainder_Theorem/): combining several NTT primes for exact large coefficients.
- [Galois Field GF(2^8)](../../../Coding_Theory/Galois_Field/): another finite field with arithmetic on polynomials.
- [Advanced Mathematical Algorithms](../)
