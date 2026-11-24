/**
 * Unit tests for string hashing. The pinned values were computed by the Python
 * implementation (string_hashing.py); the queries are checked against brute force on random
 * strings from std::mt19937 with fixed seeds.
 */
#include <cassert>
#include <iostream>
#include <random>
#include <set>
#include <stdexcept>
#include <string>
#include <utility>
#include <vector>

#include "string_hashing.cpp"

namespace {

using Pair = std::pair<uint64_t, uint64_t>;

/** sum of c_i * base^(m-1-i) mod mod, term by term: independent of Horner's rule. */
uint64_t definitionHash(const std::string& t, uint64_t base, uint64_t mod) {
    uint64_t sum = 0;
    int m = static_cast<int>(t.size());
    for (int i = 0; i < m; i++) {
        uint64_t p = 1 % mod;
        for (int e = 0; e < m - 1 - i; e++) p = p * base % mod;
        sum = (sum + byteValue(t[i]) * p) % mod;
    }
    return sum;
}

int naiveLcp(const std::string& s, int i, int j) {
    int n = static_cast<int>(s.size());
    int k = 0;
    while (i + k < n && j + k < n && s[i + k] == s[j + k]) k++;
    return k;
}

int sign(int x) { return (x > 0) - (x < 0); }

std::string randomString(std::mt19937& rng, const std::string& alphabet, int lo, int hi) {
    int len = std::uniform_int_distribution<int>(lo, hi)(rng);
    std::string s;
    for (int k = 0; k < len; k++) s += alphabet[std::uniform_int_distribution<std::size_t>(0, alphabet.size() - 1)(rng)];
    return s;
}

template <class F>
bool throwsInvalid(F f) {
    try {
        f();
    } catch (const std::invalid_argument&) {
        return true;
    }
    return false;
}

template <class F>
bool throwsOutOfRange(F f) {
    try {
        f();
    } catch (const std::out_of_range&) {
        return true;
    }
    return false;
}

const std::vector<std::pair<uint64_t, uint64_t>> PARAMS = {
    {BASE1, MOD1}, {BASE2, MOD2}, {MAX_MOD - 1, MAX_MOD}, {31, 97}, {31, 101}, {2, 3}, {1, 2}};

}  // namespace

void testMississippiTables() {
    PolynomialHash h("mississippi", 31, 97);
    assert((h.prefix() == std::vector<uint64_t>{0, 12, 89, 61, 66, 17, 60, 35, 26, 45, 52, 68}));
    assert((h.power() == std::vector<uint64_t>{1, 31, 88, 12, 81, 86, 47, 2, 62, 79, 24, 65}));
    assert(h.get(1, 5) == 15);
    assert(h.get(4, 8) == 15);
    assert(h.get(0, 11) == 68);
}

void testDoubleHashValues() {
    DoubleHash d("mississippi");
    assert((d.get(0, 11) == Pair{788634571, 670713304}));
    assert((d.get(1, 5) == Pair{883654281, 445652627}));
    assert((d.get(4, 8) == Pair{883654281, 445652627}));
    assert((d.get(0, 0) == Pair{0, 0}));
    assert(d.lcp(1, 4) == 4);
    assert(d.lcp(2, 5) == 3);
    assert(d.lcp(0, 11) == 0);
    assert(d.compare(1, 5, 4, 8) == 0);
    assert(d.compare(0, 4, 1, 5) == 1);
    std::vector<int> distinct;
    for (int k = 0; k <= 12; k++) distinct.push_back(d.countDistinct(k));
    assert((distinct == std::vector<int>{1, 4, 7, 7, 7, 7, 6, 5, 4, 3, 2, 1, 0}));
}

void testLargestModulusValues() {
    // mod = 2^32 and base = 2^32 - 1: the largest factors the code multiplies.
    PolynomialHash h("mississippi", MAX_MOD - 1, MAX_MOD);
    assert((h.prefix() == std::vector<uint64_t>{0, 109, 4294967292ULL, 119, 4294967292ULL, 109, 6, 109, 4294967292ULL, 116, 4294967292ULL, 109}));
}

