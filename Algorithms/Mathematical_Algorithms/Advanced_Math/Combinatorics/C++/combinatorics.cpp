/**
 * Combinatorics (C++)
 *
 * Binomial coefficients C(n, k) three ways, then Catalan numbers, stars and bars and
 * derangements. Every count is an unsigned 64-bit number; a count that does not fit throws
 * std::overflow_error instead of wrapping around.
 *
 * - pascalTriangle and binomialPascal: Pascal's rule C(n, k) = C(n-1, k-1) + C(n-1, k), additions
 *   only. Rows 0..67 fit in 64 bits; row 68 holds C(68, 34) > 2^64 - 1.
 * - binomial: the multiplicative formula in min(k, n - k) steps. Each step is
 *   value * m / i with the gcd of value and i divided out first, so the product equals the next
 *   value, itself a binomial no larger than the answer: nothing overflows unless the answer does.
 * - ModBinomial: i! and (i!)^-1 modulo a prime p > nMax, with one modular inverse
 *   (fact[nMax]^(p - 2), Euler's theorem for a prime) and inv_fact filled backwards; then
 *   C(n, k) mod p in O(1). Products go through mulMod in unsigned __int128 (a GCC and Clang
 *   extension), so any p up to 2^64 - 1 works.
 * - catalanNumbers (the recurrence) and catalan (C(2n, n) / (n + 1)); starsAndBars and
 *   starsAndBarsPositive; derangementNumbers.
 *
 * C(n, k) is 0 for k < 0 or k > n. Invalid input throws std::invalid_argument (a negative count,
 * a modulus that is not prime or not above nMax), and a query past ModBinomial's table throws
 * std::out_of_range.
 */

#include <algorithm>
#include <cstdint>
#include <iostream>
#include <numeric>
#include <stdexcept>
#include <string>
#include <vector>

namespace {

/** a + b, or std::overflow_error if the sum does not fit in 64 bits. */
uint64_t checkedAdd(uint64_t a, uint64_t b, const std::string& what) {
    if (a > UINT64_MAX - b) throw std::overflow_error(what + " does not fit in 64 bits");
    return a + b;
}

/** a * b, or std::overflow_error if the product does not fit in 64 bits. */
uint64_t checkedMul(uint64_t a, uint64_t b, const std::string& what) {
    if (b != 0 && a > UINT64_MAX / b) throw std::overflow_error(what + " does not fit in 64 bits");
    return a * b;
}

std::string binomialName(int64_t n, int64_t k) { return "C(" + std::to_string(n) + ", " + std::to_string(k) + ")"; }

void checkNotNegative(int64_t value, const char* what) {
    if (value < 0) throw std::invalid_argument(std::string(what) + " = " + std::to_string(value) + " must not be negative");
}

}  // namespace

/** Rows 0..n of Pascal's triangle: rows[r][j] = C(r, j). n(n - 1) / 2 additions. */
std::vector<std::vector<uint64_t>> pascalTriangle(int n) {
    checkNotNegative(n, "n");
    std::vector<std::vector<uint64_t>> rows = {{1}};
    for (int r = 1; r <= n; r++) {
        const std::vector<uint64_t>& above = rows[r - 1];
        std::vector<uint64_t> row(static_cast<size_t>(r) + 1, 1);  // C(r, 0) = C(r, r) = 1
        for (int j = 1; j < r; j++) row[j] = checkedAdd(above[j - 1], above[j], binomialName(r, j));
        rows.push_back(std::move(row));
    }
    return rows;
}

/**
 * C(n, k) by Pascal's rule on one row of min(k, n - k) + 1 cells: O(n * min(k, n - k)) additions.
 * Every cell is C(r, j) with r <= n and j <= min(k, n - k), never more than the answer.
 */
uint64_t binomialPascal(int64_t n, int64_t k) {
    if (k < 0 || k > n) return 0;
    const std::string name = binomialName(n, k);
    k = std::min(k, n - k);
    // C(n, k) >= C(2k, k) >= C(68, 34) > 2^64 - 1 once k >= 34: say so before allocating the row.
    if (k >= 34) throw std::overflow_error(name + " does not fit in 64 bits");
    std::vector<uint64_t> row(static_cast<size_t>(k) + 1, 0);
    row[0] = 1;
    for (int64_t r = 1; r <= n; r++) {
        // Right to left, so row[j - 1] still holds row r - 1 when row[j] reads it.
        for (int64_t j = std::min(r, k); j >= 1; j--) row[j] = checkedAdd(row[j], row[j - 1], binomialName(r, j));
    }
    return row[k];
}

