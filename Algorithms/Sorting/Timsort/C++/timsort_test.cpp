/**
 * Test cases for Timsort (C++): minrun against CPython's rule, runs, binary insertion, the
 * gallop searches against std::lower_bound and std::upper_bound, random and structured arrays
 * against std::stable_sort with a payload, the stack invariants after every collapse,
 * galloping on and off, and comparison counts pinned to the Python outputs.
 */

#include <algorithm>
#include <cassert>
#include <cstdint>
#include <iostream>
#include <limits>
#include <random>
#include <string>
#include <vector>

#include "timsort.cpp"

// A key with a payload; operator< compares the keys only and counts its calls.
struct Counted {
    int key;
    int tag;
    static long long comparisons;
    bool operator<(const Counted& o) const {
        ++comparisons;
        return key < o.key;
    }
};
long long Counted::comparisons = 0;

std::vector<Counted> tagged(const std::vector<int>& values) {
    std::vector<Counted> out;
    for (std::size_t i = 0; i < values.size(); ++i) out.push_back({values[i], static_cast<int>(i)});
    return out;
}

// Sorts a tagged copy of values and checks it against std::stable_sort, payload included.
// Returns the comparisons.
long long countSort(const std::vector<int>& values, bool gallop = true, std::size_t minrun = 0) {
    std::vector<Counted> arr = tagged(values);
    std::vector<Counted> expected = arr;
    std::stable_sort(expected.begin(), expected.end(), [](const Counted& x, const Counted& y) { return x.key < y.key; });
    Counted::comparisons = 0;
    timsort(arr, gallop, minrun);
    long long c = Counted::comparisons;
    for (std::size_t i = 0; i < arr.size(); ++i) assert(arr[i].key == expected[i].key && arr[i].tag == expected[i].tag);
    return c;
}

// The pseudo-random arrays of the Python test (lcg_values): a 64-bit LCG, top bits.
std::vector<int> lcgValues(std::uint64_t seed, int n, std::uint64_t mod) {
    std::vector<int> out;
    std::uint64_t x = seed;
    for (int i = 0; i < n; ++i) {
        x = x * 6364136223846793005ULL + 1442695040888963407ULL;
        out.push_back(static_cast<int>((x >> 33) % mod));
    }
    return out;
}

// pinned_input of the Python test: lcgValues plus drift * index, and with block > 0 every
// block sorted, ascending in even blocks and descending in odd ones.
std::vector<int> pinnedInput(std::uint64_t seed, int n, std::uint64_t mod, int drift, int block) {
    std::vector<int> v = lcgValues(seed, n, mod);
    for (int i = 0; i < n; ++i) v[i] += drift * i;
    if (block > 0) {
        for (int start = 0; start < n; start += block) {
            auto first = v.begin() + start, last = v.begin() + std::min(n, start + block);
            std::sort(first, last);
            if ((start / block) % 2) std::reverse(first, last);
        }
    }
    return v;
}

// The structured inputs of the README.
std::vector<std::vector<int>> shapes(int n, std::mt19937& rng) {
    std::vector<std::vector<int>> out;
    std::vector<int> perm(n);
    for (int i = 0; i < n; ++i) perm[i] = i;
    std::vector<int> random = perm;
    std::shuffle(random.begin(), random.end(), rng);
    out.push_back(random);
    out.push_back(perm);  // sorted
    std::vector<int> reversed(perm.rbegin(), perm.rend());
    out.push_back(reversed);
    std::vector<int> four = random;
    int quarter = std::max(1, n / 4);
    for (int s = 0; s < n; s += quarter) std::sort(four.begin() + s, four.begin() + std::min(n, s + quarter));
    out.push_back(four);
    std::vector<int> saw(n);
    for (int i = 0; i < n; ++i) saw[i] = i % 100;
    out.push_back(saw);
    std::vector<int> organ;
    for (int i = 0; i < n / 2; ++i) organ.push_back(i);
    for (int i = n - n / 2; i > 0; --i) organ.push_back(i);
    out.push_back(organ);
    // Long runs: 0..n-1 cut into 20 blocks at random points, the blocks shuffled.
    std::vector<int> cuts = {0, n};
    if (n > 20) {
        std::vector<int> inner(perm.begin() + 1, perm.end());
        std::shuffle(inner.begin(), inner.end(), rng);
        cuts.insert(cuts.end(), inner.begin(), inner.begin() + 19);
    }
    std::sort(cuts.begin(), cuts.end());
    std::vector<std::vector<int>> pieces;
    for (std::size_t i = 0; i + 1 < cuts.size(); ++i) pieces.emplace_back(perm.begin() + cuts[i], perm.begin() + cuts[i + 1]);
    std::shuffle(pieces.begin(), pieces.end(), rng);
    std::vector<int> longRuns;
    for (const auto& piece : pieces) longRuns.insert(longRuns.end(), piece.begin(), piece.end());
    out.push_back(longRuns);
    return out;
}
const int kLongRuns = 6;  // index of the long-runs shape

