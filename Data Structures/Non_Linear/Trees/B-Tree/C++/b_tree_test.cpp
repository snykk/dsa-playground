#include <iostream>
#include <cassert>
#include <set>
#include <random>
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

// Regression: splitChild used to lose one key on every split.
void testSplitKeepsAllKeys() {
    for (int t = 2; t <= 4; t++) {
        BTree btree(t);
        for (int k = 1; k <= 100; k++) btree.insert(k);
        for (int k = 1; k <= 100; k++) assert(btree.search(k));
        assert(btree.validate());
        vector<int> keys = btree.traverse();
        assert((int)keys.size() == 100);
        for (int k = 0; k < 100; k++) assert(keys[k] == k + 1);
    }
    cout << "testSplitKeepsAllKeys passed" << endl;
}

void testDeleteMiddleChildMerge() {
    BTree btree(3);
    for (int k = 1; k <= 12; k++) btree.insert(k);
    assert(btree.remove(4));
    assert(!btree.search(4));
    assert(!btree.remove(4));
    assert(btree.validate());
    assert(btree.traverse().size() == 11);
    cout << "testDeleteMiddleChildMerge passed" << endl;
}

void testRandomAgainstSet() {
    for (int t = 2; t <= 4; t++) {
        mt19937 rng(t);
        BTree btree(t);
        set<int> ref;
        for (int step = 0; step < 3000; step++) {
            int key = rng() % 150;
            int op = rng() % 10;
            if (op < 5) {
                if (!ref.count(key)) {
                    btree.insert(key);
                    ref.insert(key);
                }
            } else if (op < 9) {
                assert(btree.remove(key) == (ref.erase(key) == 1));
            } else {
                assert(btree.search(key) == (ref.count(key) == 1));
            }
            if (step % 50 == 0) {
                assert(btree.validate());
                assert(btree.traverse() == vector<int>(ref.begin(), ref.end()));
            }
        }
        for (int k : vector<int>(ref.begin(), ref.end())) {
            assert(btree.remove(k));
            assert(btree.validate());
        }
        assert(btree.traverse().empty());
    }
    cout << "testRandomAgainstSet passed" << endl;
}

int main() {
    cout << "Running B-Tree tests..." << endl;
    testInsertAndSearch();
    testSplitKeepsAllKeys();
    testDeleteMiddleChildMerge();
    testRandomAgainstSet();
    cout << "\nAll tests passed!" << endl;
    return 0;
}
