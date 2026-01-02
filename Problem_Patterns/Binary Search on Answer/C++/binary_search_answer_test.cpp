#include <iostream>
#include <vector>
#include <cassert>
#include "binary_search_answer.cpp"

using namespace std;

void testFindMinCapacity() {
    vector<int> weights = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
    int result = findMinCapacity(weights, 5);
    assert(result == 15);
    cout << "✓ testFindMinCapacity passed" << endl;
}

void testFindKthSmallestDistance() {
    vector<int> nums = {1, 3, 1};
    int result = findKthSmallestDistance(nums, 1);
    assert(result == 0);
    cout << "✓ testFindKthSmallestDistance passed" << endl;
}

void testSplitArrayLargestSum() {
    vector<int> nums = {7, 2, 5, 10, 8};
    int result = splitArrayLargestSum(nums, 2);
    assert(result == 18);
    cout << "✓ testSplitArrayLargestSum passed" << endl;
}

int main() {
    testFindMinCapacity();
    testFindKthSmallestDistance();
    testSplitArrayLargestSum();
    cout << "\nAll tests passed!" << endl;
    return 0;
}

