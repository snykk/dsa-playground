/**
 * Test cases for Interpolation Search (C++)
 */

#include <iostream>
#include <vector>
#include <cassert>
#include <climits>
#include "interpolation_search.cpp"

void testBasicSearchFound() {
    std::vector<int> arr = {10, 20, 30, 40, 50, 60, 70, 80, 90, 100};
    int result = interpolationSearch(arr, 50);
    assert(result == 4);
    std::cout << "Basic search (found) test passed" << std::endl;
}

void testBasicSearchNotFound() {
    std::vector<int> arr = {10, 20, 30, 40, 50, 60, 70, 80, 90, 100};
    int result = interpolationSearch(arr, 55);
    assert(result == -1);
    std::cout << "Basic search (not found) test passed" << std::endl;
}

void testFirstElement() {
    std::vector<int> arr = {10, 20, 30, 40, 50};
    int result = interpolationSearch(arr, 10);
    assert(result == 0);
    std::cout << "First element test passed" << std::endl;
}

void testLastElement() {
    std::vector<int> arr = {10, 20, 30, 40, 50};
    int result = interpolationSearch(arr, 50);
    assert(result == 4);
    std::cout << "Last element test passed" << std::endl;
}

void testEmptyArray() {
    std::vector<int> arr;
    int result = interpolationSearch(arr, 10);
    assert(result == -1);
    std::cout << "Empty array test passed" << std::endl;
}

void testRecursiveSearch() {
    std::vector<int> arr = {10, 20, 30, 40, 50, 60, 70, 80, 90, 100};
    int result = interpolationSearchRecursive(arr, 70, 0, arr.size() - 1);
    assert(result == 6);
    std::cout << "Recursive search test passed" << std::endl;
}

// Regression: equal window ends made the formula divide by zero (UB on the cast to int)
void testAllEqualValues() {
    std::vector<int> arr = {5, 5, 5};
    assert(interpolationSearch(arr, 5) == 0);
    assert(interpolationSearchRecursive(arr, 5, 0, 2) == 0);
    assert(interpolationSearch(arr, 4) == -1);
    assert(interpolationSearch(arr, 6) == -1);
    std::vector<double> d = {2.5, 2.5};
    assert(interpolationSearch(d, 2.5) == 0);
    std::cout << "All-equal values test passed" << std::endl;
}

void testDuplicates() {
    std::vector<int> arr = {1, 2, 2, 2, 2, 3, 7, 7, 9};
    for (int target : {1, 2, 3, 7, 9}) {
        int i = interpolationSearch(arr, target);
        int r = interpolationSearchRecursive(arr, target, 0, static_cast<int>(arr.size()) - 1);
        assert(i >= 0 && arr[i] == target);
        assert(r >= 0 && arr[r] == target);
    }
    assert(interpolationSearch(arr, 5) == -1);
    std::cout << "Duplicates test passed" << std::endl;
}

// Regression: target - arr[left] and arr[right] - arr[left] overflowed int
void testWideValueRange() {
    std::vector<int> arr = {INT_MIN, -7, 0, 42, INT_MAX};
    for (int i = 0; i < static_cast<int>(arr.size()); ++i) {
        assert(interpolationSearch(arr, arr[i]) == i);
        assert(interpolationSearchRecursive(arr, arr[i], 0, static_cast<int>(arr.size()) - 1) == i);
    }
    assert(interpolationSearch(arr, 1) == -1);
    std::cout << "Wide value range test passed" << std::endl;
}

int main() {
    std::cout << "Running Interpolation Search tests..." << std::endl;

    testBasicSearchFound();
    testBasicSearchNotFound();
    testFirstElement();
    testLastElement();
    testEmptyArray();
    testRecursiveSearch();
    testAllEqualValues();
    testDuplicates();
    testWideValueRange();

    std::cout << "\nAll tests passed!" << std::endl;
    return 0;
}

