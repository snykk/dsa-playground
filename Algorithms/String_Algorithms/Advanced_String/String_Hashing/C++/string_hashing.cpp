/**
 * String Hashing (C++)
 *
 * A polynomial hash reads a string c_0 c_1 ... c_(m-1) as a number in base B, modulo M:
 *     hash = (c_0 * B^(m-1) + c_1 * B^(m-2) + ... + c_(m-1)) mod M
 * After O(n) preprocessing (prefix[i] = hash of s[0, i), power[i] = B^i mod M) the hash of
 * any substring s[l, r) is (prefix[r] - prefix[l] * power[r - l]) mod M, in O(1). On top of
 * that: equality of two substrings in O(1), the longest common prefix of two suffixes in
 * O(log n) (a binary search on the length), the order of two substrings in O(log n), and the
 * number of distinct substrings of one length.
 *
 * - PolynomialHash(s, base, mod): one modulus, 2 <= mod <= 2^32 and 1 <= base < mod.
 * - DoubleHash(s): the fixed pairs (BASE1, MOD1) and (BASE2, MOD2); a hash is a pair.
 * - overflowHash and thueMorsePair: hashing modulo 2^64 by unsigned overflow, and the two
 *   strings of length 1024 that collide under it for every odd base.
 *
 * Characters are the bytes of the std::string, read as unsigned char (0..255), so text in
 * UTF-8 is hashed byte by byte and positions are byte offsets. The Python version gives the
 * same numbers for the same bytes.
 */

#include <algorithm>
#include <climits>
#include <cstdint>
#include <stdexcept>
#include <string>
#include <utility>
#include <vector>

// With mod <= 2^32 every hash and power is below 2^32, so the product of two of them is at
// most (2^32 - 1)^2 < 2^64 and fits in a uint64_t: no multiplication can overflow.
const uint64_t MAX_MOD = 1ULL << 32;
const uint64_t MOD1 = 1000000007ULL;
const uint64_t BASE1 = 911382323ULL;
const uint64_t MOD2 = 998244353ULL;
const uint64_t BASE2 = 972663749ULL;

inline uint64_t byteValue(char c) {
    // char is signed on common platforms; a byte >= 0x80 must count as 128..255, not negative.
    return static_cast<unsigned char>(c);
}

inline void checkParameters(uint64_t base, uint64_t mod) {
    if (mod < 2 || mod > MAX_MOD) {
        throw std::invalid_argument("mod " + std::to_string(mod) + " is outside 2..2^32");
    }
    if (base < 1 || base >= mod) {
        throw std::invalid_argument("base " + std::to_string(base) + " is outside 1.." + std::to_string(mod - 1));
    }
}

/**
 * equal, lcp, compare and countDistinct for any hash class that has get(l, r) (CRTP: Derived
 * is that class). The queries only compare values returned by get, so a collision can make
 * them wrong; with DoubleHash that is very unlikely.
 */
template <class Derived>
class SubstringQueries {
public:
    int size() const { return static_cast<int>(text_.size()); }
    const std::string& text() const { return text_; }

    /** Whether s[i, i + length) == s[j, j + length), by two hashes: O(1). */
    bool equal(int i, int j, int length) const {
        if (length < 0) throw std::invalid_argument("length " + std::to_string(length) + " is negative");
        checkRange(i, i + length);
        checkRange(j, j + length);
        return self().get(i, i + length) == self().get(j, j + length);
    }

    /** Longest common prefix of the suffixes s[i, n) and s[j, n); i or j may be n. O(log n). */
    int lcp(int i, int j) const {
        checkRange(i, size());
        checkRange(j, size());
        return boundedLcp(i, j, std::min(size() - i, size() - j));
    }

    /** -1, 0 or 1 as s[l1, r1) is smaller than, equal to or larger than s[l2, r2), by byte. */
    int compare(int l1, int r1, int l2, int r2) const {
        checkRange(l1, r1);
        checkRange(l2, r2);
        int len1 = r1 - l1;
        int len2 = r2 - l2;
        int shorter = std::min(len1, len2);
        int k = boundedLcp(l1, l2, shorter);
        if (k == shorter) return (len1 > len2) - (len1 < len2);
        return byteValue(text_[l1 + k]) < byteValue(text_[l2 + k]) ? -1 : 1;
    }

    /** Distinct substrings of one length: 1 for length 0, 0 above n. O(n log n) by sorting the hashes. */
    int countDistinct(int length) const {
        if (length < 0) throw std::invalid_argument("length " + std::to_string(length) + " is negative");
        using Key = decltype(self().get(0, 0));
        std::vector<Key> keys;
        for (int i = 0; i + length <= size(); i++) keys.push_back(self().get(i, i + length));
        std::sort(keys.begin(), keys.end());
        return static_cast<int>(std::unique(keys.begin(), keys.end()) - keys.begin());
    }

protected:
    explicit SubstringQueries(const std::string& s) : text_(s) {
        if (s.size() > static_cast<std::size_t>(INT_MAX)) throw std::length_error("the string is longer than INT_MAX");
    }

    void checkRange(int l, int r) const {
        if (l < 0 || l > r || r > size()) {
            throw std::out_of_range("[" + std::to_string(l) + ", " + std::to_string(r) + ") is not a range of 0.." + std::to_string(size()));
        }
    }

    /** The largest k <= limit with equal hashes of s[i, i + k) and s[j, j + k). */
    int boundedLcp(int i, int j, int limit) const {
        int lo = 0;
        int hi = limit;
        // Invariant: the prefixes of length lo agree, and none longer than hi can.
        while (lo < hi) {
            int mid = lo + (hi - lo + 1) / 2;
            if (self().get(i, i + mid) == self().get(j, j + mid)) {
                lo = mid;
            } else {
                hi = mid - 1;
            }
        }
        return lo;
    }

private:
    const Derived& self() const { return static_cast<const Derived&>(*this); }
    std::string text_;
};

