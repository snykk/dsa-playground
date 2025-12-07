/**
 * Test cases for Insertion Sort (C++)
 */

#include <iostream>
#include <vector>
#include <algorithm>
#include <cassert>
#include "insertion_sort.cpp"

void testBasicSort() {
    std::vector<int> arr = {64, 34, 25, 12, 22, 11, 90};
    std::vector<int> expected = arr;
    std::sort(expected.begin(), expected.end());
    
    insertionSort(arr);
    assert(arr == expected);
    
    std::cout << "✓ Basic sort test passed" << std::endl;
}

int main() {
    std::cout << "Running Insertion Sort tests..." << std::endl;
    testBasicSort();
    std::cout << "All tests passed! ✓" << std::endl;
    return 0;
}