void testEverySubstringAgainstTheDefinition() {
    std::mt19937 rng(2);
    for (int t = 0; t < 40; t++) {
        std::string s = randomString(rng, "abcdefgh", 0, 20);
        int n = static_cast<int>(s.size());
        for (const auto& [base, mod] : PARAMS) {
            PolynomialHash h(s, base, mod);
            for (int l = 0; l <= n; l++) {
                for (int r = l; r <= n; r++) {
                    uint64_t want = definitionHash(s.substr(l, r - l), base, mod);
                    assert(h.get(l, r) == want);
                    assert(polynomialHash(s.substr(l, r - l), base, mod) == want);
                }
            }
        }
        DoubleHash d(s);
        for (int l = 0; l <= n; l++) {
            for (int r = l; r <= n; r++) {
                std::string sub = s.substr(l, r - l);
                assert((d.get(l, r) == Pair{definitionHash(sub, BASE1, MOD1), definitionHash(sub, BASE2, MOD2)}));
            }
        }
    }
}

void testQueriesAgainstBruteForce() {
    std::mt19937 rng(5);
    const std::vector<std::string> alphabets = {"a", "ab", "abc", "abcd"};
    for (int t = 0; t < 250; t++) {
        std::string s = randomString(rng, alphabets[t % alphabets.size()], 0, 24);
        int n = static_cast<int>(s.size());
        DoubleHash d(s);
        for (int i = 0; i <= n; i++) {
            for (int j = 0; j <= n; j++) {
                assert(d.lcp(i, j) == naiveLcp(s, i, j));
                for (int length = 0; length <= n - std::max(i, j); length++) {
                    assert(d.equal(i, j, length) == (s.compare(i, length, s, j, length) == 0));
                }
            }
        }
        for (int q = 0; q < 50; q++) {
            int l1 = std::uniform_int_distribution<int>(0, n)(rng);
            int r1 = std::uniform_int_distribution<int>(l1, n)(rng);
            int l2 = std::uniform_int_distribution<int>(0, n)(rng);
            int r2 = std::uniform_int_distribution<int>(l2, n)(rng);
            assert(d.compare(l1, r1, l2, r2) == sign(s.substr(l1, r1 - l1).compare(s.substr(l2, r2 - l2))));
        }
        for (int length = 0; length <= n + 2; length++) {
            std::set<std::string> subs;
            for (int i = 0; i + length <= n; i++) subs.insert(s.substr(i, length));
            assert(d.countDistinct(length) == static_cast<int>(subs.size()));
        }
    }
}

void testPolynomialHashQueries() {
    std::mt19937 rng(8);
    for (int t = 0; t < 80; t++) {
        std::string s = randomString(rng, "abc", 0, 20);
        int n = static_cast<int>(s.size());
        PolynomialHash h(s, BASE1, MOD1);
        for (int i = 0; i <= n; i++) {
            for (int j = 0; j <= n; j++) assert(h.lcp(i, j) == naiveLcp(s, i, j));
        }
    }
}

void testEmptyString() {
    PolynomialHash h("", 31, 97);
    assert((h.prefix() == std::vector<uint64_t>{0}));
    assert((h.power() == std::vector<uint64_t>{1}));
    assert(h.get(0, 0) == 0);
    DoubleHash d("");
    assert(d.size() == 0);
    assert((d.get(0, 0) == Pair{0, 0}));
    assert(d.lcp(0, 0) == 0);
    assert(d.equal(0, 0, 0));
    assert(d.compare(0, 0, 0, 0) == 0);
    assert(d.countDistinct(0) == 1);
    assert(d.countDistinct(1) == 0);
}

