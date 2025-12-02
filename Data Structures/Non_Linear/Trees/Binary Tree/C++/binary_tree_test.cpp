#include <iostream>
#include <cassert>
#include <vector>
#include "binary_tree.cpp"

bool compareVectors(const vector<int>& a, const vector<int>& b) {
    if (a.size() != b.size()) return false;
    for (size_t i = 0; i < a.size(); i++) {
        if (a[i] != b[i]) return false;
    }
    return true;
}

void testInsertAndSearch() {
    BinaryTree tree;
    tree.insert(1);
    tree.insert(2);
    tree.insert(3);
    assert(tree.search(1) == true);
    assert(tree.search(2) == true);
    assert(tree.search(3) == true);
    assert(tree.search(4) == false);
    cout << "testInsertAndSearch passed" << endl;
}

void testIsEmpty() {
    BinaryTree tree;
    assert(tree.isEmpty() == true);
    tree.insert(1);
    assert(tree.isEmpty() == false);
    cout << "testIsEmpty passed" << endl;
}

void testSize() {
    BinaryTree tree;
    assert(tree.size() == 0);
    tree.insert(1);
    tree.insert(2);
    tree.insert(3);
    assert(tree.size() == 3);
    cout << "testSize passed" << endl;
}

void testHeight() {
    BinaryTree tree;
    assert(tree.height() == -1);
    tree.insert(1);
    assert(tree.height() == 0);
    tree.insert(2);
    tree.insert(3);
    assert(tree.height() == 1);
    cout << "testHeight passed" << endl;
}

void testInorderTraversal() {
    BinaryTree tree;
    tree.insert(1);
    tree.insert(2);
    tree.insert(3);
    tree.insert(4);
    tree.insert(5);
    vector<int> result = tree.inorderTraversal();
    vector<int> expected = {4, 2, 5, 1, 3};
    assert(compareVectors(result, expected));
    cout << "testInorderTraversal passed" << endl;
}

void testPreorderTraversal() {
    BinaryTree tree;
    tree.insert(1);
    tree.insert(2);
    tree.insert(3);
    vector<int> result = tree.preorderTraversal();
    vector<int> expected = {1, 2, 3};
    assert(compareVectors(result, expected));
    cout << "testPreorderTraversal passed" << endl;
}

void testPostorderTraversal() {
    BinaryTree tree;
    tree.insert(1);
    tree.insert(2);
    tree.insert(3);
    vector<int> result = tree.postorderTraversal();
    vector<int> expected = {2, 3, 1};
    assert(compareVectors(result, expected));
    cout << "testPostorderTraversal passed" << endl;
}

void testLevelOrderTraversal() {
    BinaryTree tree;
    tree.insert(1);
    tree.insert(2);
    tree.insert(3);
    tree.insert(4);
    tree.insert(5);
    vector<int> result = tree.levelOrderTraversal();
    vector<int> expected = {1, 2, 3, 4, 5};
    assert(compareVectors(result, expected));
    cout << "testLevelOrderTraversal passed" << endl;
}

int main() {
    cout << "Running Binary Tree tests..." << endl;
    testInsertAndSearch();
    testIsEmpty();
    testSize();
    testHeight();
    testInorderTraversal();
    testPreorderTraversal();
    testPostorderTraversal();
    testLevelOrderTraversal();
    cout << "\nAll tests passed! ✓" << endl;
    return 0;
}