// ---------------------------------------------------------------- minrun

std::size_t cpythonFormula(std::uint64_t n) {
    if (n < 64) return n;
    int shift = 0;
    while ((n >> shift) >= 64) ++shift;
    return (n >> shift) + ((n & ((std::uint64_t{1} << shift) - 1)) ? 1 : 0);
}

void testMinrun() {
    for (std::uint64_t n = 0; n < 70000; ++n) assert(computeMinrun(n) == cpythonFormula(n));
    std::mt19937_64 rng(64);
    for (int t = 0; t < 2000; ++t) {
        std::uint64_t n = rng() >> 1;
        assert(computeMinrun(n) == cpythonFormula(n));
    }
    for (int k = 6; k < 63; ++k) assert(computeMinrun(std::size_t{1} << k) == 32);
    assert(computeMinrun(0) == 0 && computeMinrun(63) == 63 && computeMinrun(65) == 33);
    assert(computeMinrun(100) == 50 && computeMinrun(1000) == 63 && computeMinrun(2112) == 33);
    assert(computeMinrun(1000000) == 62);
    std::cout << "OK testMinrun" << std::endl;
}

// ---------------------------------------------------------------- runs and searches

void testCountRun() {
    struct Case {
        std::vector<int> values;
        std::size_t length;
        bool descending;
    };
    const std::vector<Case> cases = {
        {{5}, 1, false},       {{1, 2}, 2, false},          {{2, 1}, 2, true},
        {{2, 2}, 2, false},    {{1, 2, 2, 3, 1}, 4, false}, {{5, 4, 3, 3, 1}, 3, true},
        {{5, 4, 3, 2, 1}, 5, true}, {{3, 3, 3, 2}, 3, false},
    };
    for (const Case& c : cases) {
        RunInfo r = countRun(c.values, 0, c.values.size());
        assert(r.length == c.length && r.descending == c.descending);
    }
    RunInfo r = countRun(std::vector<int>{9, 1, 2, 3, 0}, 1, 5);
    assert(r.length == 3 && !r.descending);
    std::vector<Counted> asc = tagged(std::vector<int>{0, 1, 2, 3, 4, 5, 6, 7, 8, 9});
    Counted::comparisons = 0;
    assert(countRun(asc, 0, asc.size()).length == 10 && Counted::comparisons == 9);
    std::cout << "OK testCountRun" << std::endl;
}

void testBinaryInsertionSort() {
    std::mt19937 rng(3);
    for (int t = 0; t < 300; ++t) {
        int n = 1 + static_cast<int>(rng() % 40);
        int start = static_cast<int>(rng() % (n + 1));
        std::vector<int> values(n);
        for (int& v : values) v = static_cast<int>(rng() % 10);
        std::sort(values.begin(), values.begin() + start);
        std::vector<Counted> arr = tagged(values);
        std::vector<Counted> expected = arr;
        std::stable_sort(expected.begin(), expected.end(), [](const Counted& x, const Counted& y) { return x.key < y.key; });
        binaryInsertionSort(arr, 0, arr.size(), start);
        for (int i = 0; i < n; ++i) assert(arr[i].key == expected[i].key && arr[i].tag == expected[i].tag);
    }
    std::vector<int> part = {9, 9, 1, 4, 7, 3, 0, 9, 9};
    binaryInsertionSort(part, 2, 7, 5);
    assert((part == std::vector<int>{9, 9, 0, 1, 3, 4, 7, 9, 9}));
    std::cout << "OK testBinaryInsertionSort" << std::endl;
}

