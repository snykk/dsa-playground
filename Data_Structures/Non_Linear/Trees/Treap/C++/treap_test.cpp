#include "treap.h"

#include <algorithm>
#include <cassert>
#include <climits>
#include <iostream>
#include <random>
#include <set>
#include <vector>

std::vector<int> collectInorder(const Treap& t) {
    std::vector<int> out;
    t.inorder([&](int k) { out.push_back(k); });
    return out;
}

void testEmpty() {
    Treap t;
    assert(t.size() == 0);
    assert(!t.contains(1));
    assert(collectInorder(t).empty());
}

void testSingleInsert() {
    Treap t;
    assert(t.insert(5));
    assert(t.size() == 1);
    assert(t.contains(5));
}

void testDuplicateInsert() {
    Treap t;
    assert(t.insert(5));
    assert(!t.insert(5));
    assert(t.size() == 1);
}

void testInorderSorted() {
    Treap t;
    std::vector<int> keys = {5, 3, 7, 1, 9, 4, 6, 2, 8};
    for (int k : keys) t.insert(k);
    auto result = collectInorder(t);
    std::vector<int> expected(keys.begin(), keys.end());
    std::sort(expected.begin(), expected.end());
    assert(result == expected);
}

void testDeleteExisting() {
    Treap t;
    for (int k : {5, 3, 7}) t.insert(k);
    assert(t.erase(3));
    assert(!t.contains(3));
    assert(t.size() == 2);
}

void testDeleteNonexistent() {
    Treap t;
    t.insert(5);
    assert(!t.erase(99));
    assert(t.size() == 1);
}

void testDeleteAll() {
    Treap t;
    std::vector<int> keys = {10, 20, 5, 15, 25, 3, 8};
    for (int k : keys) t.insert(k);
    for (int k : keys) assert(t.erase(k));
    assert(t.size() == 0);
}

void testRandomizedStress() {
    std::mt19937 rng(42);
    Treap t;
    std::set<int> ref;
    for (int i = 0; i < 1000; ++i) {
        int k = rng() % 500;
        if (rng() % 2 == 0) {
            bool expected = ref.find(k) == ref.end();
            assert(t.insert(k) == expected);
            ref.insert(k);
        } else {
            bool expected = ref.find(k) != ref.end();
            assert(t.erase(k) == expected);
            ref.erase(k);
        }
    }
    auto got = collectInorder(t);
    std::vector<int> expected(ref.begin(), ref.end());
    assert(got == expected);
    assert(t.checkHeapProperty());
}

void testHeapProperty() {
    Treap t;
    for (int k : {50, 25, 75, 10, 40, 60, 90, 5, 15, 35, 55})
        t.insert(k);
    assert(t.checkHeapProperty());
}

// Regression: erase used key + 1, which overflows at INT_MAX and left the key behind.
void testEraseExtremeKeys() {
    Treap t;
    t.insert(1);
    t.insert(INT_MAX);
    t.insert(INT_MIN);
    assert(t.erase(INT_MAX));
    assert(!t.contains(INT_MAX));
    assert(t.size() == 2);
    assert((collectInorder(t) == std::vector<int>{INT_MIN, 1}));
    assert(t.erase(INT_MIN));
    assert(t.erase(1));
    assert(t.size() == 0);
}

int main() {
    testEmpty();
    testSingleInsert();
    testDuplicateInsert();
    testInorderSorted();
    testDeleteExisting();
    testDeleteNonexistent();
    testDeleteAll();
    testRandomizedStress();
    testHeapProperty();
    testEraseExtremeKeys();
    std::cout << "All 10 tests passed!" << std::endl;
    return 0;
}
