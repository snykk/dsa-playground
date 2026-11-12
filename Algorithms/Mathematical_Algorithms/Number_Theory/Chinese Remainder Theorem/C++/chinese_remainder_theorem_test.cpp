/**
 * Unit tests for Chinese Remainder Theorem
 */

#include <algorithm>
#include <cassert>
#include <climits>
#include <numeric>
#include <iostream>
#include <vector>
#include "chinese_remainder_theorem.cpp"

void testBasicCRT() {
    std::vector<long long> remainders = {2, 3, 2};
    std::vector<long long> moduli = {3, 5, 7};
    long long solution = chineseRemainderTheorem(remainders, moduli);
    assert(solution == 23);
    assert(verifyCrtSolution(solution, remainders, moduli));
}

void testPairwiseCRT() {
    long long solution = chineseRemainderTheoremPairwise(1, 3, 2, 5);
    assert(solution == 7);
    assert(solution % 3 == 1);
    assert(solution % 5 == 2);
}

void testPairwiseCRTNotCoprime() {
    long long solution = chineseRemainderTheoremPairwise(1, 4, 2, 6);
    assert(solution == -1);
}

void testVerifySolution() {
    std::vector<long long> remainders = {2, 3, 2};
    std::vector<long long> moduli = {3, 5, 7};
    long long solution = 23;
    assert(verifyCrtSolution(solution, remainders, moduli));
    assert(!verifyCrtSolution(22, remainders, moduli));
}

void testLargerModuli() {
    std::vector<long long> remainders = {1, 2, 3, 4};
    std::vector<long long> moduli = {5, 7, 11, 13};
    long long solution = chineseRemainderTheorem(remainders, moduli);
    assert(solution != -1);
    assert(verifyCrtSolution(solution, remainders, moduli));
}

void testSingleCongruence() {
    std::vector<long long> remainders = {5};
    std::vector<long long> moduli = {7};
    long long solution = chineseRemainderTheorem(remainders, moduli);
    assert(solution == 5);
    assert(verifyCrtSolution(solution, remainders, moduli));
}

void testExtendedGcdSignedIdentity() {
    // a*x + b*y must equal gcd(a, b) for every sign combination.
    unsigned seed = 12345;
    auto next = [&seed]() { seed = seed * 1103515245u + 12345u; return seed >> 8; };
    for (int i = 0; i < 20000; i++) {
        long long a = static_cast<long long>(next() % 2001) - 1000;
        long long b = static_cast<long long>(next() % 2001) - 1000;
        ExtendedGCD r = extendedGcd(a, b);
        long long g = std::gcd(a, b);
        assert(r.gcd == g);
        assert(a * r.x + b * r.y == g);
    }
    assert(modInverse(-3, 11) == 7);
}

void testNegativeRemainder() {
    assert(chineseRemainderTheorem({-1}, {7}) == 6);
    assert(chineseRemainderTheorem({-1, 2}, {3, 5}) == 2);
}

void testVerifyNormalizesRemainder() {
    assert(chineseRemainderTheorem({8}, {3}) == 2);
    assert(verifyCrtSolution(2, {8}, {3}));
    assert(verifyCrtSolution(6, {-1}, {7}));
}

void testLargeModuliNoOverflow() {
    std::vector<long long> remainders = {1000000006LL, 998244352LL};
    std::vector<long long> moduli = {1000000007LL, 998244353LL};
    long long x = chineseRemainderTheorem(remainders, moduli);
    assert(x == 998244359987710470LL);
    assert(verifyCrtSolution(x, remainders, moduli));
    // Moduli just above sqrt(2^63): residue products need 128 bits.
    long long m1 = 3037000493LL, m2 = 3037000497LL;
    long long y = chineseRemainderTheoremPairwise(m1 - 1, m1, 12345, m2);
    assert(y == 4611676629613100865LL);
    assert(y % m1 == m1 - 1 && y % m2 == 12345);
    // lcm too large for long long: reported as failure, not garbage.
    assert(chineseRemainderTheorem({1, 2}, {LLONG_MAX, LLONG_MAX - 1}) == -1);
}

void testNonCoprimeSolvable() {
    assert(chineseRemainderTheorem({1, 3}, {4, 6}) == 9);
    assert(chineseRemainderTheorem({1, 2}, {4, 6}) == -1);  // contradictory
    // Three pairwise non-coprime moduli: 5 mod 6, 3 mod 10, 8 mod 15 -> 23.
    assert(chineseRemainderTheorem({5, 3, 8}, {6, 10, 15}) == 23);
}

int main() {
    testBasicCRT();
    testPairwiseCRT();
    testPairwiseCRTNotCoprime();
    testVerifySolution();
    testLargerModuli();
    testSingleCongruence();
    testExtendedGcdSignedIdentity();
    testNegativeRemainder();
    testVerifyNormalizesRemainder();
    testLargeModuliNoOverflow();
    testNonCoprimeSolvable();
    
    std::cout << "All tests passed!" << std::endl;
    return 0;
}

