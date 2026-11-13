# Matrix Exponentiation -- C++ Implementation

Matrix multiplication, identity, recursive and iterative matrix power, and Fibonacci by matrix power on `long long` entries.

For the concept, see the topic README: [../README.md](../README.md).

## Files

| File | Purpose |
|------|---------|
| `matrix_exponentiation.cpp` | the functions below (included by the test; no `main`) |
| `matrix_exponentiation_test.cpp` | 14 tests: exact small powers, modulus, negative entries, a modulus above 2^32, negative exponents, modulus 0 and 1, the Fibonacci overflow guard |

## API

- `typedef std::vector<std::vector<long long>> Matrix`.
- `Matrix matrixMultiply(const Matrix& A, const Matrix& B, long long mod = -1)`.
- `Matrix matrixIdentity(int n, long long mod = -1)`.
- `Matrix matrixPower(const Matrix& A, long long k, long long mod = -1)`: recursive; throws `std::invalid_argument` if `k < 0`.
- `Matrix matrixPowerIterative(const Matrix& A, long long k, long long mod = -1)`: iterative; same checks.
- `long long fibonacciMatrix(long long n, long long mod = -1)`: throws `std::invalid_argument` for `n < 0` and `std::overflow_error` for `n > 92` without a modulus.

## C++-Specific Notes

- A modulus is applied when `mod > 0`; `-1` (the default), 0 and negative values mean no modulus.
- With a modulus, entries are normalised into `[0, mod)` and products are accumulated in `__int128` (a GCC/Clang extension), so any modulus up to 2^63 - 1 is exact.
- Without a modulus the arithmetic is plain `long long`; overflow in `matrixPower` is not detected.
- `matrixPower` is recursive; the depth is about `2 log k`.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD matrix_exponentiation_test.cpp -o matrix_test
./matrix_test
```

## Key Takeaways

1. A 64-bit modular product needs a 128-bit intermediate once the modulus passes about 3e9.
2. C++ `%` keeps the sign of the dividend: normalise negative entries explicitly.
3. Reject impossible inputs (negative exponents, `F(93)` without a modulus) instead of returning garbage.
