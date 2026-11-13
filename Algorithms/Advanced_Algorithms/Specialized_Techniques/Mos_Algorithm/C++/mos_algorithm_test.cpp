#include <cassert>
#include <iostream>
#include <vector>
#include "mos_algorithm.cpp"

void testCountDistinct() {
    vector<int> arr = {1, 1, 2, 1, 3, 4, 3, 3, 4};
    vector<pair<int, int>> queries = {{0, 4}, {1, 3}, {2, 6}, {0, 8}};
    vector<int> results = countDistinctInRanges(arr, queries);
    assert(results[0] == 3);  // [1,1,2,1,3] has 3 distinct
    assert(results[1] == 2);   // [1,2,1] has 2 distinct
    assert(results[2] == 4);  // [2,1,3,4,3] has 4 distinct
    assert(results[3] == 4);  // entire array has 4 distinct
}

void testSingleElement() {
    vector<int> arr = {5, 5, 5, 5};
    vector<pair<int, int>> queries = {{0, 3}};
    vector<int> results = countDistinctInRanges(arr, queries);
    assert(results[0] == 1);
}

void testEmptyArrayNoQueries() {
    vector<int> arr;
    vector<pair<int, int>> queries;
    assert(countDistinctInRanges(arr, queries).empty());
}

void testAnswersFollowInputOrder() {
    vector<int> arr = {1, 2, 1, 3, 2, 3, 4};
    vector<pair<int, int>> queries = {{5, 6}, {0, 0}, {2, 4}, {0, 6}, {3, 3}};
    vector<int> expected = {2, 1, 3, 4, 1};
    assert(countDistinctInRanges(arr, queries) == expected);
}

int main() {
    testCountDistinct();
    testSingleElement();
    testEmptyArrayNoQueries();
    testAnswersFollowInputOrder();
    std::cout << "All tests passed!" << std::endl;
    return 0;
}

