/**
 * Test cases for Interpolation Search (C++)
 */

#include <iostream>
#include <vector>
#include <cassert>
#include "interpolation_search.cpp"

void testBasicSearchFound() {
    std::vector<int> arr = {10, 20, 30, 40, 50, 60, 70, 80, 90, 100};
    int result = interpolationSearch(arr, 50);
    assert(result == 4);
    std::cout << "✓ Basic search (found) test passed" << std::endl;
}

void testBasicSearchNotFound() {
    std::vector<int> arr = {10, 20, 30, 40, 50, 60, 70, 80, 90, 100};
    int result = interpolationSearch(arr, 55);
    assert(result == -1);
    std::cout << "✓ Basic search (not found) test passed" << std::endl;
}

void testFirstElement() {
    std::vector<int> arr = {10, 20, 30, 40, 50};
    int result = interpolationSearch(arr, 10);
    assert(result == 0);
    std::cout << "✓ First element test passed" << std::endl;
}

void testLastElement() {
    std::vector<int> arr = {10, 20, 30, 40, 50};
    int result = interpolationSearch(arr, 50);
    assert(result == 4);
    std::cout << "✓ Last element test passed" << std::endl;
}

void testEmptyArray() {
    std::vector<int> arr;
    int result = interpolationSearch(arr, 10);
    assert(result == -1);
    std::cout << "✓ Empty array test passed" << std::endl;
}

void testRecursiveSearch() {
    std::vector<int> arr = {10, 20, 30, 40, 50, 60, 70, 80, 90, 100};
    int result = interpolationSearchRecursive(arr, 70, 0, arr.size() - 1);
    assert(result == 6);
    std::cout << "✓ Recursive search test passed" << std::endl;
}

int main() {
    std::cout << "Running Interpolation Search tests..." << std::endl;
    
    testBasicSearchFound();
    testBasicSearchNotFound();
    testFirstElement();
    testLastElement();
    testEmptyArray();
    testRecursiveSearch();
    
    std::cout << "\nAll tests passed! ✓" << std::endl;
    return 0;
}

