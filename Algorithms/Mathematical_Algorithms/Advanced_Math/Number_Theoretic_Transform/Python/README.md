# Number Theoretic Transform -- Python Implementation

The iterative, in-place NTT modulo 998244353, its inverse, and polynomial multiplication and convolution exact modulo that prime. See the [topic README](../README.md) for the idea, how the stages map to the FFT's recursion, a trace and the comparison with the FFT.

## Files

| File | Contents |
|------|----------|
| `number_theoretic_transform.py` | the constants `MOD`, `PRIMITIVE_ROOT` and `MAX_LENGTH`; `root_of_unity`, `bit_reverse_permute`, `ntt_in_place`, `ntt`, `intt`, `multiply_polynomials`, `convolve`; the module-level helper `_butterfly`; a demo `main()` |
| `number_theoretic_transform_test.py` | 40 `unittest` tests: the prime, its primitive root and the 24 roots of unity; the bit-reversal order against the FFT's recursive split; every transform up to length 64 against the direct sum; round trips up to 2^12; the products against schoolbook multiplication modulo p on 720 random pairs and on a 700 x 900 product; empty, constant, zero, non-power-of-two and `MOD - 1` inputs; the length limit; a count of the butterflies and of the roots computed; the products against the Fast Fourier Transform topic's code; the values the C++ and Go tests pin |

## API

| Call | Result | Time |
|------|--------|------|
| `MOD`, `PRIMITIVE_ROOT`, `MAX_LENGTH` | 998244353, 3 and 2^23 | |
| `root_of_unity(n, inverse=False)` | `3^((MOD - 1) / n) mod MOD`, a primitive n-th root of unity, or its inverse; `ValueError` unless n is a power of two from 1 to 2^23 | O(log MOD) |
| `bit_reverse_permute(a)` | swaps `a[i]` and `a[rev(i)]` in place; `len(a)` a power of two or 0 | O(n) |
| `ntt_in_place(a, inverse=False)` | transforms the list of residues `a` in place and returns the number of butterflies, `(n / 2) * log2(n)`; `ValueError` unless `len(a)` is a power of two from 1 to 2^23 | O(n log n) |
| `ntt(a, inverse=False)` | a new list of residues: the entries reduced modulo `MOD`, a forward transform padded to a power of two; `[]` for `[]`; `ValueError` for an inverse of another length or more than 2^23 values; `TypeError` for a float | O(n log n) |
| `intt(a)` | `ntt(a, inverse=True)` | O(n log n) |
| `multiply_polynomials(p, q)` | the `len(p) + len(q) - 1` coefficients of the product modulo `MOD` (none when that is below 1); `ValueError` above 2^23 coefficients | O(n log n) |
| `convolve(a, b)` | the same as `multiply_polynomials` | O(n log n) |

```python
root_of_unity(4)                            # 911660635, and 911660635**2 % MOD == MOD - 1
ntt([1, 2, 3, 4])                           # [10, 173167434, 998244351, 825076915]
intt([10, 173167434, 998244351, 825076915]) # [1, 2, 3, 4]
multiply_polynomials([1, 2, 3], [4, 5])     # [4, 13, 22, 15]
multiply_polynomials([1, -1], [1, 1])       # [1, 0, 998244352]: -1 comes out as MOD - 1
```

## Python-Specific Notes

- Integers never overflow, so every product is exact; `% MOD` after each step keeps the numbers below 2^30 anyway, as C++ and Go need.
- The inputs go through `operator.index` before the reduction, so a float raises `TypeError` instead of giving a float "residue"; negative integers and integers above `MOD` are reduced.
- `pow(x, MOD - 2, MOD)` gives every inverse (the inverse root and `n^-1`), by Fermat's little theorem.
- `_butterfly(a, i, j, w)` (one call per butterfly) and `root_of_unity` are module-level functions, so the tests replace them with counting wrappers: exactly `(n / 2) * log2(n)` butterflies and one root per stage.
- The test file imports the Fast Fourier Transform topic's Python module by its path, `../../Fast_Fourier_Transform/Python/fast_fourier_transform.py`, to compare the two products.
- Speed: two polynomials of 2^17 coefficients (n = 2^18) take about 4 s, so Python suits lengths up to about 10^5.

## How to Run

```bash
cd "Algorithms/Mathematical_Algorithms/Advanced_Math/Number_Theoretic_Transform/Python"
python3 -m unittest number_theoretic_transform_test
python3 number_theoretic_transform.py
```

## Key Takeaways

- The FFT's butterflies work in any field that has the roots of unity: modulo 998244353 they exist for every power of two up to 2^23.
- Bit reversal first, then stages of length 2, 4, ..., n: the recursion's combining loops without the recursion.
- The result is exact modulo p; above p it is the residue, not the integer.
