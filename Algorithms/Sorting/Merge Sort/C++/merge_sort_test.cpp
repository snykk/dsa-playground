/**
 * Test cases for Merge Sort (C++)
 */

#include <iostream>
#include <vector>
#include <algorithm>
#include <cassert>
#include "merge_sort.cpp"

void testBasicSort() {
    std::vector<int> arr = {64, 34, 25, 12, 22, 11, 90};
    std::vector<int> expected = arr;
    std::sort(expected.begin(), expected.end());
    
    mergeSort(arr);
    assert(arr == expected);
    
    std::cout << "Basic sort test passed" << std::endl;
}

void testEdgeCases() {
    std::vector<std::vector<int>> cases = {
        {}, {42}, {2, 1}, {3, -1, 3, 0, -1, 2, 2}, {5, 5, 5, 5}, {1, 2, 3, 4, 5}, {5, 4, 3, 2, 1}, {2, 1, 3}};
    for (std::vector<int> arr : cases) {
        std::vector<int> expected = arr;
        std::sort(expected.begin(), expected.end());
        mergeSort(arr);
        assert(arr == expected);
    }
    std::cout << "Edge cases test passed" << std::endl;
}

void testStability() {
    struct Rec {
        int key;
        char tag;
        bool operator<=(const Rec& o) const { return key <= o.key; }
    };
    std::vector<Rec> arr = {{2, 'a'}, {1, 'x'}, {2, 'b'}, {1, 'y'}, {2, 'c'}};
    mergeSort(arr);
    assert(arr[0].tag == 'x' && arr[1].tag == 'y');
    assert(arr[2].tag == 'a' && arr[3].tag == 'b' && arr[4].tag == 'c');
    std::cout << "Stability test passed" << std::endl;
}

int main() {
    std::cout << "Running Merge Sort tests..." << std::endl;
    testBasicSort();
    testEdgeCases();
    testStability();
    std::cout << "All tests passed!" << std::endl;
    return 0;
}

