#include <iostream>
#include <cassert>
#include <vector>
#include <set>
#include <type_traits>
#include "avl_tree.cpp"

bool compareVectors(const vector<int>& a, const vector<int>& b) {
    if (a.size() != b.size()) return false;
    for (size_t i = 0; i < a.size(); i++) {
        if (a[i] != b[i]) return false;
    }
    return true;
}

void testInsertAndSearch() {
    AVLTree avl;
    avl.insert(10);
    avl.insert(20);
    avl.insert(30);
    assert(avl.search(10) == true);
    assert(avl.search(20) == true);
    assert(avl.search(30) == true);
    assert(avl.search(40) == false);
    assert(avl.isBalanced() == true);
    cout << "testInsertAndSearch passed" << endl;
}

void testIsEmpty() {
    AVLTree avl;
    assert(avl.isEmpty() == true);
    avl.insert(1);
    assert(avl.isEmpty() == false);
    cout << "testIsEmpty passed" << endl;
}

void testSize() {
    AVLTree avl;
    assert(avl.size() == 0);
    avl.insert(10);
    avl.insert(20);
    avl.insert(30);
    assert(avl.size() == 3);
    cout << "testSize passed" << endl;
}

void testHeightBalanced() {
    AVLTree avl;
    assert(avl.height() == 0);
    avl.insert(10);
    assert(avl.height() == 1);
    avl.insert(20);
    avl.insert(30);
    // After balancing, height should be 2 (not 3)
    assert(avl.height() == 2);
    assert(avl.isBalanced() == true);
    cout << "testHeightBalanced passed" << endl;
}

void testFindMin() {
    AVLTree avl;
    avl.insert(10);
    avl.insert(5);
    avl.insert(15);
    assert(avl.findMin() == 5);
    cout << "testFindMin passed" << endl;
}

void testFindMax() {
    AVLTree avl;
    avl.insert(10);
    avl.insert(5);
    avl.insert(15);
    assert(avl.findMax() == 15);
    cout << "testFindMax passed" << endl;
}

void testInorderTraversalSorted() {
    AVLTree avl;
    avl.insert(50);
    avl.insert(30);
    avl.insert(70);
    avl.insert(20);
    avl.insert(40);
    vector<int> result = avl.inorderTraversal();
    vector<int> expected = {20, 30, 40, 50, 70};
    assert(compareVectors(result, expected));
    assert(avl.isBalanced() == true);
    cout << "testInorderTraversalSorted passed" << endl;
}

void testDeleteMaintainsBalance() {
    AVLTree avl;
    avl.insert(10);
    avl.insert(20);
    avl.insert(30);
    avl.insert(40);
    avl.insert(50);
    assert(avl.isBalanced() == true);
    
    avl.deleteNode(30);
    assert(avl.search(30) == false);
    assert(avl.isBalanced() == true);
    
    avl.deleteNode(40);
    assert(avl.isBalanced() == true);
    cout << "testDeleteMaintainsBalance passed" << endl;
}

// Regression: the class owns raw pointers; copying used to double free.
static_assert(!is_copy_constructible<AVLTree>::value, "AVLTree must not be copyable");
static_assert(!is_copy_assignable<AVLTree>::value, "AVLTree must not be copyable");

void testRandomOpsMatchSet() {
    AVLTree avl;
    set<int> ref;
    unsigned seed = 12345;
    for (int i = 0; i < 3000; i++) {
        seed = seed * 1103515245u + 12345u;
        int key = (int)((seed >> 16) % 200);
        if ((seed >> 8) % 3 == 0) {
            avl.deleteNode(key);
            ref.erase(key);
        } else {
            avl.insert(key);
            ref.insert(key);
        }
        assert(avl.isBalanced());
    }
    vector<int> expected(ref.begin(), ref.end());
    assert(compareVectors(avl.inorderTraversal(), expected));
    assert(avl.size() == (int)ref.size());
    // 200 distinct keys fit in height <= 1.44 * log2(202), i.e. at most 11 nodes deep.
    assert(avl.height() <= 11);
    cout << "testRandomOpsMatchSet passed" << endl;
}

int main() {
    cout << "Running AVL Tree tests..." << endl;
    testInsertAndSearch();
    testIsEmpty();
    testSize();
    testHeightBalanced();
    testFindMin();
    testFindMax();
    testInorderTraversalSorted();
    testDeleteMaintainsBalance();
    testRandomOpsMatchSet();
    cout << "\nAll tests passed!" << endl;
    return 0;
}