void testGallop() {
    std::mt19937 rng(5);
    for (int t = 0; t < 300; ++t) {
        int n = 1 + static_cast<int>(rng() % 40);
        std::vector<int> a(n);
        for (int& v : a) v = static_cast<int>(rng() % 16);
        std::sort(a.begin(), a.end());
        std::size_t pad = rng() % 4;
        std::vector<int> padded(pad, -1);
        padded.insert(padded.end(), a.begin(), a.end());
        padded.push_back(99);
        for (int key = -1; key <= 16; ++key) {
            std::size_t left = std::lower_bound(a.begin(), a.end(), key) - a.begin();
            std::size_t right = std::upper_bound(a.begin(), a.end(), key) - a.begin();
            for (int hint = 0; hint < n; ++hint) {
                assert(gallopLeft(key, padded, pad, n, hint) == left);
                assert(gallopRight(key, padded, pad, n, hint) == right);
            }
        }
    }
    // From hint 0, position i costs 2 floor(log2(i)) + 2 comparisons (1 for i = 0).
    std::vector<Counted> a;
    for (int i = 0; i < 4096; ++i) a.push_back({2 * i, i});
    for (std::size_t i = 0; i < 2048; ++i) {
        std::size_t lg = 0;
        while ((i >> (lg + 1)) > 0) ++lg;
        long long expected = i == 0 ? 1 : 2 * static_cast<long long>(lg) + 2;
        Counted key{2 * static_cast<int>(i) - 1, -1};
        Counted::comparisons = 0;
        assert(gallopLeft(key, a, 0, a.size(), 0) == i && Counted::comparisons == expected);
        Counted::comparisons = 0;
        assert(gallopRight(key, a, 0, a.size(), 0) == i && Counted::comparisons == expected);
    }
    std::cout << "OK testGallop" << std::endl;
}

// ---------------------------------------------------------------- sorting

void testEdgeCases() {
    const std::vector<std::vector<int>> cases = {
        {}, {42}, {2, 1}, {1, 2}, {64, 34, 25, 12, 22, 11, 90}, {3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5},
        {5, 5, 5, 5, 5, 5}, {3, -1, 3, 0, -1, 2, 2},
        {std::numeric_limits<int>::max(), std::numeric_limits<int>::min(), 0, -1}};
    for (const auto& values : cases) {
        for (std::size_t minrun : {0, 1, 2, 4, 32}) {
            std::vector<int> arr = values, expected = values;
            std::sort(expected.begin(), expected.end());
            timsort(arr, true, minrun);
            assert(arr == expected);
        }
    }
    std::vector<double> d = {2.5, -1.0, 2.5, 0.0, 1e9};
    timsort(d);
    assert((d == std::vector<double>{-1.0, 0.0, 2.5, 2.5, 1e9}));
    std::vector<std::string> words = {"pear", "fig", "apple", "kiwi", "date", "plum", "fig"};
    timsort(words);
    assert(std::is_sorted(words.begin(), words.end()));
    // A strictly descending run is reversed; equal keys stay out of it, so order is kept.
    std::vector<Counted> arr = tagged({5, 4, 3, 3, 3, 1, 0});
    timsort(arr);
    std::string tags;
    for (const Counted& c : arr) tags += std::to_string(c.tag);
    assert(tags == "6523410");
    std::cout << "OK testEdgeCases" << std::endl;
}

