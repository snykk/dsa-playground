/**
 * Test cases for Quick Sort (C++)
 */

#include <iostream>
#include <vector>
#include <algorithm>
#include <cassert>
#include "quick_sort.cpp"

void testBasicSort() {
    std::vector<int> arr = {64, 34, 25, 12, 22, 11, 90};
    std::vector<int> expected = arr;
    std::sort(expected.begin(), expected.end());
    
    quickSort(arr);
    assert(arr == expected);
    
    std::cout << "Basic sort test passed" << std::endl;
}

void testEdgeCases() {
    std::vector<std::vector<int>> cases = {
        {}, {42}, {2, 1}, {3, -1, 3, 0, -1, 2, 2}, {5, 5, 5, 5}, {1, 2, 3, 4, 5}, {5, 4, 3, 2, 1}};
    // Sorted, reversed and all-equal input are the worst cases for a last-element pivot.
    std::vector<int> sorted_big, reversed_big(2000, 0), equal_big(2000, 7);
    for (int i = 0; i < 2000; ++i) {
        sorted_big.push_back(i);
        reversed_big[i] = 2000 - i;
    }
    cases.push_back(sorted_big);
    cases.push_back(reversed_big);
    cases.push_back(equal_big);
    for (std::vector<int> arr : cases) {
        std::vector<int> expected = arr;
        std::sort(expected.begin(), expected.end());
        quickSort(arr);
        assert(arr == expected);
    }
    std::cout << "Edge cases test passed" << std::endl;
}

int main() {
    std::cout << "Running Quick Sort tests..." << std::endl;
    testBasicSort();
    testEdgeCases();
    std::cout << "All tests passed!" << std::endl;
    return 0;
}

