#include "monotonic_queue.h"

#include <cassert>
#include <iostream>
#include <vector>

void testLeetCodeExample() {
    std::vector<int> arr = {1, 3, -1, -3, 5, 3, 6, 7};
    std::vector<int> expected = {3, 3, 5, 5, 6, 7};
    assert(slidingWindowMax(arr, 3) == expected);
}

void testWindowEqualsLength() {
    std::vector<int> arr = {2, 1, 3};
    std::vector<int> expected = {3};
    assert(slidingWindowMax(arr, 3) == expected);
}

void testWindowSizeOne() {
    std::vector<int> arr = {1, 2, 3};
    std::vector<int> expected = {1, 2, 3};
    assert(slidingWindowMax(arr, 1) == expected);
}

void testAllEqual() {
    std::vector<int> arr = {5, 5, 5, 5};
    std::vector<int> expected = {5, 5, 5};
    assert(slidingWindowMax(arr, 2) == expected);
}

void testDecreasingArray() {
    std::vector<int> arr = {5, 4, 3, 2, 1};
    std::vector<int> expected = {5, 4, 3};
    assert(slidingWindowMax(arr, 3) == expected);
}

void testEmptyArray() {
    std::vector<int> arr;
    assert(slidingWindowMax(arr, 3).empty());
}

void testWindowLargerThanArray() {
    std::vector<int> arr = {1, 2};
    assert(slidingWindowMax(arr, 3).empty());
}

void testNegativeValues() {
    std::vector<int> arr = {-5, -3, -8, -1, -2, -7};
    std::vector<int> expected = {-3, -1, -1, -1};
    assert(slidingWindowMax(arr, 3) == expected);
}

void testSlidingMin() {
    std::vector<int> arr = {1, 3, -1, -3, 5, 3, 6, 7};
    std::vector<int> expected = {-1, -3, -3, -3, 3, 3};
    assert(slidingWindowMin(arr, 3) == expected);
}

int main() {
    testLeetCodeExample();
    testWindowEqualsLength();
    testWindowSizeOne();
    testAllEqual();
    testDecreasingArray();
    testEmptyArray();
    testWindowLargerThanArray();
    testNegativeValues();
    testSlidingMin();
    std::cout << "All 9 tests passed!" << std::endl;
    return 0;
}
