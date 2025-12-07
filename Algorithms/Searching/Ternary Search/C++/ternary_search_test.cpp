/**
 * Test cases for Ternary Search (C++)
 */

#include <iostream>
#include <vector>
#include <cassert>
#include "ternary_search.cpp"

void testBasicSearchFound() {
    std::vector<int> arr = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
    int result = ternarySearch(arr, 5);
    assert(result == 4);
    std::cout << "✓ Basic search (found) test passed" << std::endl;
}

void testBasicSearchNotFound() {
    std::vector<int> arr = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
    int result = ternarySearch(arr, 11);
    assert(result == -1);
    std::cout << "✓ Basic search (not found) test passed" << std::endl;
}

void testFirstElement() {
    std::vector<int> arr = {1, 2, 3, 4, 5};
    int result = ternarySearch(arr, 1);
    assert(result == 0);
    std::cout << "✓ First element test passed" << std::endl;
}

void testLastElement() {
    std::vector<int> arr = {1, 2, 3, 4, 5};
    int result = ternarySearch(arr, 5);
    assert(result == 4);
    std::cout << "✓ Last element test passed" << std::endl;
}

void testEmptyArray() {
    std::vector<int> arr;
    int result = ternarySearch(arr, 10);
    assert(result == -1);
    std::cout << "✓ Empty array test passed" << std::endl;
}

void testRecursiveSearch() {
    std::vector<int> arr = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
    int result = ternarySearchRecursive(arr, 7, 0, arr.size() - 1);
    assert(result == 6);
    std::cout << "✓ Recursive search test passed" << std::endl;
}

int main() {
    std::cout << "Running Ternary Search tests..." << std::endl;
    
    testBasicSearchFound();
    testBasicSearchNotFound();
    testFirstElement();
    testLastElement();
    testEmptyArray();
    testRecursiveSearch();
    
    std::cout << "\nAll tests passed! ✓" << std::endl;
    return 0;
}

