#include <vector>
#include <utility>
#include <cstdint>

using namespace std;

/**
 * Check if n is a power of 2.
 * Time Complexity: O(1)
 */
bool isPowerOfTwo(int64_t n) {
    return n > 0 && (n & (n - 1)) == 0;
}

/**
 * Count the number of 1-bits using Brian Kernighan's algorithm.
 * A negative n is counted as a 64-bit two's complement value (-1 has 64 set
 * bits), the same as the Python and Go versions. Working on the unsigned value
 * avoids signed overflow in n - 1.
 * Time Complexity: O(k) where k is the number of set bits
 */
int countSetBits(int64_t value) {
    uint64_t n = static_cast<uint64_t>(value);
    int count = 0;
    while (n) {
        n &= (n - 1);
        count++;
    }
    return count;
}

/**
 * Get the i-th bit of n (0-indexed from LSB).
 * Time Complexity: O(1)
 */
int getBit(int64_t n, int i) {
    return (n >> i) & 1;
}

/**
 * Set the i-th bit to 1.
 * Time Complexity: O(1)
 */
int64_t setBit(int64_t n, int i) {
    return n | (1LL << i);
}

/**
 * Clear the i-th bit to 0.
 * Time Complexity: O(1)
 */
int64_t clearBit(int64_t n, int i) {
    return n & ~(1LL << i);
}

/**
 * Toggle the i-th bit.
 * Time Complexity: O(1)
 */
int64_t toggleBit(int64_t n, int i) {
    return n ^ (1LL << i);
}

/**
 * Isolate the lowest set bit.
 * Time Complexity: O(1)
 */
int64_t lowestSetBit(int64_t n) {
    if (n == 0) return 0;
    return n & (-n);
}

/**
 * Find the position of the highest set bit (0-indexed).
 * Returns -1 if n <= 0.
 * Time Complexity: O(log n)
 */
int highestSetBit(int64_t n) {
    if (n <= 0) return -1;
    int position = 0;
    while (n > 1) {
        n >>= 1;
        position++;
    }
    return position;
}

/**
 * Count bits that differ between a and b (Hamming distance).
 * Time Complexity: O(k) where k is the number of differing bits
 */
int countDifferingBits(int64_t a, int64_t b) {
    return countSetBits(a ^ b);
}

/**
 * Swap two values using XOR without a temporary variable.
 * Time Complexity: O(1)
 */
pair<int64_t, int64_t> swapWithoutTemp(int64_t a, int64_t b) {
    if (a == b) return {a, b};
    a ^= b;
    b ^= a;
    a ^= b;
    return {a, b};
}

/**
 * Check if n is even using bit operation.
 * Time Complexity: O(1)
 */
bool isEven(int64_t n) {
    return (n & 1) == 0;
}

/**
 * Find the next power of 2 >= n.
 * Time Complexity: O(log n)
 */
int64_t nextPowerOfTwo(int64_t n) {
    if (n <= 1) return 1;
    if (isPowerOfTwo(n)) return n;
    int64_t power = 1;
    while (power < n) {
        power <<= 1;
    }
    return power;
}

/**
 * Generate all subsets of an n-element set using bitmask enumeration.
 * Elements are represented as indices 0 to n-1.
 * Time Complexity: O(n * 2^n)
 */
vector<vector<int>> subsetGeneration(int n) {
    vector<vector<int>> subsets;
    for (int mask = 0; mask < (1 << n); mask++) {
        vector<int> subset;
        for (int i = 0; i < n; i++) {
            if (mask & (1 << i)) {
                subset.push_back(i);
            }
        }
        subsets.push_back(subset);
    }
    return subsets;
}

#ifndef TESTING
#ifndef IS_TEST_BUILD
int main() {
    return 0;
}
#endif
#endif  // !IS_TEST_BUILD