void testOneCharacter() {
    PolynomialHash h("z", 31, 97);
    assert(h.get(0, 1) == 25);
    DoubleHash d("z");
    assert((d.get(0, 1) == Pair{122, 122}));
    assert(d.lcp(0, 0) == 1);
    assert(d.lcp(0, 1) == 0);
    assert(d.compare(0, 1, 0, 0) == 1);
    assert(d.compare(0, 0, 0, 1) == -1);
    assert(d.countDistinct(1) == 1);
    assert(d.countDistinct(2) == 0);
}

void testAllCharactersEqual() {
    const int n = 50;
    DoubleHash d(std::string(n, 'a'));
    for (int i = 0; i <= n; i++) {
        for (int j = 0; j <= n; j++) assert(d.lcp(i, j) == n - std::max(i, j));
    }
    for (int length = 1; length <= n; length++) assert(d.countDistinct(length) == 1);
    assert(d.compare(0, 3, 10, 12) == 1);
    assert(d.compare(5, 7, 0, 2) == 0);
}

void testBytesOutsideAscii() {
    // "h" + U+00E9 + "llo" in UTF-8: 6 bytes. Python gives the same numbers for s.encode().
    std::string s = "h\xc3\xa9llo";
    PolynomialHash h(s, 31, 97);
    assert(h.size() == 6);
    assert((h.prefix() == std::vector<uint64_t>{0, 7, 24, 40, 87, 89, 57}));
    assert((DoubleHash(s).get(0, 6) == Pair{180144647, 254344828}));
    // U+00E9 and U+00E8 share their lead byte 0xC3: the common prefix is one byte long.
    DoubleHash e("\xc3\xa9\xc3\xa8");
    assert(e.lcp(0, 2) == 1);
    // Bytes compare as unsigned: 0xC3 is larger than 'z'.
    DoubleHash z("z\xc3\xa9");
    assert(z.compare(1, 3, 0, 1) == 1);
}

void testLargestRanges() {
    const int n = 100000;
    std::string s(n, 'a');
    for (int i = 0; i < n; i++) s[i] = static_cast<char>('a' + (static_cast<long long>(i) * i + 3LL * i) % 26);
    DoubleHash d(s);
    assert((d.get(0, n) == Pair{439513216, 315805692}));
    assert((d.get(12345, 99999) == Pair{239334980, 556481625}));
    assert((d.get(0, n) == Pair{polynomialHash(s, BASE1, MOD1), polynomialHash(s, BASE2, MOD2)}));
    assert(d.lcp(0, 0) == n);
    assert(d.lcp(n, n) == 0);
    assert(d.compare(0, n, 0, n) == 0);
    assert(d.countDistinct(n) == 1);
    DoubleHash a(std::string(n, 'a'));
    assert(a.lcp(0, 1) == n - 1);
    assert(a.compare(0, n, 1, n) == 1);
    assert(a.countDistinct(n / 2) == 1);
}

void testErrors() {
    const std::vector<std::pair<uint64_t, uint64_t>> bad = {{1, 1}, {1, 0}, {1, MAX_MOD + 1}, {0, 97}, {97, 97}};
    for (const auto& p : bad) {
        assert(throwsInvalid([&] { PolynomialHash("abc", p.first, p.second); }));
        assert(throwsInvalid([&] { polynomialHash("abc", p.first, p.second); }));
    }
    PolynomialHash h("abcd", 31, 97);
    DoubleHash d("abcd");
    const std::vector<std::pair<int, int>> ranges = {{-1, 2}, {3, 2}, {0, 5}, {5, 5}};
    for (const auto& range : ranges) {
        int l = range.first;
        int r = range.second;
        assert(throwsOutOfRange([&] { h.get(l, r); }));
        assert(throwsOutOfRange([&] { d.get(l, r); }));
        assert(throwsOutOfRange([&] { d.compare(l, r, 0, 1); }));
    }
    assert(throwsOutOfRange([&] { d.equal(1, 2, 3); }));
    assert(throwsOutOfRange([&] { d.equal(-1, 0, 1); }));
    assert(throwsInvalid([&] { d.equal(0, 0, -1); }));
    assert(throwsOutOfRange([&] { d.lcp(5, 0); }));
    assert(throwsOutOfRange([&] { h.lcp(0, -1); }));
    assert(throwsInvalid([&] { d.countDistinct(-1); }));
    assert(throwsInvalid([&] { thueMorsePair(-1); }));
    assert(throwsInvalid([&] { thueMorsePair(31); }));
}

