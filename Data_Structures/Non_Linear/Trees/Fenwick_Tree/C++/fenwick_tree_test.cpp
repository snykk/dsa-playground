#include <iostream>
#include <cassert>
#include <vector>
#include <random>
#include <numeric>
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

// Regression: sums used to be int and overflowed (2e9 + 2e9).
void testNoOverflow() {
    FenwickTree ft({2000000000, 2000000000});
    assert(ft.query(0, 1) == 4000000000LL);
    ft.update(0, 2000000000);
    assert(ft.get(0) == 4000000000LL);
    cout << "testNoOverflow passed" << endl;
}

// Regression: update(-1, x) used to loop forever.
void testOutOfRangeThrows() {
    FenwickTree ft(vector<int>{1, 2, 3});
    int thrown = 0;
    try { ft.update(-1, 5); } catch (const out_of_range&) { thrown++; }
    try { ft.update(3, 5); } catch (const out_of_range&) { thrown++; }
    try { ft.prefixSum(3); } catch (const out_of_range&) { thrown++; }
    try { ft.query(2, 1); } catch (const out_of_range&) { thrown++; }
    assert(thrown == 4);
    cout << "testOutOfRangeThrows passed" << endl;
}

void testRandomAgainstBruteForce() {
    mt19937 rng(7);
    for (int n = 1; n < 40; n++) {
        vector<int> ref(n);
        for (int& v : ref) v = (int)(rng() % 101) - 50;
        FenwickTree ft(ref);
        for (int step = 0; step < 60; step++) {
            if (rng() % 2) {
                int i = rng() % n, d = (int)(rng() % 41) - 20;
                ref[i] += d;
                ft.update(i, d);
            } else {
                int l = rng() % n;
                int r = l + rng() % (n - l);
                long long want = accumulate(ref.begin() + l, ref.begin() + r + 1, 0LL);
                assert(ft.query(l, r) == want);
            }
        }
    }
    cout << "testRandomAgainstBruteForce passed" << endl;
}

int main() {
    cout << "Running Fenwick Tree tests..." << endl;
    testQuery();
    testUpdate();
    testNoOverflow();
    testOutOfRangeThrows();
    testRandomAgainstBruteForce();
    cout << "\nAll tests passed!" << endl;
    return 0;
}

