/**
 * Test cases for Bubble Sort (C++)
 */

#include <iostream>
#include <vector>
#include <algorithm>
#include <cassert>
#include "bubble_sort.cpp"

void testBasicSort() {
    std::vector<int> arr = {64, 34, 25, 12, 22, 11, 90};
    std::vector<int> expected = arr;
    std::sort(expected.begin(), expected.end());
    
    bubbleSort(arr);
    assert(arr == expected);
    
    std::cout << "Basic sort test passed" << std::endl;
}

void testAlreadySorted() {
    std::vector<int> arr = {1, 2, 3, 4, 5};
    std::vector<int> expected = arr;
    
    bubbleSort(arr);
    assert(arr == expected);
    
    std::cout << "Already sorted test passed" << std::endl;
}

void testEmptyArray() {
    std::vector<int> arr;
    bubbleSort(arr);
    assert(arr.empty());
    
    std::cout << "Empty array test passed" << std::endl;
}

void testSingleElement() {
    std::vector<int> arr = {42};
    bubbleSort(arr);
    assert(arr.size() == 1 && arr[0] == 42);
    
    std::cout << "Single element test passed" << std::endl;
}

void testDuplicatesAndNegatives() {
    std::vector<int> arr = {3, -1, 3, 0, -1, 2, 2};
    std::vector<int> expected = arr;
    std::sort(expected.begin(), expected.end());

    bubbleSort(arr);
    assert(arr == expected);

    std::cout << "Duplicates and negatives test passed" << std::endl;
}

void testStability() {
    // Compare by key only through a wrapper; equal keys must keep their order.
    struct Rec {
        int key;
        char tag;
        bool operator>(const Rec& o) const { return key > o.key; }
    };
    std::vector<Rec> arr = {{2, 'a'}, {1, 'x'}, {2, 'b'}, {1, 'y'}, {2, 'c'}};
    bubbleSort(arr);
    assert(arr[0].tag == 'x' && arr[1].tag == 'y');
    assert(arr[2].tag == 'a' && arr[3].tag == 'b' && arr[4].tag == 'c');

    std::cout << "Stability test passed" << std::endl;
}

int main() {
    std::cout << "Running Bubble Sort tests..." << std::endl;
    std::cout << std::endl;
    
    testBasicSort();
    testAlreadySorted();
    testEmptyArray();
    testSingleElement();
    testDuplicatesAndNegatives();
    testStability();
    
    std::cout << std::endl;
    std::cout << "All tests passed!" << std::endl;
    
    return 0;
}

