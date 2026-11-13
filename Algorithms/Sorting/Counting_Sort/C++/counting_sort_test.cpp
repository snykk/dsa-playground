/**
 * Test cases for Counting Sort (C++)
 */

#include <iostream>
#include <vector>
#include <algorithm>
#include <cassert>
#include "counting_sort.cpp"

void testBasicSort() {
    std::vector<int> arr = {4, 2, 2, 8, 3, 3, 1};
    std::vector<int> expected = arr;
    std::sort(expected.begin(), expected.end());
    
    int maxVal = *std::max_element(arr.begin(), arr.end());
    std::vector<int> result = countingSort(arr, maxVal);
    assert(result == expected);
    
    std::cout << "[PASS] Basic sort test" << std::endl;
}

// Regression: negative values used to index count[] out of bounds.
void testNegativeNumbers() {
    std::vector<std::vector<int>> cases = {{3, -1, 2}, {-3, -1, -2}, {-5, 0, 5, -5, 0}, {0, 0}, {-7}};
    for (const auto& arr : cases) {
        std::vector<int> expected = arr;
        std::sort(expected.begin(), expected.end());
        int maxVal = *std::max_element(arr.begin(), arr.end());
        assert(countingSort(arr, maxVal) == expected);
    }
    std::cout << "[PASS] Negative numbers test" << std::endl;
}

// Regression: a maxVal below the real maximum used to write out of bounds.
void testMaxValTooSmall() {
    bool threw = false;
    try {
        countingSort({5, 1}, 3);
    } catch (const std::invalid_argument&) {
        threw = true;
    }
    assert(threw);
    // A larger maxVal than needed is fine.
    assert(countingSort({5, -1, 1}, 9) == std::vector<int>({-1, 1, 5}));
    assert(countingSort({}, 0).empty());
    std::cout << "[PASS] maxVal validation test" << std::endl;
}

int main() {
    std::cout << "Running Counting Sort tests..." << std::endl;
    testBasicSort();
    testNegativeNumbers();
    testMaxValTooSmall();
    std::cout << "All tests passed!" << std::endl;
    return 0;
}

