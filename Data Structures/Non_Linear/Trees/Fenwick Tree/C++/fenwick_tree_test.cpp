#include <iostream>
#include <cassert>
#include <vector>
#include "fenwick_tree.cpp"

void testQuery() {
    vector<int> arr = {1, 3, 5, 7, 9, 11};
    FenwickTree ft(arr);
    assert(ft.query(0, 2) == 9);
    assert(ft.query(1, 3) == 15);
    assert(ft.query(0, 5) == 36);
    cout << "testQuery passed" << endl;
}

void testUpdate() {
    vector<int> arr = {1, 3, 5, 7, 9, 11};
    FenwickTree ft(arr);
    ft.update(2, 5);
    assert(ft.get(2) == 10);
    assert(ft.query(0, 2) == 14);
    cout << "testUpdate passed" << endl;
}

int main() {
    cout << "Running Fenwick Tree tests..." << endl;
    testQuery();
    testUpdate();
    cout << "\nAll tests passed! ✓" << endl;
    return 0;
}

