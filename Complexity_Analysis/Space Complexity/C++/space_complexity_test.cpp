/*
 * Test cases for Space Complexity examples
 */

#include <iostream>
#include <vector>
#include <cassert>
#include "space_complexity.cpp"

using namespace std;

void testConstantSpace() {
    assert(constantSpaceExample(10) == 55);
    assert(constantSpaceExample(100) == 5050);
    cout << "OK Constant space tests passed\n";
}

void testLinearSpace() {
    vector<int> result = linearSpaceExample(5);
    assert(result.size() == 5);
    assert(result[0] == 1);
    assert(result[4] == 5);
    cout << "OK Linear space tests passed\n";
}

void testQuadraticSpace() {
    vector<vector<int>> matrix = quadraticSpaceExample(3);
    assert(matrix.size() == 3);
    assert(matrix[0].size() == 3);
    assert(matrix[0][0] == 0);
    assert(matrix[2][2] == 8);
    cout << "OK Quadratic space tests passed\n";
}

void testInPlaceReverse() {
    vector<int> arr1 = {1, 2, 3, 4, 5};
    inPlaceReverse(arr1);
    vector<int> expected1 = {5, 4, 3, 2, 1};
    assert(arr1 == expected1);
    
    vector<int> arr2 = {1};
    inPlaceReverse(arr2);
    vector<int> expected2 = {1};
    assert(arr2 == expected2);
    cout << "OK In-place reverse tests passed\n";
}

int main() {
    cout << "Running Space Complexity tests...\n\n";
    
    testConstantSpace();
    testLinearSpace();
    testQuadraticSpace();
    testInPlaceReverse();
    
    cout << "\nAll tests passed! OK\n";
    return 0;
}
