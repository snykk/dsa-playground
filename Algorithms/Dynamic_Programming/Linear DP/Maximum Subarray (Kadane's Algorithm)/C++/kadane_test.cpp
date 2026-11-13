#include <iostream>
#include <vector>
#include <cassert>
#include "kadane.cpp"

void testClassic() {
    std::vector<int> arr = {-2, 1, -3, 4, -1, 2, 1, -5, 4};
    assert(kadaneAlgorithm(arr) == 6);  // [4, -1, 2, 1]
    assert(kadaneAlgorithm({5, -9, 6, -2, 3}) == 7);  // [6, -2, 3]
    assert(kadaneAlgorithm({2, -1, 2, -1, 2}) == 4);  // the whole array
    assert(kadaneAlgorithm({1, 2, 3, 4}) == 10);  // all positive
    std::cout << "[ok] Classic cases" << std::endl;
}

void testNegativesAndZeros() {
    assert(kadaneAlgorithm({-3, -1, -2}) == -1);  // all negative: largest element
    assert(kadaneAlgorithm({-7}) == -7);
    assert(kadaneAlgorithm({-1, 0, -2}) == 0);
    assert(kadaneAlgorithm({0, 0, 0}) == 0);
    std::cout << "[ok] Negatives and zeros" << std::endl;
}

void testEdgeCases() {
    assert(kadaneAlgorithm({}) == 0);  // empty input returns 0 by convention
    assert(kadaneAlgorithm({5}) == 5);
    std::cout << "[ok] Edge cases" << std::endl;
}

int main() {
    testClassic();
    testNegativesAndZeros();
    testEdgeCases();
    std::cout << "All tests passed!" << std::endl;
    return 0;
}
