/*
 * Test cases for Big-Omega Notation examples
 */

#include <iostream>
#include <vector>
#include <cassert>
#include "big_omega.cpp"

using namespace std;

void testLinearSearchBestCase() {
    vector<int> arr = {5, 3, 8, 1, 9};
    
    // Best case: target at first position
    assert(linearSearchBestCase(arr, 5) == 0);
    
    // Worst case: target at last position
    assert(linearSearchBestCase(arr, 9) == 4);
    
    // Not found
    assert(linearSearchBestCase(arr, 10) == -1);
    cout << "OK Linear search best case tests passed\n";
}

void testBubbleSortBestCase() {
    // Already sorted (best case)
    vector<int> arr1 = {1, 2, 3, 4, 5};
    vector<int> result1 = bubbleSortBestCase(arr1);
    vector<int> expected1 = {1, 2, 3, 4, 5};
    assert(result1 == expected1);
    
    // Reverse sorted (worst case)
    vector<int> arr2 = {5, 4, 3, 2, 1};
    vector<int> result2 = bubbleSortBestCase(arr2);
    vector<int> expected2 = {1, 2, 3, 4, 5};
    assert(result2 == expected2);
    cout << "OK Bubble sort best case tests passed\n";
}

void testMatrixTraversalLowerBound() {
    vector<vector<int>> matrix1 = {{1, 2}, {3, 4}};
    assert(matrixTraversalLowerBound(matrix1) == 10);
    
    vector<vector<int>> matrix2 = {{1, 2, 3}, {4, 5, 6}, {7, 8, 9}};
    assert(matrixTraversalLowerBound(matrix2) == 45);
    cout << "OK Matrix traversal lower bound tests passed\n";
}

int main() {
    cout << "Running Big-Omega Notation tests...\n\n";
    
    testLinearSearchBestCase();
    testBubbleSortBestCase();
    testMatrixTraversalLowerBound();
    
    cout << "\nAll tests passed! OK\n";
    return 0;
}
