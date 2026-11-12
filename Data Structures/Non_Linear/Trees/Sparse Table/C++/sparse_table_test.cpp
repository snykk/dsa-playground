#include <iostream>
#include <vector>
#include <cassert>
#include <random>
#include "sparse_table.cpp"
using namespace std;

void test_min_query() {
    vector<int> arr = {1, 3, 5, 7, 9, 11, 2, 4, 6, 8};
    SparseTable st(arr, "min");
    
    assert(st.query(0, 2) == 1);  // min(1, 3, 5) = 1
    assert(st.query(1, 3) == 3);  // min(3, 5, 7) = 3
    assert(st.query(0, 5) == 1);  // min of first 6 elements
    assert(st.query(6, 9) == 2);  // min(2, 4, 6, 8) = 2
    cout << "Min query tests passed!" << endl;
}

void test_max_query() {
    vector<int> arr = {1, 3, 5, 7, 9, 11, 2, 4, 6, 8};
    SparseTable st(arr, "max");
    
    assert(st.query(0, 2) == 5);  // max(1, 3, 5) = 5
    assert(st.query(1, 3) == 7);  // max(3, 5, 7) = 7
    assert(st.query(0, 5) == 11);  // max of first 6 elements
    assert(st.query(6, 9) == 8);  // max(2, 4, 6, 8) = 8
    cout << "Max query tests passed!" << endl;
}

void test_single_element() {
    vector<int> arr = {5};
    SparseTable st_min(arr, "min");
    SparseTable st_max(arr, "max");
    
    assert(st_min.query(0, 0) == 5);
    assert(st_max.query(0, 0) == 5);
    cout << "Single element tests passed!" << endl;
}

void test_range_queries() {
    vector<int> arr = {1, 3, 5, 7, 9, 11, 2, 4, 6, 8};
    SparseTable st_min(arr, "min");
    SparseTable st_max(arr, "max");
    
    assert(st_min.query(0, 0) == 1);
    assert(st_min.query(5, 5) == 11);
    assert(st_min.query(2, 4) == 5);  // min(5, 7, 9) = 5
    
    assert(st_max.query(0, 0) == 1);
    assert(st_max.query(5, 5) == 11);
    assert(st_max.query(2, 4) == 9);  // max(5, 7, 9) = 9
    cout << "Range query tests passed!" << endl;
}

void test_full_range() {
    vector<int> arr = {1, 3, 5, 7, 9, 11, 2, 4, 6, 8};
    SparseTable st_min(arr, "min");
    SparseTable st_max(arr, "max");
    
    assert(st_min.query(0, 9) == 1);  // min of all
    assert(st_max.query(0, 9) == 11);  // max of all
    cout << "Full range tests passed!" << endl;
}

void test_get() {
    vector<int> arr = {1, 3, 5, 7, 9, 11, 2, 4, 6, 8};
    SparseTable st(arr, "min");
    
    assert(st.get(0) == 1);
    assert(st.get(5) == 11);
    cout << "Get tests passed!" << endl;
}

// Regression: an empty input used to abort (log of 0 converted to int).
void test_empty_input() {
    SparseTable st(vector<int>{}, "min");
    bool thrown = false;
    try { st.query(0, 0); } catch (const out_of_range&) { thrown = true; }
    assert(thrown);
    cout << "test_empty_input passed" << endl;
}

// Regression: any type other than "min" silently meant max.
void test_invalid_query_type() {
    bool thrown = false;
    try { SparseTable st(vector<int>{5, 1, 9}, "sum"); } catch (const invalid_argument&) { thrown = true; }
    assert(thrown);
    cout << "test_invalid_query_type passed" << endl;
}

void test_out_of_range() {
    SparseTable st(vector<int>{1, 2, 3}, "min");
    int thrown = 0;
    try { st.query(-1, 1); } catch (const out_of_range&) { thrown++; }
    try { st.query(0, 3); } catch (const out_of_range&) { thrown++; }
    try { st.get(3); } catch (const out_of_range&) { thrown++; }
    assert(thrown == 3);
    assert(st.query(2, 0) == st.query(0, 2));
    cout << "test_out_of_range passed" << endl;
}

void test_random_against_brute_force() {
    mt19937 rng(11);
    for (int n = 1; n < 70; n++) {
        vector<int> arr(n);
        for (int& v : arr) v = (int)(rng() % 201) - 100;
        SparseTable lo(arr, "min"), hi(arr, "max");
        for (int l = 0; l < n; l++) {
            for (int r = l; r < n; r++) {
                assert(lo.query(l, r) == *min_element(arr.begin() + l, arr.begin() + r + 1));
                assert(hi.query(l, r) == *max_element(arr.begin() + l, arr.begin() + r + 1));
            }
        }
    }
    cout << "test_random_against_brute_force passed" << endl;
}

int main() {
    test_min_query();
    test_max_query();
    test_single_element();
    test_range_queries();
    test_full_range();
    test_get();
    test_empty_input();
    test_invalid_query_type();
    test_out_of_range();
    test_random_against_brute_force();
    cout << "All tests passed!" << endl;
    return 0;
}