/**
 * C(n, k) by the multiplicative formula in min(k, n - k) steps. Before step i the value is
 * C(n - k + i - 1, i - 1); times (n - k + i) / i it is C(n - k + i, i). With g = gcd(value, i),
 * i / g divides n - k + i, so (value / g) * ((n - k + i) / (i / g)) is that next value exactly.
 */
uint64_t binomial(int64_t n, int64_t k) {
    if (k < 0 || k > n) return 0;
    const std::string name = binomialName(n, k);
    k = std::min(k, n - k);
    uint64_t result = 1;
    for (int64_t i = 1; i <= k; i++) {
        uint64_t m = static_cast<uint64_t>(n - k + i);
        uint64_t d = static_cast<uint64_t>(i);
        uint64_t g = std::gcd(result, d);
        result = checkedMul(result / g, m / (d / g), name);
    }
    return result;
}

/** a * b mod m for any 64-bit values, m >= 1: the product is taken in 128 bits. */
uint64_t mulMod(uint64_t a, uint64_t b, uint64_t m) {
    return static_cast<uint64_t>(static_cast<unsigned __int128>(a) * b % m);
}

/** base^exp mod m by square and multiply, m >= 1; adds the mulMod calls to *count. */
uint64_t powMod(uint64_t base, uint64_t exp, uint64_t m, long long* count = nullptr) {
    uint64_t result = 1 % m;
    base %= m;
    long long made = 0;
    while (exp > 0) {
        if (exp & 1) {
            result = mulMod(result, base, m);
            made++;
        }
        base = mulMod(base, base, m);
        made++;
        exp >>= 1;
    }
    if (count) *count += made;
    return result;
}

/**
 * fact[i] = i! mod p and invFact[i] = (i!)^-1 mod p for i <= nMax, so C(n, k) mod p is O(1).
 * multiplications() counts the products of the build: nMax for fact, those of the one power,
 * nMax for invFact.
 */
class ModBinomial {
public:
    /**
     * Throws std::invalid_argument for nMax < 0, p < 2, nMax >= p (p divides n! from n = p on;
     * Lucas's theorem handles n >= p), or when fact[nMax]^(p - 2) is not an inverse (p is then
     * not prime).
     */
    ModBinomial(int nMax, uint64_t p) : nMax_(nMax), p_(p) {
        checkNotNegative(nMax, "nMax");
        if (p < 2) throw std::invalid_argument("p = " + std::to_string(p) + " is not prime: the modulus must be a prime");
        if (static_cast<uint64_t>(nMax) >= p) {
            throw std::invalid_argument("nMax = " + std::to_string(nMax) + " >= p = " + std::to_string(p) +
                                        ": p divides n! for every n >= p, so n! has no inverse modulo p; Lucas's theorem handles n >= p");
        }
        fact_.assign(static_cast<size_t>(nMax) + 1, 1);
        for (int i = 1; i <= nMax; i++) {
            fact_[i] = mulMod(fact_[i - 1], static_cast<uint64_t>(i), p);
            multiplications_++;
        }
        uint64_t inverse = powMod(fact_[nMax], p - 2, p, &multiplications_);
        uint64_t check = mulMod(fact_[nMax], inverse, p);
        if (check != 1) {
            throw std::invalid_argument("p = " + std::to_string(p) + " is not prime: " + std::to_string(fact_[nMax]) + " * " + std::to_string(inverse) +
                                        " % " + std::to_string(p) + " = " + std::to_string(check) + ", so the power p - 2 did not invert " +
                                        std::to_string(nMax) + "! modulo p");
        }
        invFact_.assign(static_cast<size_t>(nMax) + 1, 1);
        invFact_[nMax] = inverse;
        for (int i = nMax; i >= 1; i--) {
            invFact_[i - 1] = mulMod(invFact_[i], static_cast<uint64_t>(i), p);  // 1/(i-1)! = i * 1/i!
            multiplications_++;
        }
    }

    /** C(n, k) mod p: 0 for k < 0 or k > n; std::out_of_range for n > nMax. */
    uint64_t binomial(int64_t n, int64_t k) const {
        if (k < 0 || k > n) return 0;
        if (n > nMax_) throw std::out_of_range("n = " + std::to_string(n) + " is past the table: it was built for n <= " + std::to_string(nMax_));
        return mulMod(mulMod(fact_[n], invFact_[k], p_), invFact_[n - k], p_);
    }

    int nMax() const { return nMax_; }
    uint64_t modulus() const { return p_; }
    const std::vector<uint64_t>& fact() const { return fact_; }
    const std::vector<uint64_t>& invFact() const { return invFact_; }
    long long multiplications() const { return multiplications_; }

private:
    int nMax_;
    uint64_t p_;
    std::vector<uint64_t> fact_;
    std::vector<uint64_t> invFact_;
    long long multiplications_ = 0;
};

