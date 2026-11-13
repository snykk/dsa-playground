/**
 * Test cases for Heap Sort (C++)
 */

#include <iostream>
#include <vector>
#include <algorithm>
#include <cassert>
#include "heap_sort.cpp"

void testBasicSort() {
    std::vector<int> arr = {64, 34, 25, 12, 22, 11, 90};
    std::vector<int> expected = arr;
    std::sort(expected.begin(), expected.end());
    
    heapSort(arr);
    assert(arr == expected);
    
    std::cout << "[PASS] Basic sort test" << std::endl;
}

// Regression: n - 1 wrapped around for an empty vector and the loop swapped arr[0]
// with arr[SIZE_MAX] (segfault).
void testEmptyAndSingle() {
    std::vector<int> empty;
    heapSort(empty);
    assert(empty.empty());

    std::vector<int> single = {42};
    heapSort(single);
    assert(single == std::vector<int>({42}));

    std::vector<double> two = {2.5, -1.0};
    heapSort(two);
    assert(two == std::vector<double>({-1.0, 2.5}));

    std::cout << "[PASS] Empty and single-element test" << std::endl;
}

int main() {
    std::cout << "Running Heap Sort tests..." << std::endl;
    testBasicSort();
    testEmptyAndSingle();
    std::cout << "All tests passed!" << std::endl;
    return 0;
}

