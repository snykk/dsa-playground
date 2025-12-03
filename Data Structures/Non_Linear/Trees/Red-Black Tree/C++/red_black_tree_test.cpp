#include <iostream>
#include <cassert>
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

int main() {
    cout << "Running Red-Black Tree tests..." << endl;
    testInsertAndSearch();
    testIsEmpty();
    testSize();
    cout << "\nAll tests passed! ✓" << endl;
    return 0;
}

