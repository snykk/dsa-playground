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
    
    std::cout << "Basic sort test passed" << std::endl;
}

void testEdgeCases() {
    std::vector<std::vector<int>> cases = {
        {}, {42}, {2, 1}, {3, -1, 3, 0, -1, 2, 2}, {5, 5, 5, 5}, {1, 2, 3, 4, 5}, {5, 4, 3, 2, 1}};
    for (std::vector<int> arr : cases) {
        std::vector<int> expected = arr;
        std::sort(expected.begin(), expected.end());
        selectionSort(arr);
        assert(arr == expected);
    }
    std::cout << "Edge cases test passed" << std::endl;
}

// Counts moves so that the test can see how many swaps happen.
struct Counted {
    int key;
    static int moves;
    Counted(int k = 0) : key(k) {}
    Counted(const Counted& o) : key(o.key) {}
    Counted(Counted&& o) noexcept : key(o.key) { ++moves; }
    Counted& operator=(const Counted& o) { key = o.key; return *this; }
    Counted& operator=(Counted&& o) noexcept { key = o.key; ++moves; return *this; }
    bool operator<(const Counted& o) const { return key < o.key; }
};
int Counted::moves = 0;

// Regression: every iteration used to swap, even an element with itself.
void testNoSelfSwaps() {
    std::vector<Counted> sorted_input = {1, 2, 3, 4, 5};
    Counted::moves = 0;
    selectionSort(sorted_input);
    assert(Counted::moves == 0);
    std::cout << "No self-swaps test passed" << std::endl;
}

int main() {
    std::cout << "Running Selection Sort tests..." << std::endl;
    testBasicSort();
    testEdgeCases();
    testNoSelfSwaps();
    std::cout << "All tests passed!" << std::endl;
    return 0;
}

