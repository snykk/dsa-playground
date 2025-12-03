#include <iostream>
#include <cassert>
#include "b_tree.cpp"

void testInsertAndSearch() {
    BTree btree(3);
    btree.insert(10);
    btree.insert(20);
    btree.insert(5);
    assert(btree.search(10) == true);
    assert(btree.search(20) == true);
    assert(btree.search(5) == true);
    assert(btree.search(99) == false);
    cout << "testInsertAndSearch passed" << endl;
}

int main() {
    cout << "Running B-Tree tests..." << endl;
    testInsertAndSearch();
    cout << "\nAll tests passed! ✓" << endl;
    return 0;
}

