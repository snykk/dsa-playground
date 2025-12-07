/**
 * Test cases for Linear Search (C++)
 */

#include <iostream>
#include <vector>
#include <cassert>
#include "linear_search.cpp"

void testBasicSearchFound() {
    std::vector<int> arr = {10, 20, 30, 40, 50};
    int result = linearSearch(arr, 30);
    assert(result == 2);
    std::cout << "✓ Basic search (found) test passed" << std::endl;
}

void testBasicSearchNotFound() {
    std::vector<int> arr = {10, 20, 30, 40, 50};
    int result = linearSearch(arr, 25);
    assert(result == -1);
    std::cout << "✓ Basic search (not found) test passed" << std::endl;
}

void testFirstElement() {
    std::vector<int> arr = {10, 20, 30, 40, 50};
    int result = linearSearch(arr, 10);
    assert(result == 0);
    std::cout << "✓ First element test passed" << std::endl;
}

void testLastElement() {
    std::vector<int> arr = {10, 20, 30, 40, 50};
    int result = linearSearch(arr, 50);
    assert(result == 4);
    std::cout << "✓ Last element test passed" << std::endl;
}

void testEmptyArray() {
    std::vector<int> arr;
    int result = linearSearch(arr, 10);
    assert(result == -1);
    std::cout << "✓ Empty array test passed" << std::endl;
}

void testSingleElementFound() {
    std::vector<int> arr = {42};
    int result = linearSearch(arr, 42);
    assert(result == 0);
    std::cout << "✓ Single element (found) test passed" << std::endl;
}

void testSingleElementNotFound() {
    std::vector<int> arr = {42};
    int result = linearSearch(arr, 10);
    assert(result == -1);
    std::cout << "✓ Single element (not found) test passed" << std::endl;
}

void testDuplicateElements() {
    std::vector<int> arr = {10, 20, 30, 20, 40, 20};
    int result = linearSearch(arr, 20);
    assert(result == 1);  // Returns first occurrence
    std::cout << "✓ Duplicate elements test passed" << std::endl;
}

void testNegativeNumbers() {
    std::vector<int> arr = {-5, -2, 0, 3, 7};
    int result = linearSearch(arr, -2);
    assert(result == 1);
    std::cout << "✓ Negative numbers test passed" << std::endl;
}

void testRecursiveSearch() {
    std::vector<int> arr = {10, 20, 30, 40, 50};
    int result = linearSearchRecursive(arr, 30);
    assert(result == 2);
    std::cout << "✓ Recursive search test passed" << std::endl;
}

void testAllOccurrences() {
    std::vector<int> arr = {10, 20, 30, 20, 40, 20};
    std::vector<int> result = linearSearchAllOccurrences(arr, 20);
    assert(result.size() == 3);
    assert(result[0] == 1);
    assert(result[1] == 3);
    assert(result[2] == 5);
    std::cout << "✓ All occurrences test passed" << std::endl;
}

void testStringSearch() {
    std::vector<std::string> arr = {"apple", "banana", "cherry", "date"};
    int result = linearSearch(arr, std::string("cherry"));
    assert(result == 2);
    std::cout << "✓ String search test passed" << std::endl;
}

int main() {
    std::cout << "Running Linear Search tests..." << std::endl;
    
    testBasicSearchFound();
    testBasicSearchNotFound();
    testFirstElement();
    testLastElement();
    testEmptyArray();
    testSingleElementFound();
    testSingleElementNotFound();
    testDuplicateElements();
    testNegativeNumbers();
    testRecursiveSearch();
    testAllOccurrences();
    testStringSearch();
    
    std::cout << "\nAll tests passed! ✓" << std::endl;
    return 0;
}

