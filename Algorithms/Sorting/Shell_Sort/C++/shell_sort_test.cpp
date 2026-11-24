/**
 * Test cases for Shell Sort (C++): the gap sequences, edge cases and random arrays against
 * std::sort for every sequence, h-sorted passes, the instability example, errors, and
 * comparison counts pinned to the Python outputs.
 */

#include <algorithm>
#include <cassert>
#include <cstdint>
#include <iostream>
#include <limits>
#include <random>
#include <stdexcept>
#include <string>
#include <vector>

#include "shell_sort.cpp"

using Gaps = std::vector<std::size_t>;

const Sequence kAll[] = {Sequence::Shell, Sequence::Knuth, Sequence::Ciura};

// Counts calls to operator> (comparisons) and the calls that return true: hSort shifts an
// element exactly when arr[j - gap] > key, so the second counter is the number of shifts.
struct Counted {
    int value;
    static long long comparisons;
    static long long shifts;
    bool operator>(const Counted& o) const {
        ++comparisons;
        bool result = value > o.value;
        if (result) ++shifts;
        return result;
    }
};
long long Counted::comparisons = 0;
long long Counted::shifts = 0;

struct Counts {
    long long comparisons;
    long long shifts;
};

Counts countSort(const std::vector<int>& values, Sequence seq) {
    std::vector<Counted> arr;
    for (int v : values) arr.push_back({v});
    Counted::comparisons = Counted::shifts = 0;
    shellSort(arr, seq);
    std::vector<int> expected = values;
    std::sort(expected.begin(), expected.end());
    for (std::size_t i = 0; i < arr.size(); ++i) assert(arr[i].value == expected[i]);
    return {Counted::comparisons, Counted::shifts};
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

// Shell's bad case for n a power of 2: 1, n/2 + 1, 2, n/2 + 2, ...
std::vector<int> badInput(int n) {
    std::vector<int> out;
    for (int i = 0; i < n / 2; ++i) {
        out.push_back(i + 1);
        out.push_back(n / 2 + i + 1);
    }
    return out;
}

bool isHSorted(const std::vector<int>& arr, std::size_t h) {
    for (std::size_t i = 0; i + h < arr.size(); ++i) {
        if (arr[i] > arr[i + h]) return false;
    }
    return true;
}

// ---------------------------------------------------------------- gap sequences

struct GapCase {
    std::size_t n;
    Gaps shell, knuth, ciura;
};

// Computed by the Python implementation (gap_sequence).
const std::vector<GapCase> kGapCases = {
    {0, {}, {}, {}},
    {1, {}, {}, {}},
    {2, {1}, {1}, {1}},
    {5, {2, 1}, {4, 1}, {4, 1}},
    {11, {5, 2, 1}, {4, 1}, {10, 4, 1}},
    {24, {12, 6, 3, 1}, {13, 4, 1}, {23, 10, 4, 1}},
    {100, {50, 25, 12, 6, 3, 1}, {40, 13, 4, 1}, {57, 23, 10, 4, 1}},
    {702, {351, 175, 87, 43, 21, 10, 5, 2, 1}, {364, 121, 40, 13, 4, 1}, {701, 301, 132, 57, 23, 10, 4, 1}},
    {1578, {789, 394, 197, 98, 49, 24, 12, 6, 3, 1}, {1093, 364, 121, 40, 13, 4, 1}, {1577, 701, 301, 132, 57, 23, 10, 4, 1}},
    {100000, {50000, 25000, 12500, 6250, 3125, 1562, 781, 390, 195, 97, 48, 24, 12, 6, 3, 1}, {88573, 29524, 9841, 3280, 1093, 364, 121, 40, 13, 4, 1}, {90927, 40412, 17961, 7983, 3548, 1577, 701, 301, 132, 57, 23, 10, 4, 1}},
    {1000000, {500000, 250000, 125000, 62500, 31250, 15625, 7812, 3906, 1953, 976, 488, 244, 122, 61, 30, 15, 7, 3, 1}, {797161, 265720, 88573, 29524, 9841, 3280, 1093, 364, 121, 40, 13, 4, 1}, {460316, 204585, 90927, 40412, 17961, 7983, 3548, 1577, 701, 301, 132, 57, 23, 10, 4, 1}},
};

void testGapSequences() {
    for (const GapCase& c : kGapCases) {
        assert(shellGaps(c.n) == c.shell);
        assert(knuthGaps(c.n) == c.knuth);
        assert(ciuraGaps(c.n) == c.ciura);
        assert(gapSequence(c.n, Sequence::Shell) == c.shell);
        assert(gapSequence(c.n, Sequence::Knuth) == c.knuth);
        assert(gapSequence(c.n) == c.ciura);  // Ciura's is the default
    }
    for (std::size_t n = 0; n < 3000; ++n) {
        for (Sequence seq : kAll) {
            Gaps gaps = gapSequence(n, seq);
            if (n < 2) {
                assert(gaps.empty());
                continue;
            }
            assert(gaps.back() == 1 && gaps.front() < n);
            for (std::size_t i = 1; i < gaps.size(); ++i) assert(gaps[i - 1] > gaps[i]);
        }
    }
    std::cout << "OK testGapSequences" << std::endl;
}

// The extension is floor(2.25 h), and no sequence overflows, even for n near the largest
// size_t: every gap stays below n, the gaps decrease and the last one is 1.
void testGapsAtTheLimit() {
    const std::size_t big = std::numeric_limits<std::size_t>::max();
    const std::size_t limits[] = {big, big - 1, big / 2 + 1, big / 2, 4940934027514224368ULL,
                                  11117101561907004826ULL};
    for (std::size_t n : limits) {
        for (Sequence seq : kAll) {
            Gaps gaps = gapSequence(n, seq);
            assert(gaps.front() < n && gaps.back() == 1);
            for (std::size_t i = 1; i < gaps.size(); ++i) assert(gaps[i - 1] > gaps[i]);
        }
        Gaps ciura = ciuraGaps(n);
        std::reverse(ciura.begin(), ciura.end());
        assert(ciura.size() > 40 && ciura[7] == 701 && ciura[8] == 1577);
        for (std::size_t i = 8; i < ciura.size(); ++i) assert(ciura[i] == 2 * ciura[i - 1] + ciura[i - 1] / 4);
        assert(ciura.back() > n / 3);  // the largest term below n is used
        Gaps knuth = knuthGaps(n);
        for (std::size_t i = 1; i < knuth.size(); ++i) assert(knuth[i - 1] == 3 * knuth[i] + 1);
        assert(knuth.front() > n / 4);
    }
    std::cout << "OK testGapsAtTheLimit" << std::endl;
}

// ---------------------------------------------------------------- sorting

void testEdgeCases() {
    std::vector<std::vector<int>> cases = {
        {}, {42}, {2, 1}, {3, -1, 3, 0, -1, 2, 2}, {5, 5, 5, 5, 5, 5},
        {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12}, {12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1},
        {3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5}, {98, 69, 74, 79, 60, 91, 41, 99, 18, 63, 93, 38},
        {std::numeric_limits<int>::max(), std::numeric_limits<int>::min(), 0, -1}};
    for (Sequence seq : kAll) {
        for (std::vector<int> arr : cases) {
            std::vector<int> expected = arr;
            std::sort(expected.begin(), expected.end());
            shellSort(arr, seq);
            assert(arr == expected);
        }
    }
    std::vector<double> d = {2.5, -1.0, 2.5, 0.0, 1e9};
    shellSort(d);
    assert((d == std::vector<double>{-1.0, 0.0, 2.5, 2.5, 1e9}));
    std::vector<std::string> words = {"pear", "fig", "apple", "kiwi", "date", "plum"};
    shellSort(words, Sequence::Knuth);
    assert(std::is_sorted(words.begin(), words.end()));
    std::cout << "OK testEdgeCases" << std::endl;
}

void testRandomAgainstStdSort() {
    std::mt19937 rng(20261124);
    for (Sequence seq : kAll) {
        for (int t = 0; t < 400; ++t) {
            int n = static_cast<int>(rng() % 151);
            int spread = std::vector<int>{2, 10, 1000, 1000000000}[rng() % 4];
            std::vector<int> arr(n);
            for (int& v : arr) v = static_cast<int>(rng() % (2ULL * spread + 1)) - spread;
            std::vector<int> expected = arr;
            std::sort(expected.begin(), expected.end());
            shellSort(arr, seq);
            assert(arr == expected);
        }
        for (int n : {1000, 5000, 20000}) {
            std::vector<int> arr(n);
            for (int& v : arr) v = static_cast<int>(rng() % (n + 1));
            std::vector<int> expected = arr;
            std::sort(expected.begin(), expected.end());
            shellSort(arr, seq);
            assert(arr == expected);
        }
    }
    std::cout << "OK testRandomAgainstStdSort" << std::endl;
}

// shellSort is hSort over gapSequence; after each pass the array is h-sorted for that gap
// and still for every earlier one.
void testEachPassLeavesTheArrayHSorted() {
    std::mt19937 rng(4);
    for (Sequence seq : kAll) {
        for (int n : {0, 1, 2, 3, 10, 57, 200, 1000, 3000}) {
            std::vector<int> arr(n);
            for (int& v : arr) v = static_cast<int>(rng() % 51);
            std::vector<int> viaSort = arr;
            shellSort(viaSort, seq);
            Gaps done;
            for (std::size_t gap : gapSequence(arr.size(), seq)) {
                hSort(arr, gap);
                done.push_back(gap);
                for (std::size_t h : done) assert(isHSorted(arr, h));
            }
            assert(arr == viaSort);
        }
    }
    std::vector<int> ex = {98, 69, 74, 79, 60, 91, 41, 99, 18, 63, 93, 38};
    hSort(ex, 10);
    assert((ex == std::vector<int>{93, 38, 74, 79, 60, 91, 41, 99, 18, 63, 98, 69}));
    hSort(ex, 4);
    assert((ex == std::vector<int>{18, 38, 41, 69, 60, 63, 74, 79, 93, 91, 98, 99}));
    hSort(ex, 1);
    assert(std::is_sorted(ex.begin(), ex.end()));
    std::cout << "OK testEachPassLeavesTheArrayHSorted" << std::endl;
}

void testHSort() {
    std::vector<int> arr = {9, 8, 7, 6, 5, 4, 3, 2, 1, 0};
    hSort(arr, 3);
    assert((arr == std::vector<int>{0, 2, 1, 3, 5, 4, 6, 8, 7, 9}));
    std::vector<int> same = {5, 4, 3, 2, 1};
    for (std::size_t gap : {5, 6, 100}) {
        hSort(same, gap);
        assert((same == std::vector<int>{5, 4, 3, 2, 1}));
    }
    std::vector<int> empty;
    hSort(empty, 1);
    assert(empty.empty());
    std::cout << "OK testHSort" << std::endl;
}

void testErrors() {
    std::vector<int> arr = {3, 2, 1};
    bool threw = false;
    try {
        hSort(arr, 0);
    } catch (const std::invalid_argument&) {
        threw = true;
    }
    assert(threw);
    threw = false;
    try {
        shellSort(arr, static_cast<Sequence>(7));
    } catch (const std::invalid_argument& e) {
        threw = std::string(e.what()) == "unknown gap sequence 7";
    }
    assert(threw);
    std::cout << "OK testErrors" << std::endl;
}

// [2a, 2b, 2c, 2d, 1e]: the gap-4 pass swaps 2a and 1e, carrying 2a past its three twins.
void testNotStable() {
    struct Rec {
        int key;
        char tag;
        bool operator>(const Rec& o) const { return key > o.key; }
    };
    auto tags = [](const std::vector<Rec>& v) {
        std::string s;
        for (const Rec& r : v) s += r.tag;
        return s;
    };
    const std::vector<Rec> input = {{2, 'a'}, {2, 'b'}, {2, 'c'}, {2, 'd'}, {1, 'e'}};
    std::vector<Rec> arr = input;
    shellSort(arr);
    assert(tags(arr) == "ebcda");
    arr = input;
    shellSort(arr, Sequence::Knuth);
    assert(tags(arr) == "ebcda");
    arr = input;
    shellSort(arr, Sequence::Shell);
    assert(tags(arr) == "ebadc");
    arr = input;
    hSort(arr, 1);  // the gap-1 pass alone is insertion sort: stable
    assert(tags(arr) == "eabcd");
    std::cout << "OK testNotStable" << std::endl;
}

// ---------------------------------------------------------------- counted work

void testCounts() {
    // Sorted input: one comparison per element per pass, no shift. Fails when the inner loop
    // no longer stops at the first element that is not larger.
    for (Sequence seq : kAll) {
        for (int n : {1, 2, 10, 1000, 5000}) {
            std::vector<int> sorted(n);
            for (int i = 0; i < n; ++i) sorted[i] = i;
            long long expected = 0;
            for (std::size_t g : gapSequence(n, seq)) expected += n - static_cast<long long>(g);
            Counts c = countSort(sorted, seq);
            assert(c.comparisons == expected && c.shifts == 0);
        }
    }
    // Shell's gaps on the bad input: n(n - 2)/8 + (log2(n) - 1) n + 1 comparisons.
    for (int k = 2; k < 12; ++k) {
        long long n = 1LL << k;
        Counts c = countSort(badInput(static_cast<int>(n)), Sequence::Shell);
        assert(c.shifts == n * (n - 2) / 8);
        assert(c.comparisons == n * (n - 2) / 8 + (k - 1) * n + 1);
    }
    Counts knuth = countSort(badInput(1024), Sequence::Knuth);
    Counts ciura = countSort(badInput(1024), Sequence::Ciura);
    assert(knuth.comparisons == 9447 && knuth.shifts == 3912);
    assert(ciura.comparisons == 10621 && ciura.shifts == 4008);
    // The worked example.
    const std::vector<int> ex = {98, 69, 74, 79, 60, 91, 41, 99, 18, 63, 93, 38};
    Counts c = countSort(ex, Sequence::Ciura);
    assert(c.comparisons == 27 && c.shifts == 12);
    c = countSort(ex, Sequence::Knuth);
    assert(c.comparisons == 28 && c.shifts == 14);
    c = countSort(ex, Sequence::Shell);
    assert(c.comparisons == 38 && c.shifts == 18);
    std::cout << "OK testCounts" << std::endl;
}

// ---------------------------------------------------------------- agreement with Python

struct PythonCase {
    std::uint64_t seed;
    int n;
    std::uint64_t mod;
    Sequence seq;
    long long comparisons;
    long long shifts;
};

// Comparisons and shifts counted on the Python implementation (shell_sort_test.py, PINNED)
// for the arrays lcgValues(seed, n, mod).
const std::vector<PythonCase> kPythonCases = {
    {1, 0, 10, Sequence::Shell, 0, 0},
    {2, 1, 10, Sequence::Ciura, 0, 0},
    {3, 2, 10, Sequence::Knuth, 1, 1},
    {4, 5, 3, Sequence::Ciura, 6, 2},
    {5, 7, 100, Sequence::Shell, 15, 7},
    {6, 9, 5, Sequence::Knuth, 15, 6},
    {7, 12, 1000, Sequence::Ciura, 32, 16},
    {8, 16, 4, Sequence::Shell, 53, 6},
    {9, 20, 1000, Sequence::Knuth, 79, 45},
    {10, 24, 1000, Sequence::Ciura, 92, 45},
    {11, 31, 2, Sequence::Shell, 105, 15},
    {12, 33, 50, Sequence::Knuth, 131, 66},
    {13, 40, 1000, Sequence::Ciura, 229, 123},
    {14, 50, 7, Sequence::Shell, 285, 98},
    {15, 64, 1000, Sequence::Knuth, 386, 217},
    {16, 64, 1000, Sequence::Ciura, 386, 184},
    {17, 64, 1000, Sequence::Shell, 486, 191},
    {18, 100, 100, Sequence::Ciura, 676, 310},
    {19, 127, 1000000, Sequence::Knuth, 957, 564},
    {20, 128, 3, Sequence::Shell, 907, 172},
    {21, 200, 1000000, Sequence::Ciura, 1859, 977},
    {22, 255, 10, Sequence::Knuth, 1679, 674},
    {23, 256, 1000000, Sequence::Shell, 3435, 1763},
    {24, 300, 1000000, Sequence::Ciura, 2980, 1550},
    {25, 500, 1000000, Sequence::Knuth, 5693, 3436},
    {26, 500, 1000000, Sequence::Shell, 6145, 2898},
    {27, 701, 1000000, Sequence::Ciura, 8359, 4304},
    {28, 702, 1000000, Sequence::Ciura, 8622, 4584},
    {29, 1000, 1000000, Sequence::Shell, 14858, 7372},
    {30, 1000, 1000000, Sequence::Knuth, 14370, 9348},
    {31, 1000, 1000000, Sequence::Ciura, 13104, 6783},
    {32, 1000, 2, Sequence::Ciura, 7247, 610},
    {33, 1578, 1000000, Sequence::Ciura, 22481, 11861},
    {34, 2000, 1000000, Sequence::Shell, 34406, 17379},
    {35, 2000, 1000000, Sequence::Knuth, 33207, 21781},
    {36, 2000, 1000000, Sequence::Ciura, 29947, 15689},
    {37, 4096, 1000000, Sequence::Shell, 182694, 139731},
    {38, 4096, 1000000, Sequence::Knuth, 79480, 53326},
    {39, 4096, 1000000, Sequence::Ciura, 68653, 35909},
    {40, 5000, 100, Sequence::Ciura, 68396, 26992},
};

void testAgreementWithPython() {
    for (std::size_t i = 0; i < kPythonCases.size(); ++i) {
        const PythonCase& p = kPythonCases[i];
        Counts c = countSort(lcgValues(p.seed, p.n, p.mod), p.seq);
        bool same = c.comparisons == p.comparisons && c.shifts == p.shifts;
        if (!same) std::cerr << "agreement case " << i << " differs from Python\n";
        assert(same);
    }
    std::cout << "OK testAgreementWithPython (" << kPythonCases.size() << " cases)" << std::endl;
}

int main() {
    std::cout << "Running Shell Sort tests..." << std::endl;
    testGapSequences();
    testGapsAtTheLimit();
    testEdgeCases();
    testRandomAgainstStdSort();
    testEachPassLeavesTheArrayHSorted();
    testHSort();
    testErrors();
    testNotStable();
    testCounts();
    testAgreementWithPython();
    std::cout << "All tests passed!" << std::endl;
    return 0;
}
