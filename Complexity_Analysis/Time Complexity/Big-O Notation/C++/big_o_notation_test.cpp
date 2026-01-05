/*
 * Test cases for Big-O Notation examples
 */

#include <iostream>
#include <vector>
#include <cassert>
#include "big_o_notation.cpp"

using namespace std;

void testConstantTime() {
    assert(constantTimeExample(100) == 42);
    assert(constantTimeExample(1000) == 42);
    assert(constantTimeExample(10000) == 42);
    cout << "✓ Constant time tests passed\n";
}

void testLogarithmicTime() {
    assert(logarithmicTimeExample(8) == 3);
    assert(logarithmicTimeExample(16) == 4);
    assert(logarithmicTimeExample(32) == 5);
    assert(logarithmicTimeExample(64) == 6);
    cout << "✓ Logarithmic time tests passed\n";
}

void testLinearTime() {
    vector<int> arr1 = {1, 2, 3};
    assert(linearTimeExample(arr1) == 6);
    
    vector<int> arr2 = {10, 20, 30, 40};
    assert(linearTimeExample(arr2) == 100);
    
    vector<int> arr3 = {};
    assert(linearTimeExample(arr3) == 0);
    cout << "✓ Linear time tests passed\n";
}

void testLinearithmicTime() {
    vector<int> arr1 = {64, 34, 25, 12, 22, 11, 90};
    vector<int> sorted1 = linearithmicTimeExample(arr1);
    vector<int> expected1 = {11, 12, 22, 25, 34, 64, 90};
    assert(sorted1 == expected1);
    
    vector<int> arr2 = {5, 2, 8, 1, 9};
    vector<int> sorted2 = linearithmicTimeExample(arr2);
    vector<int> expected2 = {1, 2, 5, 8, 9};
    assert(sorted2 == expected2);
    cout << "✓ Linearithmic time tests passed\n";
}

void testQuadraticTime() {
    vector<int> arr = {1, 2, 3};
    vector<pair<int, int>> pairs = quadraticTimeExample(arr);
    assert(pairs.size() == 3);  // C(3,2) = 3
    
    vector<int> arr2 = {1, 2, 3, 4};
    vector<pair<int, int>> pairs2 = quadraticTimeExample(arr2);
    assert(pairs2.size() == 6);  // C(4,2) = 6
    cout << "✓ Quadratic time tests passed\n";
}

void testCubicTime() {
    assert(cubicTimeExample(1) == 1);
    assert(cubicTimeExample(2) == 8);
    assert(cubicTimeExample(3) == 27);
    assert(cubicTimeExample(5) == 125);
    cout << "✓ Cubic time tests passed\n";
}

void testExponentialTime() {
    assert(exponentialTimeExample(0) == 0);
    assert(exponentialTimeExample(1) == 1);
    assert(exponentialTimeExample(2) == 1);
    assert(exponentialTimeExample(3) == 2);
    assert(exponentialTimeExample(4) == 3);
    assert(exponentialTimeExample(5) == 5);
    assert(exponentialTimeExample(6) == 8);
    cout << "✓ Exponential time tests passed\n";
}

int main() {
    cout << "Running Big-O Notation tests...\n\n";
    
    testConstantTime();
    testLogarithmicTime();
    testLinearTime();
    testLinearithmicTime();
    testQuadraticTime();
    testCubicTime();
    testExponentialTime();
    
    cout << "\nAll tests passed! ✓\n";
    return 0;
}

