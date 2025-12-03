#include <iostream>
#include <cassert>
#include <vector>
#include "segment_tree.cpp"

void testQuery() {
    vector<int> arr = {1, 3, 5, 7, 9, 11};
    SegmentTree st(arr);
    assert(st.query(0, 2) == 9);
    assert(st.query(1, 3) == 15);
    assert(st.query(0, 5) == 36);
    cout << "testQuery passed" << endl;
}

void testUpdate() {
    vector<int> arr = {1, 3, 5, 7, 9, 11};
    SegmentTree st(arr);
    st.update(2, 10);
    assert(st.get(2) == 10);
    assert(st.query(0, 2) == 14);
    cout << "testUpdate passed" << endl;
}

int main() {
    cout << "Running Segment Tree tests..." << endl;
    testQuery();
    testUpdate();
    cout << "\nAll tests passed! ✓" << endl;
    return 0;
}

