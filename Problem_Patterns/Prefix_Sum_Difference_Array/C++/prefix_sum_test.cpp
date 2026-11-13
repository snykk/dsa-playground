#include <iostream>
#include <vector>
#include <cassert>
#include "prefix_sum.cpp"

using namespace std;

void testPrefixSum() {
    vector<int> arr = {1, 2, 3, 4, 5};
    PrefixSum ps(arr);
    assert(ps.query(0, 4) == 15);
    cout << "testPrefixSum passed" << endl;
}

void testPrefixSumRanges() {
    PrefixSum ps({3, 1, 4, 1, 5});
    assert(ps.query(1, 3) == 6);
    assert(ps.query(0, 0) == 3);
    assert(ps.query(4, 4) == 5);
    PrefixSum neg({5, -2, 7, -4});
    assert(neg.query(1, 3) == 1);
    cout << "testPrefixSumRanges passed" << endl;
}

void testDifferenceArray() {
    DifferenceArray da(5);
    da.update(0, 2, 5);
    da.update(1, 3, 3);
    assert((da.getArray() == vector<int>{5, 8, 8, 3, 0}));
    // an update that reaches the last cell
    DifferenceArray tail(4);
    tail.update(1, 3, 10);
    assert((tail.getArray() == vector<int>{0, 10, 10, 10}));
    cout << "testDifferenceArray passed" << endl;
}

int main() {
    testPrefixSum();
    testPrefixSumRanges();
    testDifferenceArray();
    return 0;
}

