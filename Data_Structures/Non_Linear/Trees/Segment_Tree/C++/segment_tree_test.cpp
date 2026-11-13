#include <iostream>
#include <cassert>
#include <vector>
#include <random>
#include <numeric>
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

// Regression: sums used to be int and overflowed (2e9 + 2e9).
void testNoOverflow() {
    SegmentTree st({2000000000, 2000000000});
    assert(st.query(0, 1) == 4000000000LL);
    st.update(0, 3000000000LL);
    assert(st.get(0) == 3000000000LL);
    cout << "testNoOverflow passed" << endl;
}

void testOutOfRangeThrows() {
    SegmentTree st(vector<int>{1, 2, 3});
    int thrown = 0;
    try { st.get(-1); } catch (const out_of_range&) { thrown++; }
    try { st.query(-1, 2); } catch (const out_of_range&) { thrown++; }
    try { st.query(0, 3); } catch (const out_of_range&) { thrown++; }
    try { st.query(2, 1); } catch (const out_of_range&) { thrown++; }
    try { st.update(3, 1); } catch (const out_of_range&) { thrown++; }
    assert(thrown == 5);
    cout << "testOutOfRangeThrows passed" << endl;
}

void testRandomAgainstBruteForce() {
    mt19937 rng(3);
    for (int n = 1; n <= 40; n++) {
        vector<int> ref(n);
        for (int& v : ref) v = (int)(rng() % 101) - 50;
        SegmentTree st(ref);
        for (int step = 0; step < 60; step++) {
            if (rng() % 10 < 4) {
                int i = rng() % n, v = (int)(rng() % 101) - 50;
                ref[i] = v;
                st.update(i, v);
            } else {
                int l = rng() % n;
                int r = l + rng() % (n - l);
                assert(st.query(l, r) == accumulate(ref.begin() + l, ref.begin() + r + 1, 0LL));
            }
        }
    }
    cout << "testRandomAgainstBruteForce passed" << endl;
}

int main() {
    cout << "Running Segment Tree tests..." << endl;
    testQuery();
    testUpdate();
    testNoOverflow();
    testOutOfRangeThrows();
    testRandomAgainstBruteForce();
    cout << "\nAll tests passed!" << endl;
    return 0;
}