void testRandomAgainstStableSort() {
    std::mt19937 rng(20261124);
    const int spreads[] = {1, 3, 10, 1000, 1000000000};
    const std::size_t minruns[] = {0, 0, 0, 1, 3, 8};
    for (int t = 0; t < 1500; ++t) {
        int pick = static_cast<int>(rng() % 3);
        int n = pick == 0 ? static_cast<int>(rng() % 71) : pick == 1 ? 64 + static_cast<int>(rng() % 637) : 700 + static_cast<int>(rng() % 2301);
        int spread = spreads[rng() % 5];
        std::vector<int> values(n);
        for (int& v : values) v = static_cast<int>(rng() % (static_cast<unsigned>(spread) + 1));
        countSort(values, t % 2 == 0, minruns[rng() % 6]);  // asserts order and payload
    }
    std::cout << "OK testRandomAgainstStableSort" << std::endl;
}

void testStructuredInputs() {
    std::mt19937 rng(7);
    for (int n : {0, 1, 2, 3, 63, 64, 65, 1000, 4097, 20000}) {
        for (const auto& values : shapes(n, rng)) {
            std::vector<int> dups = values;
            for (int& v : dups) v /= 7;
            for (bool gallop : {true, false}) {
                countSort(values, gallop);
                countSort(dups, gallop);
            }
        }
    }
    std::cout << "OK testStructuredInputs" << std::endl;
}

void testGallopingOnAndOffGiveTheSameOutput() {
    std::mt19937 rng(11);
    for (int n : {100, 1000, 5000}) {
        for (auto values : shapes(n, rng)) {
            for (int& v : values) v /= 3;
            std::vector<Counted> on = tagged(values), off = tagged(values);
            timsort(on, true);
            timsort(off, false);
            for (std::size_t i = 0; i < on.size(); ++i) assert(on[i].tag == off[i].tag);
        }
    }
    std::cout << "OK testGallopingOnAndOffGiveTheSameOutput" << std::endl;
}

// ---------------------------------------------------------------- the merge stack

void testInvariantsAfterEveryCollapse() {
    std::mt19937 rng(17);
    for (int n : {100, 1000, 5000, 30000}) {
        for (const auto& values : shapes(n, rng)) {
            for (std::size_t minrun : {0, 1, 2, 5}) {
                std::vector<int> arr = values;
                int collapses = 0;
                timsort(arr, true, minrun, [&](const std::vector<Run>& runs) {
                    ++collapses;
                    assert(invariantsHold(runs));
                    std::size_t base = 0;
                    for (const Run& r : runs) {
                        assert(r.base == base);  // side by side from index 0
                        assert(std::is_sorted(arr.begin() + r.base, arr.begin() + r.base + r.length));
                        base += r.length;
                    }
                });
                assert(std::is_sorted(arr.begin(), arr.end()));
                assert(n == 0 || collapses > 0);
            }
        }
    }
    std::cout << "OK testInvariantsAfterEveryCollapse" << std::endl;
}

// Runs of 240, 160, 50, 40 and 60: the corrected rule merges them all when 60 arrives (the
// pre-2015 rule would stop at 240, 160, 90, 60, which breaks 240 > 160 + 90).
void testTheFourthRunCheck() {
    const int lengths[] = {240, 160, 50, 40, 60};
    std::vector<int> values;
    for (int j = 0; j < 5; ++j) {
        for (int k = 0; k < lengths[j]; ++k) values.push_back((5 - j) * 1000 + k);
    }
    assert(computeMinrun(values.size()) == 35);
    std::vector<std::vector<std::size_t>> stacks;
    timsort(values, true, 0, [&](const std::vector<Run>& runs) {
        std::vector<std::size_t> s;
        for (const Run& r : runs) s.push_back(r.length);
        stacks.push_back(s);
    });
    assert((stacks == std::vector<std::vector<std::size_t>>{{240}, {240, 160}, {240, 160, 50}, {240, 160, 50, 40}, {550}}));
    assert(!invariantsHold({{0, 240}, {240, 160}, {400, 90}, {490, 60}}));
    assert(std::is_sorted(values.begin(), values.end()));
    std::cout << "OK testTheFourthRunCheck" << std::endl;
}

