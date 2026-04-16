#include <iostream>
#include <cassert>
#include <vector>
#include "segment_tree_lazy.cpp"

void testBuildAndQuery() {
    vector<int> arr = {1, 3, 5, 7, 9, 11};
    LazySegmentTree st(arr);
    assert(st.query(0, 5) == 36);
    assert(st.query(0, 2) == 9);
    assert(st.query(1, 3) == 15);
    assert(st.query(3, 5) == 27);
    cout << "testBuildAndQuery passed" << endl;
}

void testSingleElementQuery() {
    vector<int> arr = {1, 3, 5, 7, 9, 11};
    LazySegmentTree st(arr);
    assert(st.query(0, 0) == 1);
    assert(st.query(2, 2) == 5);
    assert(st.query(5, 5) == 11);
    cout << "testSingleElementQuery passed" << endl;
}

void testSingleElementUpdate() {
    vector<int> arr = {1, 3, 5, 7, 9, 11};
    LazySegmentTree st(arr);
    st.updateRange(2, 2, 5);
    assert(st.query(2, 2) == 10);
    assert(st.query(0, 2) == 14);
    assert(st.query(0, 5) == 41);
    cout << "testSingleElementUpdate passed" << endl;
}

void testRangeUpdateThenQuery() {
    vector<int> arr = {1, 3, 5, 7, 9, 11};
    LazySegmentTree st(arr);
    st.updateRange(1, 4, 10);
    assert(st.query(0, 5) == 76);
    assert(st.query(1, 4) == 64);
    assert(st.query(0, 0) == 1);
    assert(st.query(5, 5) == 11);
    cout << "testRangeUpdateThenQuery passed" << endl;
}

void testMultipleOverlappingUpdates() {
    vector<int> arr = {1, 3, 5, 7, 9, 11};
    LazySegmentTree st(arr);
    st.updateRange(0, 3, 2);
    st.updateRange(2, 5, 3);
    assert(st.query(0, 0) == 3);
    assert(st.query(1, 1) == 5);
    assert(st.query(2, 2) == 10);
    assert(st.query(3, 3) == 12);
    assert(st.query(4, 4) == 12);
    assert(st.query(5, 5) == 14);
    assert(st.query(0, 5) == 56);
    cout << "testMultipleOverlappingUpdates passed" << endl;
}

void testFullRangeUpdate() {
    vector<int> arr = {1, 3, 5, 7, 9, 11};
    LazySegmentTree st(arr);
    st.updateRange(0, 5, 1);
    assert(st.query(0, 5) == 42);
    cout << "testFullRangeUpdate passed" << endl;
}

void testSingleElementArray() {
    vector<int> arr = {42};
    LazySegmentTree st(arr);
    assert(st.query(0, 0) == 42);
    st.updateRange(0, 0, 8);
    assert(st.query(0, 0) == 50);
    cout << "testSingleElementArray passed" << endl;
}

void testNegativeValues() {
    vector<int> arr = {1, 3, 5, 7, 9, 11};
    LazySegmentTree st(arr);
    st.updateRange(0, 5, -1);
    assert(st.query(0, 5) == 30);
    cout << "testNegativeValues passed" << endl;
}

int main() {
    cout << "Running Segment Tree (Lazy Propagation) tests..." << endl;
    testBuildAndQuery();
    testSingleElementQuery();
    testSingleElementUpdate();
    testRangeUpdateThenQuery();
    testMultipleOverlappingUpdates();
    testFullRangeUpdate();
    testSingleElementArray();
    testNegativeValues();
    cout << "\nAll tests passed!" << endl;
    return 0;
}
