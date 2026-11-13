#include <iostream>
#include <vector>
#include <cassert>
#include "binary_search_answer.cpp"

using namespace std;

void testFindMinCapacity() {
    vector<int> weights = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
    int result = findMinCapacity(weights, 5);
    assert(result == 15);
    cout << "PASS: testFindMinCapacity" << endl;
}

void testFindKthSmallestDistance() {
    vector<int> nums = {1, 3, 1};
    int result = findKthSmallestDistance(nums, 1);
    assert(result == 0);
    cout << "PASS: testFindKthSmallestDistance" << endl;
}

void testSplitArrayLargestSum() {
    vector<int> nums = {7, 2, 5, 10, 8};
    int result = splitArrayLargestSum(nums, 2);
    assert(result == 18);
    cout << "PASS: testSplitArrayLargestSum" << endl;
}

// Nothing feasible: the search returns -1 (the Python version now does too).
void testInfeasibleReturnsMinusOne() {
    vector<int> weights = {1, 2, 3};
    assert(findMinCapacity(weights, 0) == -1);
    assert(splitArrayLargestSum(weights, 0) == -1);
    vector<int> nums = {1, 3, 1};
    assert(findKthSmallestDistance(nums, 5) == -1);  // only 3 pairs exist
    cout << "PASS: testInfeasibleReturnsMinusOne" << endl;
}

int main() {
    testFindMinCapacity();
    testFindKthSmallestDistance();
    testSplitArrayLargestSum();
    testInfeasibleReturnsMinusOne();
    cout << "\nAll tests passed!" << endl;
    return 0;
}

