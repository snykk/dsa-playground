# Number Theoretic Transform -- C++ Implementation

The iterative, in-place NTT modulo 998244353 on `std::vector<long long>`, its inverse, and polynomial multiplication and convolution exact modulo that prime. See the [topic README](../README.md) for the idea, a trace and the comparison with the FFT.

## Files

| File | Contents |
|------|----------|
| `number_theoretic_transform.cpp` | `MOD`, `PRIMITIVE_ROOT`, `MAX_LENGTH`, `mulMod`, `powMod`, `rootOfUnity`, `bitReversePermute`, `nttInPlace`, `ntt`, `intt`, `multiplyPolynomials`, `convolve` and a demo `main()` (compiled out with `-DIS_TEST_BUILD`) |
| `number_theoretic_transform_test.cpp` | assert-based tests: the values the Python code computes (the 24 roots of unity and their inverses, 12 transforms, 40 products) and 12 products of the Fast Fourier Transform topic's Python code; the prime and its primitive root; the bit-reversal order; every transform up to length 64 against the direct sum; round trips; the products against schoolbook multiplication modulo p on 720 random pairs; the edge cases; the butterfly count up to 2^16; the length limit; the largest product, two lists of 2^22 ones |

## API

| Function | Description |
|----------|-------------|
| `MOD`, `PRIMITIVE_ROOT`, `MAX_LENGTH` | `constexpr`: 998244353, 3 and 2^23 |
| `uint64_t mulMod(uint64_t a, uint64_t b)` | `a * b % MOD` for residues; the product is below 2^60 |
| `uint64_t powMod(uint64_t base, uint64_t exp)` | `base^exp % MOD` by square and multiply |
| `uint64_t rootOfUnity(size_t n, bool inverse = false)` | `3^((MOD - 1) / n)` or its inverse; throws `std::invalid_argument` unless n is a power of two from 1 to 2^23 |
| `void bitReversePermute(std::vector<long long>& a)` | the bit-reversal permutation, in place |
| `long long nttInPlace(std::vector<long long>& a, bool inverse = false)` | the transform of a vector of residues, in place; returns the number of butterflies; throws `std::invalid_argument` unless the size is a power of two from 1 to 2^23 |
| `std::vector<long long> ntt(const std::vector<long long>& a, bool inverse = false)` | a new vector of residues 0..MOD-1: reduced (negative values allowed), padded for a forward transform; empty for empty; throws `std::invalid_argument` for an inverse of another length or more than 2^23 values |
| `std::vector<long long> intt(const std::vector<long long>& a)` | `ntt(a, true)` |
| `std::vector<long long> multiplyPolynomials(const std::vector<long long>& p, const std::vector<long long>& q)` | the product modulo MOD, `p.size() + q.size() - 1` coefficients (none when that is below 1); throws `std::invalid_argument` above 2^23 coefficients |
| `std::vector<long long> convolve(const std::vector<long long>& a, const std::vector<long long>& b)` | the same as `multiplyPolynomials` |

## C++-Specific Notes

- **64-bit products are enough.** Residues are below 2^30, so `mulMod` multiplies in `uint64_t` (below 2^60) and `(MOD - 1)^2 = 996491786299899904` is the largest product; a `static_assert` checks that it fits. No `unsigned __int128` is needed for this modulus, unlike the 64-bit moduli of Euler's Totient.
- **Signed in, residues out.** The public functions take and return `long long`, like the FFT topic's `multiplyPolynomials` result; inputs are reduced with `x % MOD`, plus `MOD` when that is negative. `nttInPlace` trusts its entries to be residues already.
- **The subtraction** is written `(u + MOD - t) % MOD`, so no intermediate value is negative in unsigned arithmetic.
- **Speed.** The largest product, two lists of 2^22 values (n = 2^23), takes about 1.7 s at `-O2`; the whole test runs in about 2 s, and in about the same under AddressSanitizer and UndefinedBehaviorSanitizer.
- Unlike the FFT topic's C++ file, which divides by 2 at each level of the recursion, the inverse here multiplies by `n^(MOD - 2)` once at the end.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD number_theoretic_transform_test.cpp -o test && ./test
g++ -std=c++17 -O2 number_theoretic_transform.cpp -o demo && ./demo
```

## Key Takeaways

- Choose the integer width from the modulus: below 2^32, 64-bit products suffice.
- Return the work count from the in-place core, so tests can check `(n / 2) * log2(n)`.
- Pin outputs from the reference implementation to keep the languages in step.
