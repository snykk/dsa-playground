#include <iostream>
#include <vector>
#include <cassert>
#include "prefix_sum.cpp"

using namespace std;

void testPrefixSum() {
    vector<int> arr = {1, 2, 3, 4, 5};
    PrefixSum ps(arr);
    assert(ps.query(0, 4) == 15);
    cout << "✓ testPrefixSum passed" << endl;
}

int main() {
    testPrefixSum();
    return 0;
}