/** Prefix hashes and powers of one string for one (base, mod) pair. */
class PolynomialHash : public SubstringQueries<PolynomialHash> {
public:
    /** O(n). Throws std::invalid_argument unless 2 <= mod <= 2^32 and 1 <= base < mod. */
    PolynomialHash(const std::string& s, uint64_t base, uint64_t mod)
        : SubstringQueries<PolynomialHash>(s), base_(base), mod_(mod) {
        checkParameters(base, mod);
        int n = size();
        prefix_.assign(n + 1, 0);
        power_.assign(n + 1, 1);
        for (int i = 0; i < n; i++) {
            // Horner's rule. prefix_[i] * base < 2^64 because both are below mod <= 2^32.
            prefix_[i + 1] = (prefix_[i] * base % mod + byteValue(s[i])) % mod;
            power_[i + 1] = power_[i] * base % mod;
        }
    }

    /** The hash of s[l, r): O(1). Throws std::out_of_range unless 0 <= l <= r <= n. */
    uint64_t get(int l, int r) const {
        checkRange(l, r);
        uint64_t shifted = prefix_[l] * power_[r - l] % mod_;
        // Add mod before subtracting: unsigned values must not go below zero.
        return (prefix_[r] + mod_ - shifted) % mod_;
    }

    uint64_t base() const { return base_; }
    uint64_t mod() const { return mod_; }
    const std::vector<uint64_t>& prefix() const { return prefix_; }
    const std::vector<uint64_t>& power() const { return power_; }

private:
    uint64_t base_;
    uint64_t mod_;
    std::vector<uint64_t> prefix_;
    std::vector<uint64_t> power_;
};

/** Two polynomial hashes, (BASE1, MOD1) and (BASE2, MOD2); the hash of a substring is the pair. */
class DoubleHash : public SubstringQueries<DoubleHash> {
public:
    explicit DoubleHash(const std::string& s)
        : SubstringQueries<DoubleHash>(s), first_(s, BASE1, MOD1), second_(s, BASE2, MOD2) {}

    /** The pair of hashes of s[l, r): O(1). */
    std::pair<uint64_t, uint64_t> get(int l, int r) const { return {first_.get(l, r), second_.get(l, r)}; }

    const PolynomialHash& first() const { return first_; }
    const PolynomialHash& second() const { return second_; }

private:
    PolynomialHash first_;
    PolynomialHash second_;
};

/** The hash of a whole string by Horner's rule, without a table: O(m). */
uint64_t polynomialHash(const std::string& s, uint64_t base, uint64_t mod) {
    checkParameters(base, mod);
    uint64_t h = 0;
    for (char c : s) h = (h * base % mod + byteValue(c)) % mod;
    return h;
}

/**
 * The polynomial hash modulo 2^64, by letting uint64_t arithmetic wrap around (defined for
 * unsigned types). Do not use it: thueMorsePair(10) collides for every odd base, and for an
 * even base base^64 is a multiple of 2^64, so only the last 64 characters count.
 */
uint64_t overflowHash(const std::string& s, uint64_t base) {
    uint64_t h = 0;
    for (char c : s) h = h * base + byteValue(c);
    return h;
}

/** The Thue-Morse string of length 2^k over "ab" and its complement. Throws std::invalid_argument unless 0 <= k <= 30. */
std::pair<std::string, std::string> thueMorsePair(int k) {
    if (k < 0 || k > 30) throw std::invalid_argument("k = " + std::to_string(k) + " is outside 0..30");
    std::size_t n = std::size_t{1} << k;
    std::string s(n, 'a');
    std::string t(n, 'b');
    for (std::size_t i = 0; i < n; i++) {
        int ones = 0;
        for (std::size_t x = i; x != 0; x &= x - 1) ones++;
        if (ones % 2 == 1) {
            s[i] = 'b';
            t[i] = 'a';
        }
    }
    return {s, t};
}

#ifndef IS_TEST_BUILD
#include <iostream>

int main() {
    std::string s = "mississippi";
    PolynomialHash small(s, 31, 97);
    std::cout << std::boolalpha << "s = " << s << ", base 31, mod 97\nprefix:";
    for (uint64_t v : small.prefix()) std::cout << ' ' << v;
    std::cout << "\npower: ";
    for (uint64_t v : small.power()) std::cout << ' ' << v;
    std::cout << "\nhash of s[1, 5) = " << small.get(1, 5) << " and of s[4, 8) = " << small.get(4, 8) << '\n';

    DoubleHash h(s);
    auto a = h.get(1, 5);
    std::cout << "DoubleHash of s[1, 5): (" << a.first << ", " << a.second << ")\n";
    std::cout << "equal(1, 4, 4) = " << h.equal(1, 4, 4) << ", lcp(1, 4) = " << h.lcp(1, 4)
              << ", compare(0, 4, 1, 5) = " << h.compare(0, 4, 1, 5) << '\n';
    std::cout << "distinct substrings of length 1..11:";
    for (int k = 1; k <= h.size(); k++) std::cout << ' ' << h.countDistinct(k);
    std::cout << '\n';

    auto tm = thueMorsePair(10);
    for (uint64_t base : {3ULL, 31ULL, 131ULL, BASE1}) {
        std::cout << "Thue-Morse, length 1024, base " << base << ": overflowHash equal = "
                  << (overflowHash(tm.first, base) == overflowHash(tm.second, base)) << '\n';
    }
    std::cout << "DoubleHash tells them apart: " << (DoubleHash(tm.first).get(0, 1024) != DoubleHash(tm.second).get(0, 1024)) << '\n';
    return 0;
}
#endif