void testStackStaysLogarithmic() {
    std::mt19937 rng(19);
    for (int n : {1000, 30000}) {
        std::size_t bound = 2;
        for (long long a = 1, b = 1; b <= n; ++bound) {
            long long c = a + b;
            a = b;
            b = c;
        }
        std::vector<int> values(n);
        for (int& v : values) v = static_cast<int>(rng() % 4);
        std::size_t height = 0;
        timsort(values, true, 1, [&](const std::vector<Run>& runs) { height = std::max(height, runs.size()); });
        assert(height <= bound);
    }
    std::cout << "OK testStackStaysLogarithmic" << std::endl;
}

// ---------------------------------------------------------------- merges

void testMerges() {
    auto mergeTwo = [](const std::vector<int>& left, const std::vector<int>& right, bool gallop,
                       std::vector<Counted>& arr) {
        std::vector<int> both = left;
        both.insert(both.end(), right.begin(), right.end());
        arr = tagged(both);
        MergeState<Counted> ms(arr, gallop);
        ms.pending = {{0, left.size()}, {left.size(), right.size()}};
        Counted::comparisons = 0;
        mergeAt(ms, 0);
        assert(ms.pending.size() == 1 && ms.pending[0].length == both.size());
        return ms.minGallop;
    };
    std::mt19937 rng(23);
    for (int t = 0; t < 2000; ++t) {
        std::vector<int> left(1 + rng() % 30), right(1 + rng() % 30);
        for (int& v : left) v = static_cast<int>(rng() % 7);
        for (int& v : right) v = static_cast<int>(rng() % 7);
        std::sort(left.begin(), left.end());
        std::sort(right.begin(), right.end());
        for (bool gallop : {true, false}) {
            std::vector<Counted> arr;
            mergeTwo(left, right, gallop, arr);
            for (std::size_t i = 1; i < arr.size(); ++i) {
                assert(arr[i - 1].key < arr[i].key || (arr[i - 1].key == arr[i].key && arr[i - 1].tag < arr[i].tag));
            }
        }
    }
    // Blocks of 10 and 90 values take turns: min_gallop falls to 1, and galloping saves.
    std::vector<int> tens, nineties;
    for (int k = 0; k < 20; ++k) {
        for (int j = 0; j < 10; ++j) tens.push_back(k * 100 + j);
        for (int j = 0; j < 90; ++j) nineties.push_back(k * 100 + 10 + j);
    }
    std::vector<Counted> arr;
    assert(mergeTwo(tens, nineties, true, arr) == 1);  // mergeLo
    long long withGallop = Counted::comparisons;
    assert(mergeTwo(tens, nineties, false, arr) == kMinGallop);
    assert(withGallop == 437 && Counted::comparisons == 1911);
    assert(mergeTwo(nineties, tens, true, arr) == 1);  // mergeHi
    assert(Counted::comparisons == 439);
    mergeTwo(nineties, tens, false, arr);
    assert(Counted::comparisons == 1991);
    std::cout << "OK testMerges" << std::endl;
}

// ---------------------------------------------------------------- counted work

void testCounts() {
    for (int n : {1, 2, 3, 63, 64, 65, 100, 129, 1000, 4096, 65537, 100000}) {
        std::vector<int> sorted(n), descending(n), equal(n, 5);
        for (int i = 0; i < n; ++i) {
            sorted[i] = i;
            descending[i] = n - i;
        }
        assert(countSort(sorted) == n - 1);
        assert(countSort(descending) == n - 1);
        assert(countSort(equal) == n - 1);
    }
    assert(countSort({}) == 0 && countSort({7}) == 0);
    // Long runs: galloping makes fewer than half the comparisons.
    std::mt19937 rng(12);
    for (int n : {2000, 20000}) {
        std::vector<int> values = shapes(n, rng)[kLongRuns];
        assert(countSort(values, true) * 2 < countSort(values, false));
    }
    std::cout << "OK testCounts" << std::endl;
}

// ---------------------------------------------------------------- agreement with Python

struct PythonCase {
    std::uint64_t seed;
    int n;
    std::uint64_t mod;
    int drift, block;
    std::size_t minrun;
    long long withGallop, without;
};

