#include <cassert>
#include <iostream>
#include "two_pointers.cpp"

// Regression: with fewer than two values the old loop bound `arr.size() - 2`
// wrapped around (size_t) and threeSum read past the end of the vector.
void testThreeSumTooFewValues() {
    vector<int> empty;
    assert(threeSum(empty, 0).empty());
    vector<int> one = {5};
    assert(threeSum(one, 5).empty());
    vector<int> two = {1, -1};
    assert(threeSum(two, 0).empty());
    vector<int> three = {1, -1, 0};
    assert(threeSum(three, 0).size() == 1);
}

int main() {
    testThreeSumTooFewValues();

    vector<int> arr1 = {2, 7, 11, 15};
    vector<int> result1 = twoSumSorted(arr1, 9);
    assert(result1.size() == 2 && result1[0] == 0 && result1[1] == 1);
    
    vector<int> arr2 = {-1, 0, 1, 2, -1, -4};
    vector<vector<int>> result2 = threeSum(arr2, 0);
    assert(result2.size() == 2);
    
    assert(isPalindrome("A man, a plan, a canal: Panama") == true);
    assert(isPalindrome("race a car") == false);
    
    vector<int> arr3 = {1, 1, 2, 2, 3, 4, 4, 5};
    int length = removeDuplicates(arr3);
    assert(length == 5);
    
    vector<int> heights = {1, 8, 6, 2, 5, 4, 8, 3, 7};
    assert(containerWithMostWater(heights) == 49);
    
    cout << "All tests passed!" << endl;
    return 0;
}

