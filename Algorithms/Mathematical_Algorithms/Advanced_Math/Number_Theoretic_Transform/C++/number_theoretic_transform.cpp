/**
 * Number Theoretic Transform (NTT) (C++)
 *
 * The Fast Fourier Transform's butterflies over the integers modulo the prime
 * p = 998244353 = 119 * 2^23 + 1 instead of complex numbers. 3 is a primitive root modulo p, so
 * for every power of two n up to 2^23, w = 3^((p - 1) / n) is a primitive n-th root of unity:
 * w^n = 1 and w^(n/2) = -1, the properties the FFT uses of e^(-2*pi*i/n). Every step is an exact
 * integer operation, so a product comes out exact modulo p, with no rounding.
 *
 * - nttInPlace: the iterative transform, in place: the bit-reversal permutation, then the stages
 *   of length 2, 4, ..., n, which are the combining loops of the FFT's recursion run bottom-up.
 *   It returns the number of butterflies, (n / 2) * log2(n).
 * - ntt / intt: a copy, reduced modulo p (negative values allowed) and, for a forward transform,
 *   padded with zeros to a power of two. The inverse needs a power-of-two length.
 * - multiplyPolynomials / convolve: the product modulo p, len(p) + len(q) - 1 coefficients.
 *
 * Residues are below p < 2^30, so the product of two of them is below 2^60 and fits in uint64_t:
 * mulMod needs no 128-bit arithmetic for this modulus (the static_assert checks it).
 *
 * Invalid input throws std::invalid_argument: an inverse of a length that is not a power of two,
 * and more than 2^23 values or product coefficients, the longest transform modulo p.
 */

#include <cstddef>
#include <cstdint>
#include <iostream>
#include <stdexcept>
#include <string>
#include <utility>
#include <vector>

constexpr uint64_t MOD = 998244353;  // 119 * 2^23 + 1, a prime
constexpr uint64_t PRIMITIVE_ROOT = 3;
constexpr size_t MAX_LENGTH = size_t(1) << 23;  // the largest power of two dividing MOD - 1

static_assert(MOD - 1 <= UINT64_MAX / (MOD - 1), "the product of two residues must fit in uint64_t");

/** a * b mod MOD for residues a, b < MOD: the product is below 2^60, so uint64_t holds it. */
uint64_t mulMod(uint64_t a, uint64_t b) {
    return a * b % MOD;
}

/** base^exp mod MOD by square and multiply: O(log exp) calls to mulMod. */
uint64_t powMod(uint64_t base, uint64_t exp) {
    uint64_t result = 1;
    base %= MOD;
    while (exp > 0) {
        if (exp & 1) result = mulMod(result, base);
        base = mulMod(base, base);
        exp >>= 1;
    }
    return result;
}

bool isPowerOfTwo(size_t n) {
    return n > 0 && (n & (n - 1)) == 0;
}

/**
 * A primitive n-th root of unity modulo MOD, 3^((MOD - 1) / n), or its inverse (by Fermat,
 * w^(MOD - 2)). n must be a power of two from 1 to 2^23; otherwise std::invalid_argument.
 */
uint64_t rootOfUnity(size_t n, bool inverse = false) {
    if (!isPowerOfTwo(n) || n > MAX_LENGTH) {
        throw std::invalid_argument("no " + std::to_string(n) + "-th root of unity: n must be a power of two from 1 to 2^23");
    }
    uint64_t w = powMod(PRIMITIVE_ROOT, (MOD - 1) / n);
    return inverse ? powMod(w, MOD - 2) : w;
}

/** Swap a[i] and a[rev(i)], rev(i) being i with its log2(n) bits reversed; n a power of two or 0. */
void bitReversePermute(std::vector<long long>& a) {
    size_t n = a.size();
    for (size_t i = 1, j = 0; i < n; i++) {
        size_t bit = n >> 1;
        for (; j & bit; bit >>= 1) j ^= bit;
        j |= bit;
        if (i < j) std::swap(a[i], a[j]);
    }
}

/**
 * The iterative NTT of a, in place. a.size() must be a power of two from 1 to 2^23
 * (std::invalid_argument otherwise) and the entries residues 0..MOD-1. Returns the number of
 * butterflies: (n / 2) * log2(n). The inverse uses the inverse roots, then multiplies by n^-1.
 */
