#include <iostream>
#include <vector>
#include <cassert>
#include "meet_in_middle.cpp"

using namespace std;

void testSubsetSum() {
    vector<int> arr = {1, 2, 3, 4, 5, 6};
    assert(subsetSumMeetInMiddle(arr, 10) == true);
    cout << "testSubsetSum passed" << endl;
}

void testUnreachableAndEdgeCases() {
    assert(subsetSumMeetInMiddle({2, 4, 6}, 7) == false);   // all sums are even
    assert(subsetSumMeetInMiddle({}, 0) == true);           // the empty subset
    assert(subsetSumMeetInMiddle({}, 5) == false);
    assert(subsetSumMeetInMiddle({9}, 9) == true);          // odd length
    assert(subsetSumMeetInMiddle({9}, 8) == false);
    assert(subsetSumMeetInMiddle({1, 2, 3}, 0) == true);    // target 0 is always reachable
    assert(subsetSumMeetInMiddle({1, 2, 3}, 7) == false);   // total is 6
    assert(subsetSumMeetInMiddle({-1, 5, 3}, 2) == true);   // -1 + 3
    cout << "testUnreachableAndEdgeCases passed" << endl;
}

int main() {
    testSubsetSum();
    testUnreachableAndEdgeCases();
    return 0;
}

