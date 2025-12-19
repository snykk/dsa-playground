/**
 * Unit tests for Chinese Remainder Theorem
 */

#include <cassert>
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

int main() {
    testBasicCRT();
    testPairwiseCRT();
    testPairwiseCRTNotCoprime();
    testVerifySolution();
    testLargerModuli();
    testSingleCongruence();
    
    std::cout << "All tests passed!" << std::endl;
    return 0;
}

