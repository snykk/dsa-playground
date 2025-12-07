/**
 * Test cases for Cartesian Tree (C++)
 */

#include <iostream>
#include <vector>
#include <cassert>
#include "cartesian_tree.cpp"

void testBuildFromArray() {
    std::vector<int> array = {9, 3, 7, 1, 8, 12, 10, 20, 15, 18, 5};
    CartesianTree tree(array);
    
    std::vector<int> result = tree.inorderTraversal();
    assert(result == array);
    
    std::cout << "✓ Build from array test passed" << std::endl;
}

void testEmptyArray() {
    std::vector<int> array;
    CartesianTree tree(array);
    assert(tree.isEmpty());
    assert(tree.inorderTraversal().empty());
    assert(tree.size() == 0);
    
    std::cout << "✓ Empty array test passed" << std::endl;
}

void testSingleElement() {
    std::vector<int> array = {42};
    CartesianTree tree(array);
    assert(!tree.isEmpty());
    assert(tree.inorderTraversal() == array);
    assert(tree.root->value == 42);
    assert(tree.size() == 1);
    
    std::cout << "✓ Single element test passed" << std::endl;
}

void testSortedArray() {
    std::vector<int> array = {1, 2, 3, 4, 5};
    CartesianTree tree(array);
    assert(tree.inorderTraversal() == array);
    assert(tree.getRootValue() == 1);
    
    std::cout << "✓ Sorted array test passed" << std::endl;
}

void testTraversals() {
    std::vector<int> array = {9, 3, 7, 1, 8};
    CartesianTree tree(array);
    
    std::vector<int> inorder = tree.inorderTraversal();
    assert(inorder == array);
    
    std::vector<int> preorder = tree.preorderTraversal();
    assert(preorder[0] == 1);  // Root should be minimum
    
    std::cout << "✓ Traversals test passed" << std::endl;
}

void testSize() {
    std::vector<int> array = {9, 3, 7, 1, 8, 12, 10};
    CartesianTree tree(array);
    assert(tree.size() == array.size());
    
    std::cout << "✓ Size test passed" << std::endl;
}

int main() {
    std::cout << "Running Cartesian Tree tests..." << std::endl;
    std::cout << std::endl;
    
    testBuildFromArray();
    testEmptyArray();
    testSingleElement();
    testSortedArray();
    testTraversals();
    testSize();
    
    std::cout << std::endl;
    std::cout << "All tests passed! ✓" << std::endl;
    
    return 0;
}