long long nttInPlace(std::vector<long long>& a, bool inverse = false) {
    size_t n = a.size();
    if (!isPowerOfTwo(n) || n > MAX_LENGTH) {
        throw std::invalid_argument("the transform length must be a power of two from 1 to 2^23, got " + std::to_string(n));
    }
    bitReversePermute(a);
    long long butterflies = 0;
    for (size_t length = 2; length <= n; length <<= 1) {
        uint64_t wLength = rootOfUnity(length, inverse);
        size_t half = length / 2;
        for (size_t start = 0; start < n; start += length) {  // one block = one recursive FFT call
            uint64_t w = 1;                                    // wLength^k
            for (size_t k = 0; k < half; k++) {
                uint64_t u = a[start + k];
                uint64_t t = mulMod(a[start + k + half], w);
                a[start + k] = static_cast<long long>((u + t) % MOD);
                a[start + k + half] = static_cast<long long>((u + MOD - t) % MOD);
                butterflies++;
                w = mulMod(w, wLength);
            }
        }
    }
    if (inverse) {
        uint64_t nInverse = powMod(n, MOD - 2);
        for (long long& x : a) x = static_cast<long long>(mulMod(x, nInverse));
    }
    return butterflies;
}

/** x reduced to 0..MOD-1, negative x included. */
long long reduce(long long x) {
    long long r = x % static_cast<long long>(MOD);
    return r < 0 ? r + static_cast<long long>(MOD) : r;
}

/**
 * The transform of a as a new vector of residues 0..MOD-1: X[k] = sum_j a[j] w^(jk) mod MOD.
 * The entries are reduced modulo MOD first. An empty input returns an empty vector; a forward
 * transform pads with zeros to the next power of two; the inverse needs a power-of-two length.
 * More than 2^23 values throw std::invalid_argument. Time O(n log n).
 */
std::vector<long long> ntt(const std::vector<long long>& a, bool inverse = false) {
    size_t n = a.size();
    if (n == 0) return {};
    if (n > MAX_LENGTH) throw std::invalid_argument("at most 2^23 values modulo 998244353, got " + std::to_string(n));
    if (inverse && !isPowerOfTwo(n)) throw std::invalid_argument("inverse NTT needs a power-of-two length, got " + std::to_string(n));
    size_t size = 1;
    while (size < n) size <<= 1;
    std::vector<long long> values(size, 0);
    for (size_t i = 0; i < n; i++) values[i] = reduce(a[i]);
    nttInPlace(values, inverse);
    return values;
}

/** The inverse transform: ntt(a, true). */
std::vector<long long> intt(const std::vector<long long>& a) {
    return ntt(a, true);
}

/**
 * The coefficients of p * q modulo MOD, len(p) + len(q) - 1 of them (none when that is below 1);
 * an empty vector is the zero polynomial. No rounding: each coefficient is exact modulo MOD.
 * More than 2^23 product coefficients throw std::invalid_argument. Time O(n log n).
 */
std::vector<long long> multiplyPolynomials(const std::vector<long long>& p, const std::vector<long long>& q) {
    size_t need = p.size() + q.size();  // one more than the number of coefficients
    if (need > MAX_LENGTH + 1) {
        throw std::invalid_argument("the product has " + std::to_string(need - 1) + " coefficients; at most 2^23 fit in one transform");
    }
    if (p.empty() || q.empty()) return std::vector<long long>(need > 0 ? need - 1 : 0, 0);
    need -= 1;
    size_t n = 1;
    while (n < need) n <<= 1;
    std::vector<long long> fp(n, 0), fq(n, 0);
    for (size_t i = 0; i < p.size(); i++) fp[i] = reduce(p[i]);
    for (size_t i = 0; i < q.size(); i++) fq[i] = reduce(q[i]);
    nttInPlace(fp);
    nttInPlace(fq);
    for (size_t i = 0; i < n; i++) fp[i] = static_cast<long long>(mulMod(fp[i], fq[i]));
    nttInPlace(fp, true);
    fp.resize(need);
    return fp;
}

/** The convolution of two sequences modulo MOD: the same as multiplyPolynomials. */
std::vector<long long> convolve(const std::vector<long long>& a, const std::vector<long long>& b) {
    return multiplyPolynomials(a, b);
}

#ifndef IS_TEST_BUILD
namespace {
void print(const char* label, const std::vector<long long>& v) {
    std::cout << label << " [";
    for (size_t i = 0; i < v.size(); i++) std::cout << (i ? ", " : "") << v[i];
    std::cout << "]\n";
}
}  // namespace

int main() {
    std::cout << "MOD = " << MOD << " = 119 * 2^23 + 1, primitive root " << PRIMITIVE_ROOT << '\n';
    std::cout << "rootOfUnity(4) = " << rootOfUnity(4) << '\n';
    std::vector<long long> spectrum = ntt({1, 2, 3, 4});
    print("ntt({1, 2, 3, 4}) =", spectrum);
    print("intt of that =", intt(spectrum));
    print("multiplyPolynomials({1, 2, 3}, {4, 5}) =", multiplyPolynomials({1, 2, 3}, {4, 5}));
    print("(1 - x)(1 + x) =", multiplyPolynomials({1, -1}, {1, 1}));
    std::vector<long long> a(1 << 10, 1);
    std::cout << "nttInPlace on 1024 values: " << nttInPlace(a) << " butterflies\n";
    return 0;
}
#endif
