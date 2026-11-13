/**
 * Test cases for Cartesian Tree (C++)
 */

#include <iostream>
#include <vector>
#include <cassert>
#include <type_traits>
#include <cstdlib>
#include "cartesian_tree.cpp"

void testBuildFromArray() {
    std::vector<int> array = {9, 3, 7, 1, 8, 12, 10, 20, 15, 18, 5};
    CartesianTree tree(array);
    
    std::vector<int> result = tree.inorderTraversal();
    assert(result == array);
    
    std::cout << "Build from array test passed" << std::endl;
}

void testEmptyArray() {
    std::vector<int> array;
    CartesianTree tree(array);
    assert(tree.isEmpty());
    assert(tree.inorderTraversal().empty());
    assert(tree.size() == 0);
    
    std::cout << "Empty array test passed" << std::endl;
}

void testSingleElement() {
    std::vector<int> array = {42};
    CartesianTree tree(array);
    assert(!tree.isEmpty());
    assert(tree.inorderTraversal() == array);
    assert(tree.root->value == 42);
    assert(tree.size() == 1);
    
    std::cout << "Single element test passed" << std::endl;
}

void testSortedArray() {
    std::vector<int> array = {1, 2, 3, 4, 5};
    CartesianTree tree(array);
    assert(tree.inorderTraversal() == array);
    assert(tree.getRootValue() == 1);
    
    std::cout << "Sorted array test passed" << std::endl;
}

void testTraversals() {
    std::vector<int> array = {9, 3, 7, 1, 8};
    CartesianTree tree(array);
    
    std::vector<int> inorder = tree.inorderTraversal();
    assert(inorder == array);
    
    std::vector<int> preorder = tree.preorderTraversal();
    assert(preorder[0] == 1);  // Root should be minimum
    
    std::cout << "Traversals test passed" << std::endl;
}

void testSize() {
    std::vector<int> array = {9, 3, 7, 1, 8, 12, 10};
    CartesianTree tree(array);
    assert(tree.size() == array.size());
    
    std::cout << "Size test passed" << std::endl;
}

// Regression: the class owns raw pointers; copying used to double free.
static_assert(!std::is_copy_constructible<CartesianTree>::value, "must not be copyable");
static_assert(!std::is_copy_assignable<CartesianTree>::value, "must not be copyable");

void testMinIndexMatchesBruteForce() {
    unsigned seed = 17;
    for (int round = 0; round < 60; round++) {
        std::vector<int> array;
        seed = seed * 1103515245u + 12345u;
        int n = 1 + (int)((seed >> 16) % 25);
        for (int i = 0; i < n; i++) {
            seed = seed * 1103515245u + 12345u;
            array.push_back((int)((seed >> 16) % 11) - 5);
        }
        CartesianTree tree(array);
        for (int l = 0; l < n; l++) {
            for (int r = l; r < n; r++) {
                int best = l;
                for (int k = l; k <= r; k++) {
                    if (array[k] < array[best]) best = k;
                }
                assert(tree.getMinIndex(l, r) == best);
            }
        }
    }
    CartesianTree small({4, 2, 6});
    assert(small.getMinIndex(2, 1) == -1);
    std::cout << "Min index vs brute force test passed" << std::endl;
}

void testDeepSortedArray() {
    // Regression: the recursive destructor and size() crashed on 1,000,000 sorted values.
    std::vector<int> array(1000000);
    for (int i = 0; i < 1000000; i++) array[i] = i;
    CartesianTree tree(array);
    assert(tree.size() == 1000000);
    assert(tree.height() == 999999);
    assert(tree.inorderTraversal() == array);
    std::cout << "Deep sorted array test passed" << std::endl;
}

void testRebuildReleasesOldTree() {
    // Regression: buildFromArray overwrote root without freeing (leak, visible to LeakSanitizer).
    CartesianTree tree({3, 1, 2});
    tree.buildFromArray({9, 8, 7, 6});
    assert(tree.size() == 4);
    assert(tree.getRootValue() == 6);
    tree.buildFromArray({});
    assert(tree.isEmpty());
    std::cout << "Rebuild test passed" << std::endl;
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
    testMinIndexMatchesBruteForce();
    testDeepSortedArray();
    testRebuildReleasesOldTree();
    
    std::cout << std::endl;
    std::cout << "All tests passed!" << std::endl;
    
    return 0;
}

