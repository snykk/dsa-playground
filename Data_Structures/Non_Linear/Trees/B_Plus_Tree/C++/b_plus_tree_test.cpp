#include <iostream>
#include <cassert>
#include <map>
#include <random>
#include "b_plus_tree.cpp"

void testInsertAndSearch() {
    BPlusTree bptree(3);
    bptree.insert(10, "value10");
    bptree.insert(20, "value20");
    assert(bptree.search(10) == "value10");
    assert(bptree.search(20) == "value20");
    cout << "testInsertAndSearch passed" << endl;
}

void testSplitsKeepEveryKey() {
    for (int t = 2; t <= 4; t++) {
        BPlusTree bptree(t);
        for (int k = 1; k <= 200; k++) bptree.insert(k, "v" + to_string(k));
        assert(bptree.validate());
        for (int k = 1; k <= 200; k++) assert(bptree.search(k) == "v" + to_string(k));
        assert(bptree.search(0) == "");
        assert(bptree.traverse().size() == 200);
    }
    cout << "testSplitsKeepEveryKey passed" << endl;
}

void testDuplicateKeyOverwrites() {
    BPlusTree bptree(2);
    for (int i = 0; i < 10; i++) bptree.insert(5, "v" + to_string(i));
    assert(bptree.search(5) == "v9");
    assert(bptree.traverse().size() == 1);
    assert(bptree.range_search(5, 5).size() == 1);
    cout << "testDuplicateKeyOverwrites passed" << endl;
}

void testRandomAgainstMap() {
    for (int t = 2; t <= 4; t++) {
        mt19937 rng(t);
        BPlusTree bptree(t);
        map<int, string> ref;
        for (int step = 0; step < 3000; step++) {
            int key = rng() % 400;
            string value = "v" + to_string(step);
            bptree.insert(key, value);
            ref[key] = value;
            if (step % 100 == 0) assert(bptree.validate());
        }
        assert(bptree.validate());
        vector<pair<int, string>> all(ref.begin(), ref.end());
        assert(bptree.traverse() == all);
        for (int i = 0; i < 200; i++) {
            int lo = (int)(rng() % 420) - 10;
            int hi = lo + (int)(rng() % 100);
            vector<pair<int, string>> want;
            for (auto& kv : ref) {
                if (kv.first >= lo && kv.first <= hi) want.push_back(kv);
            }
            assert(bptree.range_search(lo, hi) == want);
        }
    }
    cout << "testRandomAgainstMap passed" << endl;
}

int main() {
    cout << "Running B+ Tree tests..." << endl;
    testInsertAndSearch();
    testSplitsKeepEveryKey();
    testDuplicateKeyOverwrites();
    testRandomAgainstMap();
    cout << "\nAll tests passed!" << endl;
    return 0;
}
