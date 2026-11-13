#include <iostream>
#include <cassert>
#include "dp_patterns.cpp"

void testKnapsack() {
    assert(DPPatterns::knapsack01({10, 20, 30}, {60, 100, 120}, 50) == 220);
    assert(DPPatterns::knapsack01({}, {}, 50) == 0);
    assert(DPPatterns::knapsack01({10, 20, 30}, {60, 100, 120}, 0) == 0);
    assert(DPPatterns::knapsack01({0}, {5}, 0) == 5);  // a zero-weight item fits
    assert(DPPatterns::knapsack01({1, 3, 4, 5}, {1, 4, 5, 7}, 7) == 9);
    std::cout << "Knapsack tests passed!" << std::endl;
}

void testLCS() {
    assert(DPPatterns::lcs("abcde", "ace") == 3);
    assert(DPPatterns::lcs("abc", "def") == 0);
    assert(DPPatterns::lcs("abcbdab", "bdcaba") == 4);
    std::cout << "LCS tests passed!" << std::endl;
}

void testLIS() {
    assert(DPPatterns::lis({10, 9, 2, 5, 3, 7, 101, 18}) == 4);
    assert(DPPatterns::lis({7, 7, 7}) == 1);
    assert(DPPatterns::lis({10, 9, 2, 5, 3}) == 2);
    std::cout << "LIS tests passed!" << std::endl;
}

int main() {
    testKnapsack();
    testLCS();
    testLIS();
    
    std::cout << "All tests passed successfully!" << std::endl;
    return 0;
}