/** [C_0, ..., C_n] by C_m = sum of C_i * C_(m-1-i): O(n^2). Fits up to C_36; C_37 throws. */
std::vector<uint64_t> catalanNumbers(int n) {
    checkNotNegative(n, "n");
    std::vector<uint64_t> cat = {1};
    for (int m = 1; m <= n; m++) {
        // Every product and partial sum is at most C_m, so the first overflow is C_m's own.
        uint64_t sum = 0;
        const std::string name = "the Catalan number C_" + std::to_string(m);
        for (int i = 0; i < m; i++) sum = checkedAdd(sum, checkedMul(cat[i], cat[m - 1 - i], name), name);
        cat.push_back(sum);
    }
    return cat;
}

/** C_n = C(2n, n) / (n + 1). C(2n, n) must fit, so n <= 33; std::overflow_error above. */
uint64_t catalan(int64_t n) {
    checkNotNegative(n, "n");
    if (n > INT64_MAX / 2) throw std::overflow_error("C(2 * " + std::to_string(n) + ", " + std::to_string(n) + ") does not fit in 64 bits");
    return binomial(2 * n, n) / static_cast<uint64_t>(n + 1);
}

/** Ways to put n identical items into k boxes: C(n + k - 1, k - 1); for k = 0, 1 if n == 0. */
uint64_t starsAndBars(int64_t n, int64_t k) {
    checkNotNegative(n, "n");
    checkNotNegative(k, "k");
    if (k == 0) return n == 0 ? 1 : 0;
    if (n > INT64_MAX - k) throw std::overflow_error(binomialName(n, k) + ": n + k - 1 does not fit in 64 bits");
    return binomial(n + k - 1, k - 1);
}

/** The same with at least one item per box: C(n - 1, k - 1), 0 when n < k. */
uint64_t starsAndBarsPositive(int64_t n, int64_t k) {
    checkNotNegative(n, "n");
    checkNotNegative(k, "k");
    if (k == 0) return n == 0 ? 1 : 0;
    return binomial(n - 1, k - 1);
}

/** [D(0), ..., D(n)] by D(m) = (m - 1)(D(m - 1) + D(m - 2)). Fits up to D(20); D(21) throws. */
std::vector<uint64_t> derangementNumbers(int n) {
    checkNotNegative(n, "n");
    std::vector<uint64_t> d = {1};
    if (n >= 1) d.push_back(0);
    for (int m = 2; m <= n; m++) {
        const std::string name = "D(" + std::to_string(m) + ")";
        d.push_back(checkedMul(static_cast<uint64_t>(m - 1), checkedAdd(d[m - 1], d[m - 2], name), name));
    }
    return d;
}

#ifndef IS_TEST_BUILD
int main() {
    std::cout << "Pascal's triangle, rows 0..6:\n";
    for (const auto& row : pascalTriangle(6)) {
        std::cout << "   ";
        for (uint64_t v : row) std::cout << ' ' << v;
        std::cout << '\n';
    }
    std::cout << "C(10, 3) three ways: " << binomialPascal(10, 3) << ' ' << binomial(10, 3) << ' ' << ModBinomial(10, 1000000007).binomial(10, 3) << '\n';
    std::cout << "C(67, 33) = " << binomial(67, 33) << " (row 67 is the last that fits)\n";
    try {
        binomial(68, 34);
    } catch (const std::overflow_error& e) {
        std::cout << "binomial(68, 34): " << e.what() << '\n';
    }
    ModBinomial table(1000000, 1000000007);
    std::cout << "C(10^6, 5 * 10^5) mod 10^9 + 7 = " << table.binomial(1000000, 500000) << " (" << table.multiplications() << " multiplications to build)\n";
    std::cout << "Catalan C_0..C_10:";
    for (uint64_t c : catalanNumbers(10)) std::cout << ' ' << c;
    std::cout << "  catalan(10) = " << catalan(10) << '\n';
    std::cout << "starsAndBars(5, 3) = " << starsAndBars(5, 3) << "  starsAndBarsPositive(5, 3) = " << starsAndBarsPositive(5, 3) << '\n';
    std::cout << "D(0..10):";
    std::vector<uint64_t> d = derangementNumbers(20);
    for (int m = 0; m <= 10; m++) std::cout << ' ' << d[m];
    std::cout << "\nD(20) = " << d[20] << " (the last that fits)\n";
    return 0;
}
#endif
