#include <iostream>
#include <cassert>
#include "b_plus_tree.cpp"

void testInsertAndSearch() {
    BPlusTree bptree(3);
    bptree.insert(10, "value10");
    bptree.insert(20, "value20");
    assert(bptree.search(10) == "value10");
    assert(bptree.search(20) == "value20");
    cout << "testInsertAndSearch passed" << endl;
}

int main() {
    cout << "Running B+ Tree tests..." << endl;
    testInsertAndSearch();
    cout << "\nAll tests passed! ✓" << endl;
    return 0;
}

