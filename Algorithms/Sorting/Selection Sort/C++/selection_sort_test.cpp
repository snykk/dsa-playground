/**
 * Test cases for Selection Sort (C++)
 */

#include <iostream>
#include <vector>
#include <algorithm>
#include <cassert>
#include "selection_sort.cpp"

void testBasicSort() {
    std::vector<int> arr = {64, 34, 25, 12, 22, 11, 90};
    std::vector<int> expected = arr;
    std::sort(expected.begin(), expected.end());
    
    selectionSort(arr);
    assert(arr == expected);
    
    std::cout << "✓ Basic sort test passed" << std::endl;
}

int main() {
    std::cout << "Running Selection Sort tests..." << std::endl;
    testBasicSort();
    std::cout << "All tests passed! ✓" << std::endl;
    return 0;
}

