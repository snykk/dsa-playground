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
    
    std::cout << "✓ Basic sort test passed" << std::endl;
}

int main() {
    std::cout << "Running Counting Sort tests..." << std::endl;
    testBasicSort();
    std::cout << "All tests passed! ✓" << std::endl;
    return 0;
}

