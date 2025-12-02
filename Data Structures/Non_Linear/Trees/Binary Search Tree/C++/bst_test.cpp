#include <iostream>
#include <cassert>
#include <vector>
#include "bst.cpp"

bool compareVectors(const vector<int>& a, const vector<int>& b) {
    if (a.size() != b.size()) return false;
    for (size_t i = 0; i < a.size(); i++) {
        if (a[i] != b[i]) return false;
    }
    return true;
}

void testInsertAndSearch() {
    BinarySearchTree bst;
    bst.insert(5);
    bst.insert(3);
    bst.insert(7);
    assert(bst.search(5) == true);
    assert(bst.search(3) == true);
    assert(bst.search(7) == true);
    assert(bst.search(4) == false);
    cout << "testInsertAndSearch passed" << endl;
}

void testIsEmpty() {
    BinarySearchTree bst;
    assert(bst.isEmpty() == true);
    bst.insert(1);
    assert(bst.isEmpty() == false);
    cout << "testIsEmpty passed" << endl;
}

void testSize() {
    BinarySearchTree bst;
    assert(bst.size() == 0);
    bst.insert(5);
    bst.insert(3);
    bst.insert(7);
    assert(bst.size() == 3);
    cout << "testSize passed" << endl;
}

void testHeight() {
    BinarySearchTree bst;
    assert(bst.height() == -1);
    bst.insert(5);
    assert(bst.height() == 0);
    bst.insert(3);
    bst.insert(7);
    assert(bst.height() == 1);
    cout << "testHeight passed" << endl;
}

void testFindMin() {
    BinarySearchTree bst;
    bst.insert(5);
    bst.insert(3);
    bst.insert(7);
    bst.insert(1);
    assert(bst.findMin() == 1);
    cout << "testFindMin passed" << endl;
}

void testFindMax() {
    BinarySearchTree bst;
    bst.insert(5);
    bst.insert(3);
    bst.insert(7);
    bst.insert(9);
    assert(bst.findMax() == 9);
    cout << "testFindMax passed" << endl;
}

void testInorderTraversalSorted() {
    BinarySearchTree bst;
    bst.insert(5);
    bst.insert(2);
    bst.insert(8);
    bst.insert(1);
    bst.insert(3);
    vector<int> result = bst.inorderTraversal();
    vector<int> expected = {1, 2, 3, 5, 8};
    assert(compareVectors(result, expected));
    cout << "testInorderTraversalSorted passed" << endl;
}

void testDeleteLeaf() {
    BinarySearchTree bst;
    bst.insert(5);
    bst.insert(3);
    bst.insert(7);
    bst.deleteNode(3);
    assert(bst.search(3) == false);
    assert(bst.search(5) == true);
    assert(bst.search(7) == true);
    assert(bst.size() == 2);
    cout << "testDeleteLeaf passed" << endl;
}

void testDeleteOneChild() {
    BinarySearchTree bst;
    bst.insert(5);
    bst.insert(3);
    bst.insert(2);
    bst.deleteNode(3);
    assert(bst.search(3) == false);
    assert(bst.search(2) == true);
    assert(bst.size() == 2);
    cout << "testDeleteOneChild passed" << endl;
}

void testDeleteTwoChildren() {
    BinarySearchTree bst;
    bst.insert(5);
    bst.insert(3);
    bst.insert(7);
    bst.insert(2);
    bst.insert(4);
    bst.deleteNode(3);
    assert(bst.search(3) == false);
    assert(bst.search(2) == true);
    assert(bst.search(4) == true);
    assert(bst.size() == 4);
    cout << "testDeleteTwoChildren passed" << endl;
}

int main() {
    cout << "Running Binary Search Tree tests..." << endl;
    testInsertAndSearch();
    testIsEmpty();
    testSize();
    testHeight();
    testFindMin();
    testFindMax();
    testInorderTraversalSorted();
    testDeleteLeaf();
    testDeleteOneChild();
    testDeleteTwoChildren();
    cout << "\nAll tests passed! ✓" << endl;
    return 0;
}

