/**
 * Test cases for Radix Sort (C++)
 */

#include <iostream>
#include <vector>
#include <algorithm>
#include <cassert>
#include <climits>
#include "radix_sort.cpp"

void testBasicSort() {
    std::vector<int> arr = {170, 45, 75, 90, 802, 24, 2, 66};
    std::vector<int> expected = arr;
    std::sort(expected.begin(), expected.end());
    
    radixSort(arr);
    assert(arr == expected);
    
    std::cout << "[PASS] Basic sort test" << std::endl;
}

static void expectSorted(std::vector<int> arr) {
    std::vector<int> expected = arr;
    std::sort(expected.begin(), expected.end());
    radixSort(arr);
    assert(arr == expected);
}

// Regression: all-negative input came back unchanged and mixed signs read out of bounds.
void testNegativeNumbers() {
    expectSorted({-3, -1, -2});
    expectSorted({3, -1, 2});
    expectSorted({-170, 45, -75, 0, 802, -2, 2});
    expectSorted({-5, -5});
    expectSorted({0, -10, 10, -100, 100});
    std::cout << "[PASS] Negative numbers test" << std::endl;
}

// Regression: exp *= 10 overflowed int once the maximum reached 1e9.
void testLargeValues() {
    expectSorted({2000000000, 7, 1999999999, 1000000000});
    expectSorted({INT_MIN, INT_MAX, 0, -1, 1, INT_MIN, INT_MAX});
    expectSorted({0, 0, 0});
    std::vector<int> empty;
    radixSort(empty);
    assert(empty.empty());
    std::cout << "[PASS] Large values and edge cases test" << std::endl;
}

int main() {
    std::cout << "Running Radix Sort tests..." << std::endl;
    testBasicSort();
    testNegativeNumbers();
    testLargeValues();
    std::cout << "All tests passed!" << std::endl;
    return 0;
}

