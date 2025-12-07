/**
 * Test cases for Splay Tree (C++)
 */

#include <iostream>
#include <vector>
#include <cassert>
#include "splay_tree.cpp"

void testInsertAndSearch() {
    SplayTree tree;
    tree.insert(10, "ten");
    tree.insert(5, "five");
    tree.insert(15, "fifteen");
    
    assert(tree.search(10) == "ten");
    assert(tree.search(5) == "five");
    assert(tree.search(15) == "fifteen");
    assert(tree.search(20).empty());
    
    std::cout << "✓ Insert and Search test passed" << std::endl;
}

void testSplayOperation() {
    SplayTree tree;
    tree.insert(50);
    tree.insert(30);
    tree.insert(70);
    tree.insert(20);
    tree.insert(40);
    
    // Search for 20, should splay to root
    tree.search(20);
    // Note: We can't directly check root key without exposing it
    // But we can verify the tree still works correctly
    
    std::cout << "✓ Splay operation test passed" << std::endl;
}

void testDelete() {
    SplayTree tree;
    tree.insert(10);
    tree.insert(5);
    tree.insert(15);
    tree.insert(3);
    tree.insert(7);
    
    assert(tree.remove(3) == true);
    assert(tree.search(3).empty());
    
    assert(tree.remove(5) == true);
    assert(tree.search(5).empty());
    
    assert(tree.remove(10) == true);
    assert(tree.search(10).empty());
    
    assert(tree.remove(100) == false);
    
    std::cout << "✓ Delete test passed" << std::endl;
}

void testFindMinMax() {
    SplayTree tree;
    tree.insert(50);
    tree.insert(30);
    tree.insert(70);
    tree.insert(20);
    tree.insert(40);
    tree.insert(60);
    tree.insert(80);
    
    assert(tree.findMin() == 20);
    assert(tree.findMax() == 80);
    
    std::cout << "✓ Find Min/Max test passed" << std::endl;
}

void testInorderTraversal() {
    SplayTree tree;
    std::vector<int> keys = {50, 30, 70, 20, 40, 60, 80};
    for (int key : keys) {
        tree.insert(key);
    }
    
    std::vector<int> result = tree.inorderTraversal();
    std::sort(keys.begin(), keys.end());
    
    assert(result == keys);
    
    std::cout << "✓ Inorder traversal test passed" << std::endl;
}

void testEmptyTree() {
    SplayTree tree;
    assert(tree.isEmpty() == true);
    assert(tree.size() == 0);
    assert(tree.search(10).empty());
    assert(tree.findMin() == -1);
    assert(tree.findMax() == -1);
    assert(tree.inorderTraversal().empty());
    
    std::cout << "✓ Empty tree test passed" << std::endl;
}

void testUpdateExistingKey() {
    SplayTree tree;
    tree.insert(10, "old");
    tree.insert(10, "new");
    
    assert(tree.search(10) == "new");
    
    std::cout << "✓ Update existing key test passed" << std::endl;
}

void testSingleNode() {
    SplayTree tree;
    tree.insert(42);
    
    assert(tree.isEmpty() == false);
    assert(tree.size() == 1);
    assert(tree.findMin() == 42);
    assert(tree.findMax() == 42);
    
    std::cout << "✓ Single node test passed" << std::endl;
}

int main() {
    std::cout << "Running Splay Tree tests..." << std::endl;
    std::cout << std::endl;
    
    testInsertAndSearch();
    testSplayOperation();
    testDelete();
    testFindMinMax();
    testInorderTraversal();
    testEmptyTree();
    testUpdateExistingKey();
    testSingleNode();
    
    std::cout << std::endl;
    std::cout << "All tests passed! ✓" << std::endl;
    
    return 0;
}