// Comparisons counted on the Python implementation (timsort_test.py, PINNED) for the arrays
// pinnedInput(seed, n, mod, drift, block).
const std::vector<PythonCase> kPythonCases = {
    {1, 0, 10, 0, 0, 0, 0, 0},
    {2, 1, 10, 0, 0, 0, 0, 0},
    {3, 2, 10, 0, 0, 0, 1, 1},
    {4, 5, 3, 0, 0, 0, 8, 8},
    {5, 12, 100, 0, 0, 4, 35, 35},
    {6, 16, 1000, 1, 4, 2, 39, 39},
    {7, 24, 4, 0, 0, 4, 91, 91},
    {8, 32, 1000, 50, 8, 4, 98, 98},
    {9, 63, 1000000, 0, 0, 0, 295, 295},
    {10, 64, 1000000, 0, 0, 0, 299, 299},
    {11, 65, 1000000, 0, 0, 0, 305, 305},
    {12, 100, 2, 0, 0, 0, 441, 453},
    {13, 128, 1000, 0, 32, 0, 491, 489},
    {14, 200, 1000, 5, 40, 0, 886, 884},
    {15, 255, 10, 0, 0, 0, 1564, 1637},
    {16, 256, 1000000, 0, 0, 0, 1716, 1716},
    {17, 300, 1000, 20, 100, 0, 730, 794},
    {18, 500, 1000000, 0, 0, 0, 3816, 3815},
    {19, 500, 1000, 0, 250, 0, 1955, 2147},
    {20, 640, 100, 3, 64, 0, 2196, 2289},
    {21, 1000, 1000000, 0, 0, 0, 8624, 8624},
    {22, 1000, 7, 0, 0, 0, 6285, 8040},
    {23, 1000, 1000000, 0, 77, 0, 4975, 4973},
    {24, 1000, 1000, 10, 50, 0, 4970, 5021},
    {25, 1000, 50, 1, 333, 0, 2695, 3145},
    {26, 1024, 1000000, 0, 0, 0, 8897, 8895},
    {27, 2000, 1000000, 0, 0, 0, 19269, 19264},
    {28, 2000, 1000, 100, 200, 0, 3028, 3439},
    {29, 2112, 1000000, 0, 0, 0, 20543, 20542},
    {30, 2500, 3, 0, 500, 0, 2769, 5709},
    {31, 3000, 1000000, 0, 1000, 0, 7990, 7992},
    {32, 3000, 1000000, 0, 0, 16, 31235, 31233},
    {33, 4096, 1000000, 0, 0, 0, 43833, 43830},
    {34, 4096, 100, 2, 128, 0, 12580, 14521},
    {35, 5000, 1000000, 0, 0, 0, 54951, 54948},
    {36, 5000, 1000, 1000, 5000, 0, 4999, 4999},
    {37, 5000, 1000000, 0, 0, 1, 58365, 58393},
    {38, 5000, 10, 0, 0, 0, 35244, 51217},
    {39, 6000, 1000, 50, 600, 0, 8705, 12877},
    {40, 8192, 1000000, 0, 0, 0, 95860, 95856},
};

void testAgreementWithPython() {
    for (std::size_t i = 0; i < kPythonCases.size(); ++i) {
        const PythonCase& p = kPythonCases[i];
        std::vector<int> values = pinnedInput(p.seed, p.n, p.mod, p.drift, p.block);
        long long on = countSort(values, true, p.minrun);
        long long off = countSort(values, false, p.minrun);
        bool same = on == p.withGallop && off == p.without;
        if (!same) std::cerr << "agreement case " << i << " differs from Python: " << on << ' ' << off << '\n';
        assert(same);
    }
    std::cout << "OK testAgreementWithPython (" << kPythonCases.size() << " cases)" << std::endl;
}

int main() {
    std::cout << "Running Timsort tests..." << std::endl;
    testMinrun();
    testCountRun();
    testBinaryInsertionSort();
    testGallop();
    testEdgeCases();
    testRandomAgainstStableSort();
    testStructuredInputs();
    testGallopingOnAndOffGiveTheSameOutput();
    testInvariantsAfterEveryCollapse();
    testTheFourthRunCheck();
    testStackStaysLogarithmic();
    testMerges();
    testCounts();
    testAgreementWithPython();
    std::cout << "All tests passed!" << std::endl;
    return 0;
}
