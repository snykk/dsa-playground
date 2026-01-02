#include <iostream>
#include <vector>
#include <cassert>
#include "meet_in_middle.cpp"

using namespace std;

void testSubsetSum() {
    vector<int> arr = {1, 2, 3, 4, 5, 6};
    assert(subsetSumMeetInMiddle(arr, 10) == true);
    cout << "✓ testSubsetSum passed" << endl;
}

int main() {
    testSubsetSum();
    return 0;
}

