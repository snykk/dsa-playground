#include <iostream>
#include <vector>
#include <cassert>
#include "lis.cpp"

void testClassic() {
    std::vector<int> arr = {10, 9, 2, 5, 3, 7, 101, 18};
    assert(lisDP(arr) == 4);  // e.g. 2, 3, 7, 18
    assert(lisDP({0, 1, 0, 3, 2, 3}) == 4);
    assert(lisDP({3, 10, 2, 1, 20}) == 3);
    assert(lisDP({50, 3, 10, 7, 40, 80}) == 4);
    assert(lisDP({-5, -3, -4, 0, -1, 2}) == 4);  // negative values
    std::cout << "[ok] Classic cases" << std::endl;
}

void testEdgeCases() {
    assert(lisDP({}) == 0);
    assert(lisDP({42}) == 1);
    assert(lisDP({1, 2, 3, 4, 5}) == 5);  // already sorted
    assert(lisDP({5, 4, 3, 2, 1}) == 1);  // strictly decreasing
    std::cout << "[ok] Edge cases" << std::endl;
}

void testDuplicatesAreNotIncreasing() {
    // Strictly increasing: equal values cannot both be in the subsequence.
    assert(lisDP({7, 7, 7, 7}) == 1);
    assert(lisDP({1, 3, 3, 5}) == 3);
    assert(lisDP({2, 2, 3, 3, 4}) == 3);
    std::cout << "[ok] Duplicates" << std::endl;
}

int main() {
    testClassic();
    testEdgeCases();
    testDuplicatesAreNotIncreasing();
    std::cout << "All tests passed!" << std::endl;
    return 0;
}