void testSmallModulusCollisions() {
    // base 31, mod 101: "abra" and "brac" share hash 57, so one distinct count is wrong.
    PolynomialHash h("abracadabra", 31, 101);
    assert(h.get(0, 4) == 57);
    assert(h.get(1, 5) == 57);
    assert(h.countDistinct(4) == 6);
    assert(DoubleHash("abracadabra").countDistinct(4) == 7);
    // base 7, mod 11: "abra" and "cada" collide, and the binary search reports lcp 4, not 0.
    PolynomialHash tiny("abracadabra", 7, 11);
    assert(tiny.lcp(0, 4) == 4);
    assert(DoubleHash("abracadabra").lcp(0, 4) == 0);
}

void testOnePairHasAtMostNMinus1BadBases() {
    std::mt19937 rng(9);
    const uint64_t mod = 1009;
    for (int t = 0; t < 100; t++) {
        int n = std::uniform_int_distribution<int>(1, 10)(rng);
        std::string x = randomString(rng, "ab", n, n);
        std::string y = randomString(rng, "ab", n, n);
        if (x == y) continue;
        int bad = 0;
        for (uint64_t b = 1; b < mod; b++) bad += polynomialHash(x, b, mod) == polynomialHash(y, b, mod);
        assert(bad <= n - 1);
    }
}

void testThueMorseBreaksHashingModulo2To64() {
    auto [a, b] = thueMorsePair(10);
    assert(a.size() == 1024);
    assert(a != b);
    assert(thueMorsePair(3) == std::make_pair(std::string("abbabaab"), std::string("baababba")));
    std::mt19937_64 rng(11);
    std::vector<uint64_t> bases = {1, 3, 31, 131, BASE1, BASE2, ~0ULL};
    for (int k = 0; k < 200; k++) bases.push_back(rng() | 1);
    for (uint64_t base : bases) assert(overflowHash(a, base) == overflowHash(b, base));
    assert(overflowHash("abracadabra", 131) == 6494918133703025106ULL);
    assert(DoubleHash(a).get(0, 1024) != DoubleHash(b).get(0, 1024));
    // Length 512 is not enough for every base.
    auto [a9, b9] = thueMorsePair(9);
    assert(overflowHash(a9, 3) != overflowHash(b9, 3));
}

void testEvenBaseKeepsOnlyTheLast64Characters() {
    std::string x = "x" + std::string(64, 'a');
    std::string y = "y" + std::string(64, 'a');
    for (uint64_t base : {2ULL, 256ULL, 1000ULL, 1ULL << 32}) assert(overflowHash(x, base) == overflowHash(y, base));
    assert(overflowHash(x, 131) != overflowHash(y, 131));
}

int main() {
    testMississippiTables();
    testDoubleHashValues();
    testLargestModulusValues();
    testEverySubstringAgainstTheDefinition();
    testQueriesAgainstBruteForce();
    testPolynomialHashQueries();
    testEmptyString();
    testOneCharacter();
    testAllCharactersEqual();
    testBytesOutsideAscii();
    testLargestRanges();
    testErrors();
    testSmallModulusCollisions();
    testOnePairHasAtMostNMinus1BadBases();
    testThueMorseBreaksHashingModulo2To64();
    testEvenBaseKeepsOnlyTheLast64Characters();
    std::cout << "All string hashing tests passed.\n";
    return 0;
}
