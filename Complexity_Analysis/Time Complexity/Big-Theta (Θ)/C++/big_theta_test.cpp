/*
 * Test cases for Big-Theta Notation examples
 */

#include <iostream>
#include <vector>
#include <cassert>
#include "big_theta.cpp"

using namespace std;

void testTightBoundLinear() {
    vector<int> arr1 = {1, 2, 3, 4, 5};
    assert(tightBoundExample(arr1) == 15);
    
    vector<int> arr2 = {10, 20, 30};
    assert(tightBoundExample(arr2) == 60);
    
    vector<int> arr3 = {};
    assert(tightBoundExample(arr3) == 0);
    cout << "OK Tight bound linear tests passed\n";
}

void testBinarySearchTightBound() {
    vector<int> arr = {1, 3, 5, 7, 9, 11, 13, 15};
    
    // Found cases
    assert(binarySearchExample(arr, 1) == 0);
    assert(binarySearchExample(arr, 7) == 3);
    assert(binarySearchExample(arr, 15) == 7);
    
    // Not found cases
    assert(binarySearchExample(arr, 0) == -1);
    assert(binarySearchExample(arr, 20) == -1);
    assert(binarySearchExample(arr, 6) == -1);
    cout << "OK Binary search tight bound tests passed\n";
}

void testMergeSortTightBound() {
    vector<int> arr1 = {64, 34, 25, 12, 22, 11, 90};
    vector<int> sorted1 = mergeSortExample(arr1);
    vector<int> expected1 = {11, 12, 22, 25, 34, 64, 90};
    assert(sorted1 == expected1);
    
    vector<int> arr2 = {5, 2, 8, 1, 9};
    vector<int> sorted2 = mergeSortExample(arr2);
    vector<int> expected2 = {1, 2, 5, 8, 9};
    assert(sorted2 == expected2);
    cout << "OK Merge sort tight bound tests passed\n";
}

int main() {
    cout << "Running Big-Theta Notation tests...\n\n";
    
    testTightBoundLinear();
    testBinarySearchTightBound();
    testMergeSortTightBound();
    
    cout << "\nAll tests passed! OK\n";
    return 0;
}
