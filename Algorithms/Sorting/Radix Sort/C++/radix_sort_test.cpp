/**
 * Test cases for Radix Sort (C++)
 */

#include <iostream>
#include <vector>
#include <algorithm>
#include <cassert>
#include "radix_sort.cpp"

void testBasicSort() {
    std::vector<int> arr = {170, 45, 75, 90, 802, 24, 2, 66};
    std::vector<int> expected = arr;
    std::sort(expected.begin(), expected.end());
    
    radixSort(arr);
    assert(arr == expected);
    
    std::cout << "✓ Basic sort test passed" << std::endl;
}

int main() {
    std::cout << "Running Radix Sort tests..." << std::endl;
    testBasicSort();
    std::cout << "All tests passed! ✓" << std::endl;
    return 0;
}

