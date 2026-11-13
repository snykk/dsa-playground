// Unit tests for the C++ bitmasking helpers.

#ifndef IS_TEST_BUILD
#define IS_TEST_BUILD
#endif
#include <cassert>
#include <climits>
#include <iostream>
#include <sstream>
#include "bitmasking.cpp"

// Runs f with std::cout captured and returns what it printed.
template <typename F>
static string capture(F f) {
    ostringstream out;
    streambuf* old = cout.rdbuf(out.rdbuf());
    f();
    cout.rdbuf(old);
    return out.str();
}

static int countLines(const string& s) {
    int lines = 0;
    for (char ch : s) if (ch == '\n') lines++;
    return lines;
}

void testBasicOps() {
    int mask = 0b10110;
    assert(getBit(mask, 1));
    assert(!getBit(mask, 0));
    assert(setBit(mask, 0) == 0b10111);
    assert(clearBit(mask, 1) == 0b10100);
    assert(toggleBit(mask, 4) == 0b00110);
    assert(countBits(mask) == 3);
    assert(lowestBit(mask) == 0b10);
    assert(clearLowestBit(mask) == 0b10100);
    assert(trailingZeros(mask) == 1);
    assert(leadingZeros(1) == 31);
}

void testZeroIsDefined() {
    // __builtin_ctz(0) / __builtin_clz(0) are undefined; the helpers return 32.
    assert(trailingZeros(0) == 32);
    assert(leadingZeros(0) == 32);
}

void testEnumerateSubsets() {
    string out = capture([] { enumerateSubsets(0b101); });
    assert(countLines(out) == 4);  // 101, 100, 001, 000
    assert(out.find("00000101") != string::npos);
    assert(out.find("00000000") != string::npos);
}

void testSubsetsOfSizeK() {
    string out = capture([] { subsetsOfSizeK(4, 2); });
    assert(countLines(out) == 6);
    assert(out.find("00000011") != string::npos);
    assert(out.find("00001100") != string::npos);
}

void testSubsetsOfSizeZero() {
    // Gosper's hack would divide by zero for k == 0.
    string out = capture([] { subsetsOfSizeK(4, 0); });
    assert(countLines(out) == 1);
    assert(out.find("00000000") != string::npos);
}

void testTsp() {
    vector<vector<int>> dist = {{0, 10, 15, 20}, {10, 0, 35, 25}, {15, 35, 0, 30}, {20, 25, 30, 0}};
    assert(tsp(dist) == 80);
    vector<vector<int>> two = {{0, 7}, {7, 0}};
    assert(tsp(two) == 14);
}

void testTspSingleCity() {
    vector<vector<int>> one = {{0}};
    assert(tsp(one) == 0);  // used to return 1000000000
    vector<vector<int>> none;
    assert(tsp(none) == 0);
}

void testCountSubsetSum() {
    vector<int> nums = {1, 2, 3, 4};
    assert(countSubsetSum(nums, 5) == 2);
}

void testPowerOfTwo() {
    assert(isPowerOf2(1) && isPowerOf2(1024));
    assert(!isPowerOf2(0) && !isPowerOf2(6));
    assert(nextPowerOf2(0) == 1);
    assert(nextPowerOf2(-5) == 1);
    assert(nextPowerOf2(1) == 1);
    assert(nextPowerOf2(3) == 4);
    assert(nextPowerOf2(1000) == 1024);
    assert(nextPowerOf2(1 << 20) == (1 << 20));
}

void testTricks() {
    int a = 5, b = 9;
    swapBits(a, b);
    assert(a == 9 && b == 5);
    assert(absNoBranch(-7) == 7 && absNoBranch(7) == 7 && absNoBranch(0) == 0);
    assert(averageNoOverflow(INT_MAX, INT_MAX - 2) == INT_MAX - 1);
}

void testSosDp() {
    vector<long long> got = sosDp({1, 2, 3, 4});
    assert((got == vector<long long>{1, 3, 4, 10}));
    // non-power-of-two length: entries past the last power of two still count
    vector<long long> a = {1, 2, 3, 4, 5, 6};
    vector<long long> r = sosDp(a);
    for (int mask = 0; mask < 6; mask++) {
        long long expected = 0;
        for (int sub = 0; sub < 6; sub++) if ((sub & mask) == sub) expected += a[sub];
        assert(r[mask] == expected);
    }
}

void testBitSet() {
    BitSet x(130), y(130);
    x.set(0); x.set(64); x.set(129);
    y.set(64); y.set(100);
    assert(x.get(129) && !x.get(1));
    assert(x.count() == 3);
    assert((x & y).count() == 1);
    assert((x | y).count() == 4);
    x.clear(0);
    assert(!x.get(0) && x.count() == 2);
}

int main() {
    testBasicOps();
    testZeroIsDefined();
    testEnumerateSubsets();
    testSubsetsOfSizeK();
    testSubsetsOfSizeZero();
    testTsp();
    testTspSingleCity();
    testCountSubsetSum();
    testPowerOfTwo();
    testTricks();
    testSosDp();
    testBitSet();
    std::cout << "All tests passed!" << std::endl;
    return 0;
}
