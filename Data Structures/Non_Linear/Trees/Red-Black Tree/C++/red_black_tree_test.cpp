#include <iostream>
#include <cassert>
#include <cstdlib>
#include <type_traits>
#include "red_black_tree.cpp"

void testInsertAndSearch() {
    RedBlackTree rbt;
    rbt.insert(10);
    rbt.insert(20);
    rbt.insert(30);
    assert(rbt.search(10) == true);
    assert(rbt.search(20) == true);
    assert(rbt.search(30) == true);
    assert(rbt.search(40) == false);
    cout << "testInsertAndSearch passed" << endl;
}

void testIsEmpty() {
    RedBlackTree rbt;
    assert(rbt.isEmpty() == true);
    rbt.insert(1);
    assert(rbt.isEmpty() == false);
    cout << "testIsEmpty passed" << endl;
}

void testSize() {
    RedBlackTree rbt;
    assert(rbt.size() == 0);
    rbt.insert(10);
    rbt.insert(20);
    rbt.insert(30);
    assert(rbt.size() == 3);
    cout << "testSize passed" << endl;
}

// Regression: copying used to be allowed and caused a double free.
static_assert(!is_copy_constructible<RedBlackTree>::value, "copy must be deleted");
static_assert(!is_copy_assignable<RedBlackTree>::value, "copy assignment must be deleted");

void testInvariantsRandom() {
    srand(12345);
    for (int trial = 0; trial < 50; trial++) {
        RedBlackTree rbt;
        int n = 1 + rand() % 200;
        for (int i = 0; i < n; i++) {
            rbt.insert(rand() % 60);  // many duplicates on purpose
            assert(rbt.isValid());
        }
        assert(rbt.size() == n);
        vector<int> v = rbt.inorderTraversal();
        for (size_t i = 1; i < v.size(); i++) assert(v[i - 1] <= v[i]);
    }
    cout << "testInvariantsRandom passed" << endl;
}

void testSortedInsertStaysShallow() {
    RedBlackTree rbt;
    for (int i = 0; i < 10000; i++) rbt.insert(i);
    assert(rbt.isValid());
    assert(rbt.size() == 10000);
    cout << "testSortedInsertStaysShallow passed" << endl;
}

int main() {
    cout << "Running Red-Black Tree tests..." << endl;
    testInsertAndSearch();
    testIsEmpty();
    testSize();
    testInvariantsRandom();
    testSortedInsertStaysShallow();
    cout << "\nAll tests passed!" << endl;
    return 0;
}

