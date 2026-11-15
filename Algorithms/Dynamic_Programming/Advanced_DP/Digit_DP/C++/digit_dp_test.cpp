/**
 * Test cases for Digit DP (C++)
 */

#include <cassert>
#include <iostream>
#include <limits>
#include <random>
#include <vector>
#include "digit_dp.cpp"

int digitSum(long long x) {
    int sum = 0;
    for (; x > 0; x /= 10) {
        sum += static_cast<int>(x % 10);
    }
    return sum;
}

long long bruteForceCount(long long n, int target) {
    long long count = 0;
    for (long long x = 0; x <= n; ++x) {
        count += digitSum(x) == target ? 1 : 0;
    }
    return count;
}

void testDigitSum() {
    assert(countNumbersWithDigitSum(100, 5) == 6);
    std::cout << "[PASS] Digit sum test passed" << std::endl;
}

void testMatchesBruteForceOnFixedBounds() {
    for (long long n : {0, 9, 10, 99, 100, 123, 999, 1000, 4321}) {
        for (int target : {0, 1, 5, 9, 18, 27}) {
            assert(countNumbersWithDigitSum(n, target) == bruteForceCount(n, target));
        }
    }
    std::cout << "[PASS] Matches brute force on fixed bounds test passed" << std::endl;
}

void testZeroAndTargetZero() {
    assert(countNumbersWithDigitSum(0, 0) == 1);
    assert(countNumbersWithDigitSum(0, 3) == 0);
    assert(countNumbersWithDigitSum(1000, 0) == 1);
    std::cout << "[PASS] Zero and target zero test passed" << std::endl;
}

void testNegativeBoundCountsNothing() {
    // count(R) - count(L - 1) must work for L = 0.
    assert(countNumbersWithDigitSum(-1, 0) == 0);
    assert(countNumbersWithDigitSum(100, 5) - countNumbersWithDigitSum(-1, 5) == 6);
    std::cout << "[PASS] Negative bound counts nothing test passed" << std::endl;
}

void testUnreachableTarget() {
    assert(countNumbersWithDigitSum(99, 19) == 0);
    std::cout << "[PASS] Unreachable target test passed" << std::endl;
}

void testAgreesWithPython() {
    // Expected values printed by the Python count_numbers_with_digit_sum.
    assert(countNumbersWithDigitSum(-7, 5) == 0);
    assert(countNumbersWithDigitSum(100, -1) == 0);
    assert(countNumbersWithDigitSum(4321, 27) == 20);
    assert(countNumbersWithDigitSum(1000000000000000000LL, 9) == 3124550);
    assert(countNumbersWithDigitSum(1000000000000000000LL, 162) == 1);
    assert(countNumbersWithDigitSum(123456789, 20) == 1050192);
    assert(countNumbersWithDigitSum(9999999999LL, 45) == 432457640);
    assert(countNumbersWithDigitSum(std::numeric_limits<long long>::max(), 90) == 271431132643611133LL);
    std::cout << "[PASS] Agrees with Python test passed" << std::endl;
}

void testMatchesCountingOneByOne() {
    // count[x][t] = numbers in 0..x with digit sum t, built by counting one by one.
    const int limit = 5000;
    const int maxTarget = 37;  // above 31 (the digit sum of 4999) nothing is counted
    std::vector<std::vector<long long>> count(limit + 1, std::vector<long long>(maxTarget + 1, 0));
    for (int x = 0; x <= limit; ++x) {
        if (x > 0) {
            count[x] = count[x - 1];
        }
        ++count[x][digitSum(x)];
    }
    std::mt19937 rng(20261115);
    for (int trial = 0; trial < 400; ++trial) {
        const int n = static_cast<int>(rng() % (limit + 1));
        for (int target = 0; target <= maxTarget; ++target) {
            assert(countNumbersWithDigitSum(n, target) == count[n][target]);
        }
    }
    std::cout << "[PASS] Matches counting one by one test passed" << std::endl;
}

int main() {
    std::cout << "Running Digit DP tests..." << std::endl;
    testDigitSum();
    testMatchesBruteForceOnFixedBounds();
    testZeroAndTargetZero();
    testNegativeBoundCountsNothing();
    testUnreachableTarget();
    testAgreesWithPython();
    testMatchesCountingOneByOne();
    std::cout << "\nAll tests passed!" << std::endl;
    return 0;
}
